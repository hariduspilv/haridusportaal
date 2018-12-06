<?php
/**
 * @file
 * Contains \Drupal\import_school_data\Plugin\QueueWorker\CachePurgeQueue.
 */
namespace Drupal\htm_custom_varnish_purge\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Client;

/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_purge_cache_tags",
 *   title = @Translation("Import task worker: purge cache tags queue"),
 *   cron = {"time" = 30}
 * )
 */
class CachePurgeQueue extends QueueWorkerBase {

    /**
     * Varnish configuration.
     */
    protected $configuration;

    /**
     * Constructs the Varnish purger.
     *
     *
     */
    function __construct() {
        $this->configuration = \Drupal::config('htm_custom_varnish_purge.varnishpurge');
    }

    /**
     * {@inheritdoc}
     */
    public function processItem($cache_tag) {
        $purgeurl = 'http://'.$this->configuration->get('path').':'.$this->configuration->get('port');
        $varnishcommand = "PURGE";

        $client = new Client([
            'timeout'  => 30,
        ]);

        $client->request($varnishcommand, $purgeurl, []);
    }
}
