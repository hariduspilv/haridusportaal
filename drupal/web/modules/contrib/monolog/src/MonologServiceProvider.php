<?php

namespace Drupal\monolog;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Overrides the logger.factory service with the monolog factory.
 */
class MonologServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    $definition = $container->getDefinition('logger.factory');
    $definition->setClass('Drupal\monolog\Logger\MonologLoggerChannelFactory')
      ->clearTags();

    // Allow existing Drupal loggers to be added as handlers.
    $drupalLoggers = $container->findTaggedServiceIds('logger');
    foreach ($drupalLoggers as $id => $tags) {
      $handlerId = sprintf('monolog.handler.drupal.%s', preg_replace('/^logger\./', '', $id));

      // Allow the handler to be explicitly defined elsewhere.
      if (!$container->has($handlerId)) {
        $definition = $container->register($handlerId, 'Drupal\monolog\Logger\Handler\DrupalHandler');
        $definition->addArgument(new Reference($id));
      }

    }
  }

}
