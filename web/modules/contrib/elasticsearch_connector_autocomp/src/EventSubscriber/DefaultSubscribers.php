<?php

namespace Drupal\elasticsearch_connector_autocomp\EventSubscriber;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\Event;

/**
 * Class DefaultSubscriber.
 */
class DefaultSubscriber implements EventSubscriberInterface {

  /**
   * Entity type manager.
   *
   * @var \Drupal\Core\Entity\Entity
   */
  private $entityTypeManager;

  /**
   * Connection service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  private $connection;

  /**
   * Constructs a new DefaultSubscriber object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManager $entityTypeManager
   *   Entity type manager.
   * @param \Drupal\Core\Database\Connection $connection
   *   The connection service.
   */
  public function __construct(EntityTypeManager $entityTypeManager, Connection $connection) {
    $this->entityTypeManager = $entityTypeManager;
    $this->connection = $connection;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events['elasticsearch_connector.prepare_index_mapping'] = ['elasticsearchConnectorPrepareIndexMapping'];
    $events['elasticsearch_connector.prepare_index'] = ['elasticsearchConnectorPrepareIndex'];

    return $events;
  }

  /**
   * Called on elasticsearch_connector.prepare_index_mapping event.
   *
   * @param \Symfony\Component\EventDispatcher\Event $event
   *   The event.
   */
  public function elasticsearchConnectorPrepareIndexMapping(Event $event) {
    $index = $this->loadIndexFromIndexName($event->getIndexName());

    $params = $event->getIndexMappingParams();
    $ngram_index_analyzer_enabled = $index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled');
    if ($ngram_index_analyzer_enabled) {
      foreach ($index->getFields() as $field_id => $field_data) {
        if ($field_data->getType() == 'text_ngram') {
          $params['body'][$params['type']]['properties'][$field_id]['type'] = 'text';
          $params['body'][$params['type']]['properties'][$field_id]['boost'] = $field_data->getBoost();
          $params['body'][$params['type']]['properties'][$field_id]['fields'] = [
            "keyword" => [
              "type" => 'keyword',
              'ignore_above' => 256,
            ],
          ];
          $params['body'][$params['type']]['properties'][$field_id]['analyzer'] = 'ngram_analyzer';
          $params['body'][$params['type']]['properties'][$field_id]['search_analyzer'] = 'standard';
        }
      }
    }

    $params['body'][$params['type']]['_all'] = [
        'analyzer' => 'edge_ngram_analyzer',
        'search_analyzer' => 'keyword_analyzer'
    ];

    $event->setIndexMappingParams($params);

  }

  /**
   * Called on elasticsearch_connector.prepare_index event.
   *
   * @param \Symfony\Component\EventDispatcher\Event $event
   *   The event.
   */
  public function elasticsearchConnectorPrepareIndex(Event $event) {
    $index = $this->loadIndexFromIndexName($event->getIndexName());

    $settings = $index->getThirdPartySettings('elasticsearch_connector');

    $indexConfig = $event->getIndexConfig();
    if (!empty($settings['ngram_filter_enabled'])) {

      $body = <<<EOF
{
	"settings": {
		"analysis": {
			"filter": {
				"ngram_filter": {
					"type": "{$settings['ngram_config']['ngram_type']}",
					"min_gram": {$settings['ngram_config']['min_gram']},
					"max_gram": {$settings['ngram_config']['max_gram']}
				}
			},
			"analyzer": {
				"ngram_analyzer": {
					"type": "custom",
					"tokenizer": "standard",
					"filter": [
						"lowercase",
						"ngram_filter"
					]
				}
			}
		}
	}
}    
EOF;

      $body = json_decode($body, TRUE);
      $indexConfig['body'] = array_merge($indexConfig['body'], $body);
    }

      #tetsing new settings
      $indexConfig['body']['settings']['analysis']['filter'] = [
          'edge_ngram' => [
              'type' => 'edgeNGram',
              'min_gram' => 2,
              'max_gram' => 25,
              'token_chars' => [
                  'letter', 'digit'
              ]
          ]
      ];

      $indexConfig['body']['settings']['analysis']['analyzer'] = [
          'edge_ngram_analyzer' => [
              'filter' => ['lowercase', 'edge_ngram'],
              'tokenizer' => 'standard',
          ],
          'keyword_analyzer' => [
              'filter' => ['lowercase'],
              'tokenizer' => 'standard'
          ]
      ];

    $event->setIndexConfig($indexConfig);
  }

  /**
   * Calculates the Index entity id form the event.
   *
   * @param string $index_name
   *   The long index name as a string.
   *
   * @return string
   *   The id of the associated index entity.
   */
  private function getIndexIdFromIndexName($index_name) {
    $options = $this->connection->getConnectionOptions();
    $site_database = $options['database'];
    $index_prefix = 'elasticsearch_index_' . $site_database . '_';
    $index_id = str_replace($index_prefix, '', $index_name);
    return $index_id;
  }

  /**
   * Loads the index entity associated with this event.
   *
   * @param string $index_name
   *   The long index name as a string.
   *
   * @return \Drupal\Core\Entity\EntityInterface|null
   *   The loaded index or NULL.
   */
  private function loadIndexFromIndexName($index_name) {
    $index_id = $this->getIndexIdFromIndexName($index_name);

    $index_storage = $this->entityTypeManager->getStorage('search_api_index');
    $index = $index_storage->load($index_id);
    return $index;
  }

}
