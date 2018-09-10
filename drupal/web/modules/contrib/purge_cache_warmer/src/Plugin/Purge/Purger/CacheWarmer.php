<?php

namespace Drupal\purge_cache_warmer\Plugin\Purge\Purger;

use Drupal\purge\Plugin\Purge\Purger\PurgerBase;
use Drupal\purge\Plugin\Purge\Purger\PurgerInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Purge Cache Warmer.
 *
 * @PurgePurger(
 *   id = "cache_warmer",
 *   label = @Translation("Cache Warmer"),
 *   description = @Translation("URL cache warmer for Purge."),
 *   types = {"url"},
 *   multi_instance = FALSE,
 * )
 */
class CacheWarmer extends PurgerBase implements PurgerInterface {

  /**
   * An http client.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $httpClient;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('http_client')
    );
  }

  /**
   * Constructs a \Drupal\Component\Plugin\CacheWarmer.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \GuzzleHttp\ClientInterface $http_client
   *    An HTTP client.
   *
   * @throws \LogicException
   *   Thrown if $configuration['id'] is missing, see Purger\Service::createId.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ClientInterface $http_client) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->httpClient = $http_client;
  }

  /**
   * {@inheritdoc}
   */
  public function routeTypeToMethod($type) {
    $methods = [
      'url' => 'invalidate',
    ];

    return isset($methods[$type]) ? $methods[$type] : 'invalidate';
  }

  /**
   * {@inheritdoc}
   */
  public function invalidate(array $invalidations) {
    $has_invalidations = count($invalidations) > 0;
    if (!$has_invalidations) {
      return;
    }
    else {
      foreach ($invalidations as $invalidation) {
        $invalidation_type = $invalidation->getPluginId();
        if ($invalidation_type == 'url') {
          $url = $invalidation->getUrl()->toString();
          try {
            $response = $this->httpClient->request('GET', $url, ['verify' => FALSE]);
            $status = $response->getStatusCode();
            if ($status == 200) {
              $invalidation->setState(InvalidationInterface::SUCCEEDED);
            }
            else {
              $invalidation->setState(InvalidationInterface::FAILED);
            }
          }
          catch (RequestException $e) {
            $invalidation->setState(InvalidationInterface::FAILED);
            $this->logger->error($e->getMessage());
          }
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function hasRuntimeMeasurement() {
    return TRUE;
  }

}
