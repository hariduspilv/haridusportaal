<?php
/**
 * @file
 * Contains \Drupal\import_school_data\Plugin\QueueWorker\CachePurgeQueue.
 */
namespace Drupal\htm_custom_varnish_purge\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
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
     * @var \GuzzleHttp\Client
     */
    protected $client;

    /**
     * Constructs the Varnish purger.
     *
     * @param \GuzzleHttp\ClientInterface $http_client
     *   An HTTP client that can perform remote requests.
     *
     */
    function __construct(ClientInterface $http_client) {
        $this->configuration = \Drupal::config('htm_custom_varnish_purge.varnishpurge');
        $this->client = $http_client;
    }

    /**
     * {@inheritdoc}
     */
    public function processItem($cache_tag) {

        $this->configuration->get('path');

        $purgeurl = $this->configuration->get('path').$this->configuration->get('port');
        $varnishhost = 'Host: ' . $_SERVER['SERVER_NAME'];
        $varnishcommand = "PURGE";
        $curl = curl_init($purgeurl);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $varnishcommand);
        curl_setopt($curl, CURLOPT_ENCODING, $varnishhost);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Purge-Cache-Tags: '.$cache_tag
        ]);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, false);

        $result = curl_exec($curl);
        dump($result);
        die();
        curl_close($curl);

        dump($this->configuration);
        dump($cache_tag);
        die();
    }
}
