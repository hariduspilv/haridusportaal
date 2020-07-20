<?php

namespace Drupal\filelog\ProxyClass;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\filelog\LogFileManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a proxy class for \Drupal\filelog\LogFileManager.
 *
 * @see \Drupal\Component\ProxyBuilder\ProxyBuilder
 */
class LogFileManager implements LogFileManagerInterface {

  use DependencySerializationTrait;

  /**
   * The id of the original proxied service.
   *
   * @var string
   */
  protected $drupalProxyOriginalServiceId;

  /**
   * The real proxied service, after it was lazy loaded.
   *
   * @var \Drupal\filelog\LogFileManager
   */
  protected $service;

  /**
   * The service container.
   *
   * @var \Symfony\Component\DependencyInjection\ContainerInterface
   */
  protected $container;

  /**
   * Constructs a ProxyClass Drupal proxy object.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container.
   * @param string $drupal_proxy_original_service_id
   *   The service ID of the original service.
   */
  public function __construct(ContainerInterface $container, $drupal_proxy_original_service_id) {
    $this->container = $container;
    $this->drupalProxyOriginalServiceId = $drupal_proxy_original_service_id;
  }

  /**
   * Lazy loads the real service from the container.
   *
   * @return object
   *   Returns the constructed real service.
   */
  protected function lazyLoadItself() {
    if (!isset($this->service)) {
      $this->service = $this->container->get($this->drupalProxyOriginalServiceId);
    }

    return $this->service;
  }

  /**
   * {@inheritdoc}
   */
  public function ensurePath(): bool {
    return $this->lazyLoadItself()->ensurePath();
  }

}
