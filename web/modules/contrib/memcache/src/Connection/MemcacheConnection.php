<?php

namespace Drupal\memcache\Connection;

use Drupal\memcache\Connection\MemcacheConnectionInterface;

class MemcacheConnection implements MemcacheConnectionInterface {

  /**
   * The memcache object.
   *
   * @var \Memcache
   */
  protected $memcache;

  /**
   * Constructs a MemcacheConnection object.
   */
  public function __construct() {
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
  public function getMemcache() {
    return $this->memcache;
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

}
