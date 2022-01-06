<?php

namespace Drupal\openid_connect\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a OpenID Connect client item annotation object.
 *
 * @see \Drupal\openid_connect\Plugin\OpenIDConnectClientManager
 * @see plugin_api
 *
 * @Annotation
 */
class OpenIDConnectClient extends Plugin {

  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The human-readable name of the OpenID Connect Client plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   *
   * @ingroup plugin_translatable
   */
  public $label;

}
