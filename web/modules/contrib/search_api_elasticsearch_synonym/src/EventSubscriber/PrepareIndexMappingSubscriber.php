<?php

namespace Drupal\search_api_elasticsearch_synonym\EventSubscriber;

use Drupal\elasticsearch_connector\Event\PrepareIndexMappingEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\search_api_elasticsearch_synonym\Form\SearchApiElasticsearchSynonymSettingsForm;


/**
 * Class EntityTypeSubscriber.
 *
 * @package Drupal\search_api_elasticsearch_synonym\EventSubscriber
 */
class PrepareIndexMappingSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   *
   * @return array
   *   The event names to listen for, and the methods that should be executed.
   */
  public static function getSubscribedEvents() {
    return [
      PrepareIndexMappingEvent::PREPARE_INDEX_MAPPING => 'prepareIndexMapping',
    ];
  }

  /**
   * @param \Drupal\elasticsearch_connector\Event\PrepareIndexMappingEvent $event
   */
  public function prepareIndexMapping(PrepareIndexMappingEvent $event) {
    $config = \Drupal::config(SearchApiElasticsearchSynonymSettingsForm::SETTINGS);
    if ($config->get('enable')) {
      $mappingParams = $event->getIndexMappingParams();
      if (isset($mappingParams['type'])) {
        $indexKey = $mappingParams['type'];
        foreach ($mappingParams['body'][$indexKey]['properties'] as $key => $property) {
          if ($property['type'] == 'text') {
            $mappingParams['body'][$indexKey]['properties'][$key]['analyzer'] = $mappingParams['body'][$indexKey]['properties'][$key]['analyzer'] ?? 'standard';
            $mappingParams['body'][$indexKey]['properties'][$key]['search_analyzer'] = 'synonym';
          }
        }
      } else {
        foreach ($mappingParams['body']['properties'] as $key => $property) {
          if ($property['type'] == 'text') {
            $mappingParams['body']['properties'][$key]['analyzer'] = $mappingParams['body']['properties'][$key]['analyzer'] ?? 'standard';
            $mappingParams['body']['properties'][$key]['search_analyzer'] = 'synonym';
          }
        }
      }
      $event->setIndexMappingParams($mappingParams);
    }
  }
}
