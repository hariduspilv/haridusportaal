<?php

namespace Drupal\htm_custom_xjson_services\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class xJsonController.
 */
class xJsonController extends ControllerBase {

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function hello($form_name) {
    return [
      '#type' => 'markup',
	    '#title' => $form_name,
      '#markup' => $this->t($form_name)
    ];
  }

}
