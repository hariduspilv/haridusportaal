<?php

namespace Drupal\content_sync\Content;

use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Entity\ContentEntityType;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Help convert db content entities to YAML.
 */
class ContentSyncExport {

  /**
   * The active content object.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;


  /**
   * Constructs the object.
   *
   * @param \Drupal\Core\Config\StorageInterface $active_storage
   *   The target storage.
   */
  public function __construct(StorageInterface $active_storage) {
    $this->activeStorage = $active_storage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('content.storage.active')
    );
  }

  /**
   * Batch worker function.
   *
   * Need to be in global visibility.
   *
   * @param $files
   *   Entity array.
   * @param $context
   *   Batch API context array.
   */
  public function processContentSyncSnapshot($files, &$context) {
    //Initialize Batch
    if ( empty($context['sandbox']) ) {
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['current_number'] = 0;
      $context['sandbox']['max'] = count($files);
    }
    // Get submitted values
    $entity_type = $files[$context['sandbox']['progress']]['entity_type'];
    $entity_bundle = $files[$context['sandbox']['progress']]['entity_bundle'];
    $entity_id = $files[$context['sandbox']['progress']]['entity_id'];

    //Validate that it is a Content Entity
    $entityTypeManager = \Drupal::entityTypeManager();
    $instances = $entityTypeManager->getDefinitions();
    if ( !(isset($instances[$entity_type]) && $instances[$entity_type] instanceof ContentEntityType) ) {
      $context['results']['errors'][] = t('Entity type does not exist or it is not a content instance.') . $entity_type;
    }
    else {
      // Store the data for diff

      $entityTypeManager = \Drupal::entityTypeManager();
      $entityFieldManager = \Drupal::service('entity_field.manager');

      // Get Entity Fields.
      $fields = array_filter(
        $entityFieldManager->getFieldDefinitions($entity_type, $entity_bundle), function ($field_definition) {
        return $field_definition;
      }
      );

      // Initialize array of elements to export.
      $entity_elements = [];
      foreach ($fields as $fieldID => $field) {
        $entity_elements[$field->getName()] = $field->getName();
      }

      // Get Entity Properties - to know the id and bundle fields.
      $properties = $entityTypeManager->getDefinitions()[$entity_type]->getKeys();

      // Get data to fill the yaml.
      $entity_data = $entityTypeManager->getStorage($entity_type)->load($entity_id);
      $entity = [];
      $entity['entity_type'] = $entity_type;
      $entity['bundle'] = $entity_bundle;

      //Include Site UUID
      $site_config = \Drupal::config('system.site');
      $site_uuid_source = $site_config->get('uuid');
      $entity['site_uuid'] = $site_uuid_source;

      // Remove property ID as we are gonna use UUID to avoid conflicts.
      unset($entity_elements[$properties['id']]);
      // Remove bundle as it is defined already
      unset($entity_elements[$properties['bundle']]);
      // Remove vid to avoid conflicts w/versions
      unset($entity_elements['vid']);
      // Filter array
      $entity_elements = array_filter($entity_elements);

      //Get entity values
      foreach ($entity_elements as $elementID => $element) {
        //Include parent UUID if it exist
        if ($element == 'parent') {
          $parent = $entityTypeManager->getStorage($entity_type)->loadParents($entity_id);
          $parent = reset($parent);
          if ( !empty($parent) ) {
            $entity['values'][0][$element] = $parent->uuid();
          }
        }else {
          $entity['values'][0][$element] = $entity_data->get($element)
            ->getValue();
        }
        //Check if it is an entity reference and use UUID instead of target id.
        $element_type = $entity_data->get($element)
          ->getFieldDefinition()
          ->getType();
        if ( $element_type == "entity_reference" ||
          $element_type == "image" ||
          $element_type == "file"
        ) {
          if ( $entity_data->get($element)->entity ) {
            $reference_type = $entity_data->get($element)->entity->getEntityType()
              ->id();
            //Loop all the values
            foreach ($entity_data->get($element)
                       ->getValue() as $er_key => $er_val) {
              $entity['values'][0][$element][$er_key]['target_id'] = $entityTypeManager->getStorage($reference_type)
                ->load($er_val['target_id'])
                ->uuid();
            }
          }
        }
      }
      // Exception to get the path as it can not be retrieved as regular value.
      // Not set for image because gives an error.
      //$current_path = \Drupal::service('path.current')->getPath();
      if($entity_type != "file") {
        $entity['values'][0]['path'] = "/" . $entity_data->toUrl()->getInternalPath();
      }

      // Include Translations
      $lang_default = $entity['values'][0]['langcode'][0]['value'];
      foreach ($entity_data->getTranslationLanguages() as $langcode => $language) {
        $c = 0;
        if ( $entity_data->hasTranslation($langcode) ) {
          $entity_data_translation = $entity_data->getTranslation($langcode);
          // Verify that it is not the default langcode.
          if ( $langcode != $lang_default ) {
            foreach ($entity_elements as $elementID => $element) {
              // Only translatable elements for translations
              if ( $fields[$elementID]->isTranslatable() == TRUE ) {
                $entity['values'][0]['translations'][$c][$element] = $entity_data_translation->get($element)
                  ->getValue();

                //Check if it is an entity reference and use UUID instead of target id.
                $element_type = $entity_data_translation->get($element)
                  ->getFieldDefinition()
                  ->getType();
                if ( $element_type == "entity_reference" ||
                  $element_type == "image" ||
                  $element_type == "file"
                ) {
                  if ( $entity_data_translation->get($element)->entity ) {
                    $reference_type = $entity_data_translation->get($element)->entity->getEntityType()
                      ->id();
                    //Loop all the values
                    foreach ($entity_data_translation->get($element)
                               ->getValue() as $er_key => $er_val) {
                      $entity['values'][0]['translations'][$c][$element][$er_key]['target_id'] = $entityTypeManager->getStorage($reference_type)
                        ->load($er_val['target_id'])
                        ->uuid();
                    }
                  }
                }

              }
            }
            //$entity['translations'][$c]['path'] = $entity_data_translation->toUrl()->getInternalPath();
            $c++;
          }
        }
      }


      // Create the name
      $name = $entity_type . "." . $entity_bundle . "." . $entity['values'][0]['uuid'][0]['value'];

      //Write to DB
      $this->activeStorage->write($name,$entity);

      $context['message'] = $name;
      $context['results'][] = $name;
    }
    $context['sandbox']['progress']++;
    if ( $context['sandbox']['progress'] != $context['sandbox']['max'] ) {
      $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
    }
  }


}
