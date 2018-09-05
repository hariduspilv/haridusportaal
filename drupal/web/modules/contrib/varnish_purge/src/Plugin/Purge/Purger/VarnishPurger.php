<?php

namespace Drupal\varnish_purger\Plugin\Purge\Purger;

use Drupal\purge\Plugin\Purge\Purger\PurgerInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface;
use Drupal\varnish_purger\Plugin\Purge\Purger\VarnishPurgerBase;

/**
 * HTTP Purger
 *
 * @PurgePurger(
 *   id = "varnish",
 *   label = @Translation("Varnish Purger"),
 *   configform = "\Drupal\varnish_purger\Form\VarnishPurgerForm",
 *   cooldown_time = 0.0,
 *   description = @Translation("Configurable purger that makes HTTP requests for each given invalidation instruction."),
 *   multi_instance = TRUE,
 *   types = {},
 * )
 */
class VarnishPurger extends VarnishPurgerBase implements PurgerInterface {

  /**
   * {@inheritdoc}
   */
  public function invalidate(array $invalidations) {

    // Iterate every single object and fire a request per object.
    foreach ($invalidations as $invalidation) {
      $token_data = ['invalidation' => $invalidation];
      $uri = $this->getUri($token_data);
      $opt = $this->getOptions($token_data);

      try {
        $this->client->request($this->settings->request_method, $uri, $opt);
        $invalidation->setState(InvalidationInterface::SUCCEEDED);
      }
      catch (\Exception $e) {
        $invalidation->setState(InvalidationInterface::FAILED);

        // Log as much useful information as we can.
        $headers = $opt['headers'];
        unset($opt['headers']);
        $debug = json_encode(str_replace("\n", ' ', [
          'msg' => $e->getMessage(),
          'uri' => $uri, 'method' => $this->settings->request_method,
          'guzzle_opt' => $opt, 'headers' => $headers]));
        $this->logger()->emergency("item failed due @e, details (JSON): @debug",
          ['@e' => get_class($e), '@debug' => $debug]);
      }
    }
  }

}
