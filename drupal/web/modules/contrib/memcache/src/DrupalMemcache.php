<?php

/**
 * @file
 * Contains \Drupal\memcache\DrupalMemcache.
 */

namespace Drupal\memcache;

use Psr\Log\LogLevel;
use Drupal\Component\Utility\Timer;

/**
 * Class DrupalMemcache.
 */
class DrupalMemcache extends DrupalMemcacheBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(DrupalMemcacheConfig $settings) {
    parent::__construct($settings);

    $this->memcache = new \Memcache();
  }

  /**
   * @{@inheritdoc}
   */
  public function addServer($server_path, $persistent = FALSE) {
    list($host, $port) = explode(':', $server_path);

    // Support unix sockets in the format 'unix:///path/to/socket'.
    if ($host == 'unix') {
      // When using unix sockets with Memcache use the full path for $host.
      $host = $server_path;
      // Port is always 0 for unix sockets.
      $port = 0;
    }

    // When using the PECL memcache extension, we must use ->(p)connect
    // for the first connection.
    return $this->connect($host, $port, $persistent);
  }

  /**
   * {@inheritdoc}
   */
  public function close() {
    $this->memcache->close();
  }

  /**
   * Connects to a memcache server.
   *
   * @param string $host
   * @param int $port
   * @param bool $persistent
   *
   * @return bool|mixed
   */
  protected function connect($host, $port, $persistent) {
    if ($persistent) {
      return @$this->memcache->pconnect($host, $port);
    }
    else {
      return @$this->memcache->connect($host, $port);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function set($key, $value, $exp = 0, $flag = FALSE) {
    $collect_stats = $this->stats_init();

    $full_key = $this->key($key);
    $result = $this->memcache->set($full_key, $value, $flag, $exp);

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
    $result = $this->memcache->add($full_key, $value,false, $expire);

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

    $results = $this->memcache->get($full_keys);

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

    // Order isn't guaranteed, so ensure the return order matches that
    // requested. So base the results on the order of the full_keys, as they
    // reflect the order of the $cids passed in.
    foreach (array_intersect($full_keys, array_keys($results)) as $cid => $full_key) {
      $cid_results[$cid] = $results[$full_key];
    }

    if ($collect_stats) {
      $this->stats_write('getMulti', 'cache', $multi_stats);
    }

    return $cid_results;
  }

}
