<?php

namespace Drupal\content_sync\Exporter;

use Drupal\Core\Entity\ContentEntityInterface;
use Symfony\Component\Serializer\Serializer;
use Drupal\Component\Serialization\Yaml;

class ContentExporter implements ContentExporterInterface {

  protected $format = 'yaml';

  protected $serializer;

  protected $context = [];

  /**
   * ContentExporter constructor.
   */
  public function __construct(Serializer $serializer) {
    $this->serializer = $serializer;
  }


  /**
   * @inheritdoc
   */
  public function exportEntity(ContentEntityInterface $entity, array $context = []) {
    $context = $this->context + $context;
    $context += [
      'content_sync' => TRUE,
    ];
    // Allows to know to normalizers that this is a content sync generated entity.
    $entity->is_content_sync = TRUE;
    $normalized_entity = $this->serializer->serialize($entity, $this->format, $context);
//    $return = [
//      'entity_type_id' => $entity->getEntityTypeId(),
//      'entity' => $this->serializer->encode($normalized_entity, $this->format, $context),
//      'original_entity' => $entity,
//    ];

    // Include translations to the normalized entity
    $yaml_parsed = Yaml::decode($normalized_entity);
    $lang_default = \Drupal::languageManager()->getCurrentLanguage()->getId();
    foreach ($entity->getTranslationLanguages() as $langcode => $language) {
      // Verify that it is not the default langcode.
      if ( $langcode != $lang_default ) {
        if ( $entity->hasTranslation($langcode) ) {
          $entity_translated = $entity->getTranslation($langcode);
          $normalized_entity_translations = $this->serializer->serialize($entity_translated, $this->format, $context);
          //$normalized_data['_translations'][$c] = $contentExporter->exportEntity($object_translated, $serializer_context);
          $yaml_parsed['_translations'][$langcode] = Yaml::decode($normalized_entity_translations);
        }
      }
    }
    return Yaml::encode($yaml_parsed);
  }

  /**
   * @return string
   */
  public function getFormat() {
    return $this->format;
  }

  /**
   * @return \Symfony\Component\Serializer\Serializer
   */
  public function getSerializer() {
    return $this->serializer;
  }

}