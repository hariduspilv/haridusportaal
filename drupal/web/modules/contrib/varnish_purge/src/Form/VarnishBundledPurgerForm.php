<?php

namespace Drupal\varnish_purger\Form;

use Drupal\varnish_purger\Form\VarnishPurgerFormBase;

/**
 * Configuration form for the Varnish Purger.
 */
class VarnishBundledPurgerForm extends VarnishPurgerFormBase {

  /**
   * The token group names this purger supports replacing tokens for.
   *
   * @see purge_tokens_token_info()
   *
   * @var string[]
   */
  protected $tokenGroups = ['invalidations'];

}
