<?php
namespace Drupal\htm_custom_rest\Services;

use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Url;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class FieldsAndViewService {

  private $entityDisplayRepository;

  public function __construct(
    EntityDisplayRepositoryInterface $entityDisplayRepository,
    LanguageManagerInterface $languageManager,
  ){
    $this->entityDisplayRepository = $entityDisplayRepository;
    $this->languageManager = $languageManager;
  }
  public function entryFunctionSingle($request, $entity, $url) {
    if (empty($entity)) {
      return FALSE;
    }
    $entityType = $entity->getEntityTypeId();
    $entiyBundle = $entity->getType();
    $view_mode = 'detailview';
    $fields = $this->getViewModeFields($entityType, $entiyBundle, $view_mode);
    $entities = [$entity];
    $view = $this->filterFieldsAndReturnValues($entities, $fields, $view_mode, FALSE);
    $view = reset($view);
    $language_links = $this->getLanguages($entity);
    return [
      'content' => $view,
      'language_links' => $language_links,
    ];
  }
  public function entryFunctionList() {

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
    if ($bundle == 'study_comparison') {
      $bundle = 'study_programme';
    }
    if ($bundle == 'related_study_programme') {
      $bundle = 'study_programme';
    }
    if ($bundle == 'similar_programmes') {
      $bundle = 'study_programme';
    }
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
  private function filterFieldsAndReturnValues($entities, $fields, $view_mode, $field_mode = FALSE) {
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
        if (isset($entity->subnids)){
          $values[$id]['subentities'] = $this->filterFieldsAndReturnValues($entity->subnids,$fields,$view_mode);
        }
        if (isset($entity->subOska)){
          $values[$id]['reverseOskaMainProfessionOskaIndicatorEntity'] = [];
          foreach ($entity->subOska as $oska) {
            $oska_out = [
              'icon' => $oska->get('icon')->value??null,
              'value' => $oska->get('value')->value??null,
              'oskaIndicator' => $oska->get('oska_indicator')->value??null,
              'oskaId' => $oska->get('oska_id')->value??null,

            ];
            $values[$id]['reverseOskaMainProfessionOskaIndicatorEntity'][] = $oska_out;
          }
        }
        if (isset($entity->subOska2)){
          $values[$id]['reverseOskaMainProfessionOskaFillingBarEntity'] = [];
          foreach ($entity->subOska2 as $oska2) {
            $oska_out = [
              'value' => $oska2->get('value')->value??null,
            ];
            $values[$id]['reverseOskaMainProfessionOskaFillingBarEntity'][] = $oska_out;
          }
        }
      }
      if ($view_mode == 'search' && !$field_mode){
        $fields = $this->getViewModeFields('node',$entity->bundle(),'search');
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

            $field_link = $entity->get($field_name)->getValue();
            $field_value = $field_link;
            break;
          case 'string':
          case 'basic_string':
          case 'number_integer':
          case 'text_default':
          case 'boolean':
            $field_value = $entity->get($field_name)->getValue();
            if (count($field_value) == 1) {
              $field_value = reset($field_value);
              if(isset ($field_value['target_id'])) {
                $field_value = $field_value['target_id'];
              }
              elseif (isset ($field_value['value'])) {
                $field_value = $field_value['value'];
              }
            }
            else{
              $field_value = $this->convertToArray($field_value);
            }
            break;
          default:
            $field_value = $entity->get($field_name)->getValue();
            if (count($field_value) == 1) {
              $field_value = reset($field_value);
              if(isset ($field_value['target_id'])) {
                $field_value = $field_value['target_id'];
              }
              elseif (isset ($field_value['value'])) {
                $field_value = $field_value['value'];
              }
            }
            else{
              $field_value = $this->convertToArray($field_value);
            }
            break;
        }
        if ($view_mode == 'search' && !$field_mode){
          if (!empty($entity->bundle())){
            $values[$id]['content_type'] = $entity->bundle();
          }
        }
        // Assign field values to the output array.
        if (empty($field_value)) {
          $field_value = null;
        }
        if ($field_mode) {

          $values[$field_name_out] = $field_value;
        } else {
          $values[$id][$field_name_out] = $field_value;
        }
      }
    }

    return $values;
  }

  private function convertToArray($objects){
    $output = [];
    foreach ($objects as $object){
      if(isset($object['value'])){
        $output[] = $object['value'];
      }
      else{
        $output[] = reset($object);
      }
    }
    return $output;
  }

  public function camelize($input, $separator = '_')
  {
    return lcfirst(str_replace($separator, '', ucwords($input, $separator)));
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
      }elseif ($referenced_entity_type === 'node') {
        // If the referenced entity is a paragraph, process its fields and add them to the field value.
        $para_type = $referenced_entity->bundle();

        // Get field list only once for the first paragraph of the same type.
        if (empty($field_list[$para_type])) {
          $field_list[$para_type] = $this->getViewModeFields('node', $para_type, $view_mode);
        }

        // Process paragraph fields and add them to the field value.
        $field_value[$referenced_entity_id] = $this->filterFieldsAndReturnValues([$referenced_entity], $field_list[$para_type], $view_mode, TRUE);
      }
    }

    return $field_value;
  }
  private function getLanguages($entity) {
    $links = [];
    $languages = $this->languageManager->getLanguages();
    foreach ($languages as $language) {
      if ($entity->hasTranslation($language->getId())) {
        $translation = $entity->getTranslation($language->getId());
        if (!$translation->isPublished()) {
          continue;
        }
        $links[$language->getId()] = [
          'langcode' => $language->getId(),
          'active' => true,
          'path' => $translation->toLink()->getUrl()->toString(TRUE)->getGeneratedUrl(),
        ];
      }
    }
    return $links;
  }
}
