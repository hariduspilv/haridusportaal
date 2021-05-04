<?php

namespace Drupal\sitemap\Plugin\Derivative;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * {@inheritdoc}
 */
class VocabularySitemapDeriver extends DeriverBase implements ContainerDeriverInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, $base_plugin_id) {
    return new static();
  }

  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {
    if (\Drupal::moduleHandler()->moduleExists('taxonomy')) {
      foreach (Vocabulary::loadMultiple() as $id => $vocabulary) {
        /* @var $vocabulary \Drupal\taxonomy\VocabularyInterface */
        $this->derivatives[$id] = $base_plugin_definition;
        $this->derivatives[$id]['title'] = t('Vocabulary: @vocabulary', ['@vocabulary' => $vocabulary->label()]);
        $this->derivatives[$id]['description'] = $vocabulary->getDescription();
        $this->derivatives[$id]['settings']['title'] = '';
        $this->derivatives[$id]['vocabulary'] = $vocabulary->id();
        $this->derivatives[$id]['config_dependencies']['config'] = [$vocabulary->getConfigDependencyName()];
      }
    }
    return $this->derivatives;
  }

}
