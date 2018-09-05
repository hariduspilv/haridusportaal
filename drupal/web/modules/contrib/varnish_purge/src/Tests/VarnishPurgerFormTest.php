<?php

namespace Drupal\varnish_purger\Tests;

use Drupal\varnish_purger\Tests\VarnishPurgerFormTestBase;

/**
 * Tests \Drupal\varnish_purger\Form\VarnishPurgerForm.
 *
 * @group varnish_purger
 */
class VarnishPurgerFormTest extends VarnishPurgerFormTestBase {

  /**
   * The full class of the form being tested.
   *
   * @var string
   */
  protected $formClass = 'Drupal\varnish_purger\Form\VarnishPurgerForm';

  /**
   * The plugin ID for which the form tested is rendered for.
   *
   * @var string
   */
  protected $plugin = 'varnish';

  /**
   * The token group names the form is supposed to display.
   *
   * @see purge_tokens_token_info()
   *
   * @var string[]
   */
  protected $tokenGroups = ['invalidation'];

}
