<?php

namespace Drupal\purge\Plugin\Purge\TagsHeader;

use Drupal\Core\Plugin\PluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base implementation for plugins that add and format a cache tags header.
 */
abstract class TagsHeaderBase extends PluginBase implements TagsHeaderInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getHeaderName() {
    return $this->getPluginDefinition()['header_name'];
  }

  /**
   * {@inheritdoc}
   */
  public function getValue(array $tags) {
    return implode(' ', $tags);
  }

  /**
   * {@inheritdoc}
   */
  public function isEnabled() {
    return TRUE;
  }

}
