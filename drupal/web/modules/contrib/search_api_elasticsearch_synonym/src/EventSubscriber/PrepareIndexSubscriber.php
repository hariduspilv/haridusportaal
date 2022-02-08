<?php

namespace Drupal\search_api_elasticsearch_synonym\EventSubscriber;

use Drupal\elasticsearch_connector\Event\PrepareIndexEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\search_api_elasticsearch_synonym\Form\SearchApiElasticsearchSynonymSettingsForm;

/**
 * Class EntityTypeSubscriber.
 *
 * @package Drupal\search_api_elasticsearch_synonym\EventSubscriber
 */
class PrepareIndexSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   *
   * @return array
   *   The event names to listen for, and the methods that should be executed.
   */
  public static function getSubscribedEvents() {
    return [
      PrepareIndexEvent::PREPARE_INDEX => 'prepareIndex',
    ];
  }

  protected function getSynonyms() {
    $config = \Drupal::config(SearchApiElasticsearchSynonymSettingsForm::SETTINGS);
    $synonyms_array = preg_split("/\r\n|\n|\r/",$config->get('synonyms'));
    $synonyms = array();

    foreach ($synonyms_array as $synonyms_line) {
      $parts = explode("#", $synonyms_line);

      if (!empty($parts[0])) {
        $synonyms[] = $parts[0];
      }
    }

    return $synonyms;
  }

  /**
   * @param \Drupal\elasticsearch_connector\Event\PrepareIndexEvent $event
   */
  public function prepareIndex(PrepareIndexEvent $event) {
    $config = \Drupal::config(SearchApiElasticsearchSynonymSettingsForm::SETTINGS);
    if ($config->get('enable')) {
      $indexConfig = $event->getIndexConfig();
      $indexConfig["body"]["settings"]["index"] = array(
        "analysis" => array(
          "analyzer" => array(
            "synonym" => array(
              "tokenizer" => "whitespace",
              "filter" => array(
                "synonym",
              )
            ),
            "standard_hyphen" => array(
              "tokenizer" => "whitespace",
              "filter" => array(
                "lowercase"
              )
            )
          ),
          "filter" => array(
            "synonym" => array(
              "type" => $config->get('token_filter_type') ?? "synonym",
              "lenient" => true,
              "synonyms" => $this->getSynonyms()
            )
          )
        )
      );
      $event->setIndexConfig($indexConfig);
    }
  }
}
