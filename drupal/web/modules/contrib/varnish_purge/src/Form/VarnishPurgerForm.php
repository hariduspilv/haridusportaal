<?php

namespace Drupal\varnish_purger\Form;

/**
 * Configuration form for the Varnish Bundled Purger.
 */
class VarnishPurgerForm extends VarnishPurgerFormBase {

  /**
   * The token group names this purger supports replacing tokens for.
   *
   * @see purge_tokens_token_info()
   *
   * @var string[]
   */
  protected $tokenGroups = ['invalidation'];

}
