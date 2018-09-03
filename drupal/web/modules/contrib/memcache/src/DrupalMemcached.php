<?php

/**
 * @file
 * Contains \Drupal\memcache\DrupalMemcached.
 */

namespace Drupal\memcache;

use Drupal\Component\Utility\Timer;

/**
 * Class DrupalMemcached.
 */
class DrupalMemcached extends DrupalMemcacheBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(DrupalMemcacheConfig $settings) {
    parent::__construct($settings);

    $this->memcache = new \Memcached();

    $default_opts = [
      \Memcached::OPT_COMPRESSION => FALSE,
      \Memcached::OPT_DISTRIBUTION => \Memcached::DISTRIBUTION_CONSISTENT,
    ];
    foreach ($default_opts as $key => $value) {
      $this->memcache->setOption($key, $value);
    }
    // See README.txt for setting custom Memcache options when using the
    // memcached PECL extension.
    foreach ($this->settings->get('options', []) as $key => $value) {
      $this->memcache->setOption($key, $value);
    }

    // SASL configuration to authenticate with Memcached.
    // Note: this only affects the Memcached PECL extension.
    if ($sasl_config = $this->settings->get('sasl', [])) {
      $this->memcache->setSaslAuthData($sasl_config['username'], $sasl_config['password']);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function addServer($server_path, $persistent = FALSE) {
    list($host, $port) = explode(':', $server_path);

    if ($host == 'unix') {
      // Memcached expects just the path to the socket without the protocol
      $host = substr($server_path, 7);
      // Port is always 0 for unix sockets.
      $port = 0;
    }

    return $this->memcache->addServer($host, $port, $persistent);
  }

  /**
   * {@inheritdoc}
   */
  public function close() {
    $this->memcache->quit();
  }

  /**
   * {@inheritdoc}
   */
  public function set($key, $value, $exp = 0, $flag = FALSE) {
    $collect_stats = $this->stats_init();

    $full_key = $this->key($key);
    $result = $this->memcache->set($full_key, $value, $exp);

    if ($collect_stats) {
      $this->stats_write('set', 'cache', [$full_key => (int)$result]);
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  public function add($key, $value, $expire = 0) {
    $collect_stats = $this->stats_init();

    $full_key = $this->key($key);
    $result = $this->memcache->add($full_key, $value, $expire);

    if ($collect_stats) {
      $this->stats_write('add', 'cache', [$full_key => (int)$result]);
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  public function getMulti(array $keys) {
    $collect_stats = $this->stats_init();
    $multi_stats   = [];

    $full_keys = [];

    foreach ($keys as $key => $cid) {
      $full_key = $this->key($cid);
      $full_keys[$cid] = $full_key;

      if ($collect_stats) {
        $multi_stats[$key] = FALSE;
      }
    }

    if (PHP_MAJOR_VERSION === 7) {
      $results = $this->memcache->getMulti($full_keys, \Memcached::GET_PRESERVE_ORDER);
    } else {
      $cas_tokens = NULL;
      $results = $this->memcache->getMulti($full_keys, $cas_tokens, \Memcached::GET_PRESERVE_ORDER);
    }

    // If $results is FALSE, convert it to an empty array.
    if (!$results) {
      $results = [];
    }

    if ($collect_stats) {
      foreach ($multi_stats as $key => $value) {
        $multi_stats[$key] = isset($results[$key]) ? TRUE : FALSE;
      }
    }

    // Convert the full keys back to the cid.
    $cid_results = [];
    $cid_lookup = array_flip($full_keys);

    foreach (array_filter($results) as $key => $value) {
      $cid_results[$cid_lookup[$key]] = $value;
    }

    if ($collect_stats) {
      $this->stats_write('getMulti', 'cache', $multi_stats);
    }

    return $cid_results;
  }

}
