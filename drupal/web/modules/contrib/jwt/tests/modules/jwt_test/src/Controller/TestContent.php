<?php

namespace Drupal\jwt_test\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Test content.
 */
class TestContent extends ControllerBase {

  /**
   * Provides example content for testing route enhancers.
   */
  public function test1() {
    return ['#markup' => 'abcde'];
  }

  /**
   * Provides example content for route specific authentication.
   *
   * @returns array
   *   The user name of the current logged in user in a render array.
   */
  public function test11() {
    $account = $this->currentUser();
    return ['#markup' => $account->getAccountName()];
  }

}
