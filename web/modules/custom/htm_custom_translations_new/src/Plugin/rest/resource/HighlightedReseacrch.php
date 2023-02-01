<?php

namespace Drupal\htm_custom_translations_new\Plugin\rest\resource;

use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "highlighted_research",
 *   label = @Translation("Highlighted research"),
 *   uri_paths = {
 *     "canonical" = "api/highlighted_research"
 *   }
 * )
 */
class HighlightedReseacrch extends ResourceBase {

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;
  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new BaseSettingsRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
          $plugin_id,
          $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    LanguageManagerInterface $languageManager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->languageManager = $languageManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('graphql_custom_translation'),
      $container->get('current_user'),
      $container->get('language_manager')
    );
  }

  /**
   * Responds to GET requests.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {
    $data = [];
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'studypage')
      ->condition('field_custom_boolean', "1")
      ->sort('created','DESC')
      ->range(0,1)
      ->accessCheck(TRUE);
    $results = $query->execute();
    if (!empty($results)) {
      $loaded = Node::loadMultiple($results);
      $data = $this->mapLoadedData($loaded);
    }
    else{
      $data = [
        'status' => 403,
        'type' => 'not_found',
        'message' => t('No highlihgted research found')
      ];
    }
    $response = new jsonResponse($data, 200);
    return $response;
  }
  private function entityFields(){
    return [
      'title' => 'title',
      'nid' => 'nid',
      'entityUrl' => 'url',
    ];
  }
  private function entityEntityFields(){
    return [
      'fieldLabel' =>
        [
          'field' =>  'field_label',
          'type' => 'taxonomy'
        ],
      'fieldStudyTag' =>
        [
          'field' =>  'field_study_tag',
          'type' => 'taxonomy'
        ],
      'fieldRightColumn' => [
        'field' => 'field_right_column',
        'type' => 'paragraph',
        'child' => [
          'fieldStudy' => [
            'field' => 'field_study',
            'type' => 'paragraph',
            'child' => [
              'fieldAuthor' => 'field_author',
              'fieldYear' => 'field_year',
              'fieldPublicationType' => [
                'type' => 'taxonomy',
                'field' => 'field_publication_type',
              ]
            ]
          ],
        ]
      ],
    ];
  }
  private function mapLoadedData($entities) {
    if (empty($entities)) {
      return [
        'status' => 403,
        'type' => 'not_found',
      ];
    }
    $data = [];
    $data['status'] = 200;
    foreach ($entities as $entity) {
      $nid = $entity->get('nid')->value;
      foreach ($this->entityFields() as $field_key => $field) {
        if ($entity->hasField($field)) {
          $data['values'][$nid][$field_key] =$entity->get($field)->value;
        }
        if ($field_key == 'url') {
          $data['values'][$nid]['entityUrl'] =  \Drupal::service('path_alias.manager')->getAliasByPath('/node/'.$nid);
        }
      }
      foreach ($this->entityEntityFields() as $entityfieldkey => $entityField) {
        if ($entity->hasField($entityField['field'])) {
          $referencedEntities = $entity->get($entityField['field'])->referencedEntities();
          if (empty($referencedEntities)) {
            continue;
          }
          $array_info = [];
          foreach ($referencedEntities as $referencedEntity) {
            if ($entityField['type'] == 'taxonomy') {
              $array_info_new = [
                'entityId' => $referencedEntity->get('tid')->value,
                'entityLabel' => $referencedEntity->get('name')->value,
              ];
              if (!empty($array_info)) {
                $array_info_old = $array_info;
                $array_info = [];
                $array_info[] = $array_info_old;
                $array_info[] = $array_info_new;
              }
              else{
                $array_info = $array_info_new;
              }
            }
            $data['values'][$nid][$entityfieldkey]['entity'] = $array_info;
            if ($entityField['type'] == 'paragraph') {
              if (!empty($entityField['child'])) {
                foreach ($entityField['child'] as $parakey => $para) {
                  if ($referencedEntity->hasField($para['field'])){
                    $para_ents = $referencedEntity->get($para['field'])->referencedEntities();
                  }
                  if (empty($para_ents)) {
                    continue;
                  }
                  foreach ($para_ents as $paras) {
                  if (!empty($para['child'])) {
                    foreach ($para['child'] as $parapar_key => $parapara) {
                      if (!is_array($parapara)){
                       if ($paras->hasField($parapara)){
                         $parapara_values = $paras->get($parapara)->getValue();
                         if (!empty($parapara_values)) {
                           foreach ($parapara_values as $parapara_value) {
                             $data['values'][$nid][$entityfieldkey]['entity'][$parakey]['entity'][$parapar_key][] = $parapara_value['value'];
                           }
                         }
                       }
                      }
                      else{
                        if ($parapara['type'] == 'taxonomy') {
                          if ($paras->hasField($parapara['field'])) {
                            $tax_refs = $paras->get($parapara['field'])->referencedEntities();
                            if (!empty($tax_refs)) {
                              foreach($tax_refs as $tax_ref) {
                                $data['values'][$nid][$entityfieldkey]['entity'][$parakey]['entity'][$parapar_key][] =[
                                  'entityId' => $tax_ref->get('tid')->value,
                                  'entityLabel' => $tax_ref->get('name')->value,
                                ];
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  }
                }
              }
            }
          }
        }
      }
    }
    return $data;
  }

}
