<?php

namespace Drupal\htm_custom_graphql_elasticsearch\EventSubscriber;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\elasticsearch_connector\Event\PrepareIndexEvent;
use Drupal\elasticsearch_connector\Event\PrepareIndexMappingEvent;


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
     * @param \Drupal\elasticsearch_connector\Event\PrepareIndexMappingEvent $event
     *   The event.
     */
    public function elasticsearchConnectorPrepareIndexMapping(PrepareIndexMappingEvent $event) {
        $index = $this->loadIndexFromIndexName($event->getIndexName());

        $params = $event->getIndexMappingParams();

        $event->setIndexMappingParams($params);

    }

    /**
     * Called on elasticsearch_connector.prepare_index event.
     *
     * @param \Drupal\elasticsearch_connector\Event\PrepareIndexEvent $event
     *   The event.
     */
    public function elasticsearchConnectorPrepareIndex(PrepareIndexEvent $event) {
        $index = $this->loadIndexFromIndexName($event->getIndexName());

        $settings = $index->getThirdPartySettings('elasticsearch_connector');

        $indexConfig = $event->getIndexConfig();

        $indexConfig['body']['settings']['analysis']['analyzer']['default'] = [
            'tokenizer' => 'whitespace',
            'filter' => [
                'lowercase'
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