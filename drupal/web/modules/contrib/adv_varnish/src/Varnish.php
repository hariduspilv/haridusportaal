<?php

namespace Drupal\adv_varnish;

use Drupal\Core\Logger\RfcLogLevel;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Psr\Log\LoggerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Main class provide basic methods to work with Varnish.
 */
class Varnish implements VarnishInterface {
  use StringTranslationTrait;

  /**
   * Config Factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Varnish terminal status.
   *
   * @var bool
   */
  public static $getStatusResults;

  /**
   * Logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * User account.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $account;

  /**
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  protected $config;

  /**
   * Class constructor.
   */
  public function __construct(ConfigFactoryInterface $config_factory, LoggerInterface $logger, AccountProxyInterface $account) {
    $this->configFactory = $config_factory;
    $this->config = $config_factory->get('adv_varnish.settings');
    $this->logger = $logger;
    $this->account = $account;
  }

  /**
   * Parse the host from the global $base_url.
   *
   * @return string
   *   Varnish host.
   */
  public function varnishGetHost() {
    global $base_url;
    $parts = parse_url($base_url);
    return is_array( $parts) && isset($parts['host'] ) ? $parts['host'] : '';
  }

  /**
   * Execute varnish command and get response.
   *
   * @param resource $client
   *   Terminal settings.
   * @param string $command
   *   Command line to execute.
   *
   * @return mixed
   *   Result of executed command.
   */
  public function varnishExecuteCommand($client, $command) {

    // Send command and get response.
    socket_write($client, "$command\n");
    $status = $this->varnishReadSocket($client);
    if ($status['code'] != 200) {
      $this->logger->log(RfcLogLevel::ERROR, 'Received status code @code running %command. Full response text: @error', [
        '@code' => $status['code'],
        '%command' => $command,
        '@error' => $status['msg'],
      ]);
      return FALSE;
    }
    else {

      // Successful connection.
      return $status;
    }
  }

  /**
   * Low-level socket read function.
   *
   * @params
   *   $client an initialized socket client
   *
   *   $retry how many times to retry on "temporarily unavailable" errors.
   *
   * @return array
   *   Response array.
   */
  public function varnishReadSocket($client, $retry = 2) {
    // Status and length info is always 13 characters.
    $header = socket_read($client, 13, SO_TYPE);
    if ($header == FALSE) {
      $error = socket_last_error();
      // 35 = socket-unavailable, so it might be blocked from our write.
      // This is an acceptable place to retry.
      if ($error == 35 && $retry > 0) {
        return $this->varnishReadSocket($client, $retry - 1);
      }
      else {
        $this->logger->log(RfcLogLevel::ERROR, 'Socket error: @error', ['@error' => socket_strerror($error)]);
        return [
          'code' => $error,
          'msg' => socket_strerror($error),
        ];
      }
    }
    $msg_len = (int) substr($header, 4, 6) + 1;
    $status = [
      'code' => substr($header, 0, 3),
      'msg' => socket_read($client, $msg_len, PHP_BINARY_READ),
    ];
    return $status;
  }

  /**
   * Sends commands to Varnish.
   *
   * @param mixed $commands
   *   Array of commands to execute.
   *
   * @return array
   *   Result status.
   */
  public function varnishTerminalRun($commands) {
    if (!extension_loaded('sockets')) {
      // Prevent fatal errors if people don't have requirements.
      return [];
    }
    // Convert single commands to an array so we
    // can handle everything in the same way.
    if (!is_array($commands)) {
      $commands = [$commands];
    }
    $ret = [];
    $terminals = explode(' ', $this->getSettings('connection.control_terminal', '127.0.0.1:6082'));
    // The variable varnish_socket_timeout defines the timeout in milliseconds.
    $timeout = $this->getSettings('connection.socket_timeout', 100);
    $seconds = (int) ($timeout / 1000);
    $microseconds = (int) ($timeout % 1000 * 1000);
    foreach ($terminals as $terminal) {
      list($server, $port) = explode(':', $terminal);
      $client = socket_create(AF_INET, SOCK_STREAM, (int)getprotobyname('tcp'));
      if (!$client) {
        $this->logger->log(RfcLogLevel::ERROR, 'Unable to create the server socket: %error', [
          '%error' => socket_strerror(socket_last_error()),
        ]);
        $ret[$terminal] = FALSE;
        continue;
      }
      socket_set_option($client, SOL_SOCKET, SO_SNDTIMEO, ['sec' => $seconds, 'usec' => $microseconds]);
      socket_set_option($client, SOL_SOCKET, SO_RCVTIMEO, ['sec' => $seconds, 'usec' => $microseconds]);
      if (!@socket_connect($client, $server, (int)$port)) {
        $this->logger->log(RfcLogLevel::ERROR, 'Unable to connect to server socket @server:@port: %error', [
          '@server' => $server,
          '@port' => $port,
          '%error' => socket_strerror(socket_last_error($client)),
        ]);
        $ret[$terminal] = FALSE;
        \Drupal::messenger()->addMessage($this->t('Unable to connect to server socket @server:@port.', ['@server' => $server, '@port' => $port]), \Drupal::messenger()::TYPE_WARNING);

        // If a varnish server is unavailable, move on to the next in the list.
        continue;
      }
      // If there is a CLI banner message (varnish >= 2.1.x),
      // try to read it and move on.
      $varnish_version = $this->configFactory->get('advanced_varnish_cache.settings')->get('varnish_version');
      if (!$varnish_version) {
        $varnish_version = 2.1;
      }
      if (floatval($varnish_version) > 2.0) {
        $status = $this->varnishReadSocket($client);
        // Do we need to authenticate?
        if ($status['code'] == 107) {
          $secret = $this->getSettings('connection.control_key', '');
          $challenge = substr($status['msg'], 0, 32);
          $pack = $challenge . "\x0A" . $secret . "\x0A" . $challenge . "\x0A";
          $key = hash('sha256', $pack);
          socket_write($client, "auth $key\n");
          $status = $this->varnishReadSocket($client);
          if ($status['code'] != 200) {
            $this->logger->error('Authentication to server failed!');
          }
        }
      }
      foreach ($commands as $command) {
        if ($status = $this->varnishExecuteCommand($client, $command)) {
          $ret[$terminal][$command] = $status;
        }
      }
    }
    return $ret;
  }

  /**
   * Get the status (up/down) of each of the varnish servers.
   *
   * @return array
   *   An array of server statuses, keyed by varnish terminal addresses.
   */
  public function varnishGetStatus() {
    // Use a static-cache so this can be called repeatedly without incurring
    // socket-connects for each call.
    $results = (isset(static::$getStatusResults)) ? static::$getStatusResults : NULL;

    if (is_null($results)) {
      $results = [];
      $status = $this->varnishTerminalRun(['status']);
      $terminals = explode(' ', $this->getSettings('connection.control_terminal', '127.0.0.1:6082'));
      foreach ($terminals as $terminal) {
        $stat = array_shift($status);
        $results[$terminal] = ($stat['status']['code'] == 200);
      }
    }

    return $results;
  }

  /**
   * Return module settings.
   *
   * @param string $setting
   *   Setting key.
   * @param mixed $default
   *   Default setting value.
   *
   * @return mixed
   *   Setting value by key.
   */
  public function getSettings($setting, $default = NULL) {
    // Load config.
    $config = $this->config->get($setting);
    // Use default if config is missing.
    $result = !empty($config) ? $config : $default;
    // Return result.
    return $result;
  }

  /**
   * Purge varnish cache for specific tag.
   */
  public function purgeTags($tag, $header = 'X-Tag') {

    // Build pattern.
    $pattern = (count($tag) > 1)
        ? implode('|', $tag)
        : reset($tag);

    // Remove quotes from pattern.
    $pattern = strtr($pattern, ['"' => '', "'" => '']);

    // Clean all or only current host.
    if ($this->getSettings('purge.all_hosts', TRUE)) {
      $command_line = "ban obj.http.$header ~ \"$pattern\"";
    }
    else {
      $host = $this->varnishGetHost();
      $command_line = "ban req.http.host ~ $host && obj.http.$header ~ \"$pattern\"";
    }

    // Log action.
    if ($this->getSettings('general.logging', FALSE)) {

      $this->logger->log(RfcLogLevel::DEBUG, 'u=@uid purge !command_line', [
        '@uid' => $this->account->id(),
        '!command_line' => $command_line,
      ]
      );
    }

    // Query Varnish.
    $res = $this->varnishTerminalRun([$command_line]);
    return $res;
  }

  /**
   * Purge varnish cache for specific request, like '/sites/all/files/1.txt'.
   *
   * @param string $pattern
   *   String/array list of tags to search and purge.
   * @param bool $exact
   *   Bool specify if pattern regex or exact match string.
   *
   * @return array
   *   Return array.
   */
  public function purgeRequest($pattern, $exact = FALSE) {

    // Remove quotes from pattern.
    $pattern = strtr($pattern, ['"' => '', "'" => '']);
    $command = !empty($exact) ? '==' : '~';

    // Clean all or only current host.
    if ($this->getSettings('purge.all_hosts', TRUE)) {
      $command_line = "ban req.url $command \"$pattern\"";
    }
    else {
      $host = $this->varnishGetHost();
      $command_line = "ban req.http.host ~ $host && req.url $command \"$pattern\"";
    }

    // Log action.
    if ($this->getSettings('general.logging', FALSE)) {
      $message = $this->t('u=@uid purge @command_line', [
        '@uid' => $this->account->id(),
        '@command_line' => $command_line,
      ]);
      $this->logger->notice($message);
    }

    // Query Varnish.
    $res = $this->varnishTerminalRun([$command_line]);
    return $res;
  }

}
