<?php

namespace Drupal\htm_custom_rest\Plugin\rest\resource;


use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;


/**
 * Represents Product list rest records as resources.
 *
 * @RestResource (
 *   id = "htm_custom_rest_list_view",
 *   label = @Translation("HTM Entity list rest"),
 *   uri_paths = {
 *     "canonical" = "/api/list",
 *   }
 * )
 *
 * @DCG
 * This plugin exposes database records as REST resources. In order to enable it
 * import the resource configuration into active configuration storage. You may
 * find an example of such configuration in the following file:
 * core/modules/rest/config/optional/rest.resource.entity.node.yml.
 * Alternatively you can make use of REST UI module.
 * @see https://www.drupal.org/project/restui
 * For accessing Drupal entities through REST interface use
 * \Drupal\rest\Plugin\rest\resource\EntityResource plugin.
 */
class ListResource extends ResourceBase {


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

  private $entityDisplayRepository;

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
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   * @param \Drupal\Core\Database\Connection $database
   *   Database connection.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    LanguageManagerInterface $languageManager,
    EntityTypeManagerInterface $entityTypeManager,
    Connection $database,
    EntityDisplayRepositoryInterface $entityDisplayRepository
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->languageManager = $languageManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->db = $database;
    $this->entityDisplayRepository = $entityDisplayRepository;
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
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('database'),
      $container->get('entity_display.repository')

    );
  }
  /**
   * Responds to GET requests.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return ResourceResponse
   *   The response containing the record.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   */
  public function get(Request $request) {
    // Set default range if not provided.
    $params = $request->query->all();
    $params['limit'] = $params['limit'] ?? 24;

    // Get entities and count.
    $entities = $this->queryEntities($params, FALSE);
    $count = $this->queryEntities($params, TRUE);

    // Get fields for the view mode and filter the field values.
    $fields = $this->getViewModeFields('node', $params['content_type'], 'list');
    $returnable_values = $this->filterFieldsAndReturnValues($entities, $fields, 'list');

    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    $cachable_response = new CacheableResponse(json_encode($returnable_values));
    $cachable_response->addCacheableDependency($params);
//    $cachable_response = new ResourceResponse($returnable_values);
    return $cachable_response;
  }

  private function queryEntities($filters, $count) {
    $db = $this->db;
    $table_alias = 'n';
    $query = $db->select('node', $table_alias);

    if (isset($filters['content_type'])) {
      $query->condition('n.type', $filters['content_type']);
      switch ($filters['content_type']) {
        case 'studypage':
          $base_query = $db->select('node', 'n');
          $base_query->fields('n', ['nid']);

          if (!empty($filters)) {
            $subquery = $this->buildSubquery($db, $filters);
            $base_query->condition('n.nid', $subquery, 'IN');
          }

          $base_query->join('node_field_data', 'nfd', 'n.nid = nfd.nid');
          $base_query->condition('nfd.status', 1);
          $base_query->orderBy('nfd.created', 'DESC');

          if ($count) {
            $count_query = $base_query->countQuery();
            return $count_query->execute()->fetchField();
          }

          $offset = isset($filters['offset']) ? $filters['offset'] : 0;
          $limit = isset($filters['limit']) ? $filters['limit'] : 16;
          $base_query->range($offset, $limit);

          $nids = $base_query->execute()->fetchCol();
          return $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
      }
    }
  }

  private function buildSubquery($db, $filters) {
      $subquery = $db->select('node', 'n');
      $subquery->fields('n', ['nid']);
      $aliases = [];
      if (!empty($filters['titleValue'])) {
        $subquery->join('node_field_data','nfd','n.nid=nfd.nid');
        $subquery->join('node__field_content','nfc','n.nid=nfc.entity_id');
        $subquery->join('node__field_introduction','nfi','n.nid=nfi.entity_id');
        // Akkordion fields
        $subquery->join('node__field_accordion','nfa','n.nid=nfa.entity_id');
        $subquery->join('paragraph__field_study_accordion_intro','pfsai','nfa.field_accordion_target_id=pfsai.entity_id');
        $subquery->join('paragraph__field_study_accordion_content','pfsac','nfa.field_accordion_target_id=pfsac.entity_id');
        $subquery->join('paragraph__field_body','pfb','nfa.field_accordion_target_id=pfb.entity_id');
        // Right side fields
        $subquery->join('node__field_right_column','nfrc','n.nid=nfrc.entity_id');
        $subquery->join('paragraph__field_study','pfs','nfrc.field_right_column_target_id=pfs.entity_id');
        $subquery->join('paragraph__field_publisher','pfp','pfs.field_study_target_id=pfp.entity_id');
        $subquery->join('paragraph__field_author','pfa','pfs.field_study_target_id=pfa.entity_id');

        $or_group = $subquery->orConditionGroup();
        $or_group->condition('nfd.title',$filters['titleValue'],'LIKE');
        $or_group->condition('nfc.field_content_value',$filters['titleValue'],'LIKE');
        $or_group->condition('nfi.field_introduction_value',$filters['titleValue'],'LIKE');
        $or_group->condition('pfsai.field_study_accordion_intro_value',$filters['titleValue'],'LIKE');
        $or_group->condition('pfsac.field_study_accordion_content_value',$filters['titleValue'],'LIKE');
        $or_group->condition('pfb.field_body_value',$filters['titleValue'],'LIKE');
        $or_group->condition('pfp.field_publisher_value',$filters['titleValue'],'LIKE');
        $or_group->condition('pfa.field_author_value',$filters['titleValue'],'LIKE');

        $subquery->condition($or_group);
      }

      if (!empty($filters['studyLabelValue'])) {
        $filter_vals = explode(';',$filters['studyLabelValue']);
        $subquery->join('node__field_label','nfsl','n.nid=nfsl.entity_id');
        $or_group = $subquery->orConditionGroup();
        foreach ($filter_vals as $filter_val) {
          $or_group->condition('nfsl.field_label_target_id', $filter_val);
        }
        $subquery->condition($or_group);
      }
    if (!empty($filters['studyTopicValue'])){
      $filter_vals = explode(';',$filters['studyTopicValue']);
      $subquery->join('node__field_study_topic','nfst','n.nid=nfst.entity_id');
      $or_group = $subquery->orConditionGroup();
      foreach ($filter_vals as $filter_val) {
        $or_group->condition('nfst.field_study_topic_target_id', $filter_val);
      }
      $subquery->condition($or_group);
    }
    if (!empty($filters['publicationTypeValue'])){
      $or_group = $subquery->orConditionGroup();
      $subquery->join('node__field_right_column','nfrc','n.nid=nfrc.entity_id');
      $subquery->join('paragraph__field_study','pfs','nfrc.field_right_column_target_id=pfs.entity_id');
      $subquery->join('paragraph__field_publication_type','pfpt','pfs.field_study_target_id=pfpt.entity_id');
      $publication_types = explode(';',$filters['publicationTypeValue']);
      foreach ($publication_types as $publication_type) {
        $or_group->condition('pfpt.field_publication_type_target_id', $publication_type);
      }
      $subquery->condition($or_group);
    }
    if (!empty($filters['publicationLanguageValue'])){
      $or_group = $subquery->orConditionGroup();
      $subquery->join('node__field_right_column','nfrc','n.nid=nfrc.entity_id');
      $subquery->join('paragraph__field_study','pfs','nfrc.field_right_column_target_id=pfs.entity_id');
      $subquery->join('paragraph__field_publication_lang','pfpl','pfs.field_study_target_id=pfpl.entity_id');
      $publication_langss = explode(';',$filters['publicationLanguageValue']);
      foreach ($publication_langss as $publication_lang) {
        $or_group->condition('pfpl.field_publication_lang_target_id', $publication_lang);
      }
      $subquery->condition($or_group);
    }
    if (!empty($filters['dateFrom'])){
      $subquery->join('node__field_right_column','nfrc','n.nid=nfrc.entity_id');
      $subquery->join('paragraph__field_study','pfs','nfrc.field_right_column_target_id=pfs.entity_id');
      $subquery->join('paragraph__field_year','pfy','pfs.field_study_target_id=pfy.entity_id');
      $subquery->condition('pfy.field_year_value', intval($filters['dateFrom']),'>=');
    }
    if (!empty($filters['dateTo'])){
      $subquery->join('node__field_right_column','nfrc','n.nid=nfrc.entity_id');
      $subquery->join('paragraph__field_study','pfs','nfrc.field_right_column_target_id=pfs.entity_id');
      $subquery->join('paragraph__field_year','pfy','pfs.field_study_target_id=pfy.entity_id');
      $subquery->condition('pfy.field_year_value', intval($filters['dateTo']),'<=');
    }
    // Implement the subquery logic here, based on the original query
    // This subquery should return the relevant nids based on the applied filters
    return $subquery;
  }


  /**
   * Get fields for a specific view mode.
   *
   * @param string $entity_type
   *   The entity type machine name.
   * @param string $bundle
   *   The bundle name for entity.
   * @param string $view_mode
   *   The view mode machine name.
   *
   * @return array
   *   An array of fields for the specified view mode.
   */
  private function getViewModeFields(string $entity_type, string $bundle, string $view_mode) {
    // Use dependency injection for the entity display repository.
    $entityDisplayRepository = $this->entityDisplayRepository;

    // Load the entity display for the specified content type and view mode.
    $entityDisplay = $entityDisplayRepository->getViewDisplay($entity_type, $bundle, $view_mode);
    $fields = $entityDisplay->getComponents();

    if (empty($fields)) {
      throw new \RuntimeException('No fields defined in drupal admin for the specified view mode.');
    }

    return $fields;
  }


  /**
   * Filters and returns values of the given fields for the given entities.
   *
   * @param array $entities
   *   An array of entity objects.
   * @param array $fields
   *   An associative array of fields with field names as keys.
   * @param string $view_mode
   *   The view mode for rendering the entities.
   * @param bool $field_mode
   *   TRUE if field mode is enabled, FALSE otherwise.
   *
   * @return array
   *   An array of filtered field values for the given entities.
   */
  public function filterFieldsAndReturnValues($entities, $fields, $view_mode, $field_mode = FALSE) {
    $values = [];

    // Return an empty array if no entities or fields are provided.
    if (empty($entities) || empty($fields)) {
      return $values;
    }

    // Iterate through each entity.
    foreach ($entities as $entity) {
      $id = $entity->id();
      $entity_type_id = $entity->getEntityTypeId();

      // If not in field mode, set default values for nodes.
      if (!$field_mode) {
        $values[$id] = [];

        if ($entity_type_id == 'node') {
          $values[$id]['nid'] = $entity->id();
          $values[$id]['path'] = $entity->toLink()->getUrl()->toString(TRUE)->getGeneratedUrl();
        }
      }

      // Iterate through each field.
      foreach ($fields as $field_name => $field) {
        if (!$entity->hasField($field_name)){
          continue;
        }

        $field_value = '';
        $field_name_out = $this->camelize($field_name);

        // Process fields based on their type.
        switch ($field['type']) {
          case 'entity_reference_revisions_entity_view':
          case 'entity_reference_label':
            $field_value = $this->processReferenceFields($entity, $field_name, $view_mode);
            break;
          case 'image':
            // Load the image style.
            $image_style = ImageStyle::load('crop_small');

            // Get the file entities from the image field.
            $field_data = $entity->get($field_name)->referencedEntities();

            // Loop through the file entities.
            foreach ($field_data as $field_datum) {
              // Generate the styled image URL.
              $styled_image_url = $image_style->buildUrl($field_datum->getFileUri());

              // Create an array with the styled image URL.
              $field_value = [
                'url' => $styled_image_url,
              ];
            }

            // Get the alt and title attributes from the image field.
            $alt = $entity->get($field_name)->alt;
            $title = $entity->get($field_name)->title;

            // Add the alt and title attributes to the field value array if they exist.
            if (!empty($alt)) {
              $field_value['alt'] = $alt;
            }
            if (!empty($title)) {
              $field_value['title'] = $title;
            }
            break;
          case 'custom_video_formatter_type':
            $field_value = [];
            $videos = $entity->get($field_name)->getValue();
            $video_fields = [
              'input',
              'video_domain',
              'video_description',
              'video_id',
              'video_thumbnail',
            ];
            foreach ($videos as $video_key => $video) {
              foreach ($video_fields as $video_field) {
                $video_field_name = $this->camelize($video_field);
                // Check if the video field exists in the current video.
                if (isset($video[$video_field])) {
                  $field_value[$video_key][$video_field_name] = $video[$video_field];
                }
              }
            }
            break;
          case 'link':
            $field_link = $entity->get($field_name);
            break;
          case 'string':
          case 'basic_string':
          case 'number_integer':
          case 'text_default':
          case 'boolean':
            $field_value = $entity->get($field_name)->getValue();
            break;
          default:
            break;
        }

        // Assign field values to the output array.
        if ($field_mode) {
          $values[$field_name_out] = $field_value;
        } else {
          $values[$id][$field_name_out] = $field_value;
        }
      }
    }

    return $values;
  }

  /**
   * Processes and returns values for reference fields.
   *
   * @param object $entity
   *   The entity object.
   * @param string $field_name
   *   The name of the field to process.
   * @param string $view_mode
   *   The view mode for rendering the entities.
   *
   * @return array
   *   An array of processed field values.
   */
  private function processReferenceFields($entity, $field_name, $view_mode) {
    $field_value = [];
    $referenced_entities = $entity->get($field_name)->referencedEntities();
    $field_list = [];

    // Iterate through each referenced entity.
    foreach ($referenced_entities as $referenced_entity) {
      $referenced_entity_type = $referenced_entity->getEntityTypeId();
      $referenced_entity_id = $referenced_entity->id();

      // Process referenced entities based on their type.
      if ($referenced_entity_type === 'taxonomy_term') {
        // If the referenced entity is a taxonomy term, add its name to the field value.
        $field_value[$referenced_entity_id] = $referenced_entity->get('name')->value;
      } elseif ($referenced_entity_type === 'paragraph') {
        // If the referenced entity is a paragraph, process its fields and add them to the field value.
        $para_type = $referenced_entity->bundle();

        // Get field list only once for the first paragraph of the same type.
        if (empty($field_list[$para_type])) {
          $field_list[$para_type] = $this->getViewModeFields('paragraph', $para_type, $view_mode);
        }

        // Process paragraph fields and add them to the field value.
        $field_value[$referenced_entity_id] = $this->filterFieldsAndReturnValues([$referenced_entity], $field_list[$para_type], $view_mode, TRUE);
      }
    }

    return $field_value;
  }


  public function camelize($input, $separator = '_')
  {
    return lcfirst(str_replace($separator, '', ucwords($input, $separator)));
  }
}
