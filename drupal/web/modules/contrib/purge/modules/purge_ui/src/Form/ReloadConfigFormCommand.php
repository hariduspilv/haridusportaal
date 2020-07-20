<?php

namespace Drupal\purge_ui\Form;

use Drupal\Core\Ajax\CommandInterface;
use Drupal\Core\Ajax\RedirectCommand;
use Drupal\Core\Url;

/**
 * Ajax command to reload the purge configuration form from modal dialogs.
 *
 * @ingroup ajax
 */
class ReloadConfigFormCommand extends RedirectCommand implements CommandInterface {

  /**
   * Route providing the main configuration form of the purge module.
   *
   * @var string
   */
  protected $route = 'purge_ui.dashboard';

  /**
   * Construct a ReloadConfigFormCommand object.
   *
   * @param string $fragment
   *   The fragment to jump to in the main config form.
   */
  public function __construct($fragment) {
    $options = ['fragment' => $fragment, 'query' => [$fragment => time()]];
    parent::__construct(Url::fromRoute($this->route, [], $options)->toString());
  }

}
