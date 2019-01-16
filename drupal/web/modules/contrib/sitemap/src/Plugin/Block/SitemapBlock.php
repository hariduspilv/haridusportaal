<?php

namespace Drupal\sitemap\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Annotation\Translation;
use Drupal\Core\Session\AccountInterface;

/**
 * Provides the Sitemap in a block.
 *
 * @Block(
 *   id = "sitemap",
 *   label = @Translation("Sitemap"),
 *   admin_label = @Translation("Sitemap")
 * )
 */
class SitemapBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    return AccessResult::allowedIfHasPermission($account, 'access sitemap');
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // Check whether to include the default CSS.
    $config = \Drupal::config('sitemap.settings');
    if ($config->get('css') == 1) {
      $sitemap['#attached']['library'] = array(
        'sitemap/sitemap.theme',
      );
    }

    return array(
      '#theme' => 'sitemap',
    );
  }

}
