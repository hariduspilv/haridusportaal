<?php

/**
 * @file
 * Contains adv_varnish.api.php.
 */

/**
 * Result provider for adv_esi element.
 *
 * @param string $data
 *   Data_type, that was defined in the cv_esi element.
 * @param array $params
 *   Params, that was defined in the cv_esi element.
 *
 * @return array
 *   Render Array.
 *
 * @see \Drupal\adv_varnish\Controller\VarnishAdvEsiController::esi()
 */
function hook_esi_adv_varnish($data, array $params) {
  if ($data == 'user-name') {
    return [
      '#markup' => \Drupal::currentUser()->getAccountName(),
    ];
  }
  return NULL;
}
