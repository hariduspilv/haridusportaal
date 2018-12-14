<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Event;

use Symfony\Component\EventDispatcher\Event;
use Drupal\elasticsearch_connector\Event\PrepareIndexEvent;

/**
 * Class CustomPrepareIndexEvent
 *
 * @package Drupal\htm_custom_graphql_elasticsearch\Event
 */
class CustomPrepareIndexEvent extends PrepareIndexEvent {

  /**
   * Setter for the index config array.
   *
   * @param $indexConfig
   */
  public function setIndexConfig($indexConfig) {

      $indexConfig['body']['settings']['analysis']['analyzer']['default'] = [
          'tokenizer' => 'whitespace',
          'filter' => [
              'lowercase'
          ]
      ];

      kint('jou');
      die();

      function my_module_search_page_submit($form, FormStateInterface $form_state) {
          $form_values = $form_state->getValues();
      }

    $this->indexConfig = $indexConfig;
  }
}
