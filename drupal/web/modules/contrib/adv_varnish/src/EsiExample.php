<?php

namespace Drupal\adv_varnish;

/**
 * EsiExample class. Provide examples for adv_varnish module.
 *
 * TODO implement function for using methods as callback for adv_esi elements.
 */
class EsiExample {

  /**
   * Example of callback for adv_esi element.
   *
   * @param array $params
   *   Array of parameters.
   *
   * @return array
   *   Render Array.
   */
  public static function userName(array $params) {
    return [
      '#markup' => \Drupal::currentUser()->getAccountName(),
    ];
  }

}
