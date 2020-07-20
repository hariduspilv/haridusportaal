<?php

namespace Drupal\adv_varnish;

/**
 * Interface VarnishInterface.
 */
interface VarnishInterface {

  /**
   * Execute varnish command and get response.
   */
  public function varnishExecuteCommand($client, $command);

  /**
   * Parse the host from the global $base_url.
   */
  public function varnishGetHost();

  /**
   * Get the status (up/down) of each of the varnish servers.
   *
   * @return array
   *   An array of server statuses, keyed by varnish terminal addresses.
   */
  public function varnishGetStatus();

  /**
   * Low-level socket read function.
   *
   * @params
   *   $client an initialized socket client
   *   $retry how many times to retry on "temporarily unavailable" errors.
   *
   * @return array
   *   Return array
   */
  public function varnishReadSocket($client, $retry);

  /**
   * Sends commands to Varnish.
   */
  public function varnishTerminalRun($commands);

  /**
   * Return module settings.
   *
   * @param string $setting
   *   Setting key.
   * @param string $default
   *   Default setting value.
   *
   * @return mixed
   *   Setting value by key.
   */
  public function getSettings($setting, $default = NULL);

}
