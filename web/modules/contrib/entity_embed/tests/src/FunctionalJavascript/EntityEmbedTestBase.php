<?php

namespace Drupal\Tests\entity_embed\FunctionalJavascript;

use Drupal\FunctionalJavascriptTests\WebDriverTestBase;

/**
 * Base class for all entity_embed tests.
 */
abstract class EntityEmbedTestBase extends WebDriverTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'entity_embed',
    'entity_embed_test',
    'node',
    'ckeditor',
  ];

  /**
   * Assigns a name to the CKEditor iframe, to allow use of ::switchToIFrame().
   *
   * @see \Behat\Mink\Session::switchToIFrame()
   */
  protected function assignNameToCkeditorIframe() {
    $javascript = <<<JS
(function(){
  document.getElementsByClassName('cke_wysiwyg_frame')[0].id = 'ckeditor';
})()
JS;
    $this->getSession()->evaluateScript($javascript);
  }

  /**
   * Waits for CKEditor to initialize.
   *
   * @param string $instance_id
   *   The CKEditor instance ID.
   * @param int $timeout
   *   (optional) Timeout in milliseconds, defaults to 10000.
   */
  protected function waitForEditor($instance_id = 'edit-body-0-value', $timeout = 10000) {
    $condition = <<<JS
      (function() {
        return (
          typeof CKEDITOR !== 'undefined'
          && typeof CKEDITOR.instances["$instance_id"] !== 'undefined'
          && CKEDITOR.instances["$instance_id"].instanceReady
        );
      }());
JS;

    $this->getSession()->wait($timeout, $condition);
  }

}
