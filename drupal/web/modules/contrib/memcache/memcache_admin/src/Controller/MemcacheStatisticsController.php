<?php

namespace Drupal\memcache_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatter;
use Drupal\Core\Link;
use Drupal\Core\Messenger\MessengerTrait;
use Drupal\Core\Url;
use Drupal\Component\Render\HtmlEscapedText;

/**
 * Memcache Statistics.
 */
class MemcacheStatisticsController extends ControllerBase {

  use MessengerTrait;

  /**
   * Callback for the Memcache Stats page.
   *
   * @param string $bin
   *   The bin name.
   *
   * @return string
   *   The page output.
   */
  public function statsTable($bin = 'default') {
    $output = [];
    $servers = [];

    // Get the statistics.
    $bin      = $this->binMapping($bin);
    /** @var $memcache \Drupal\memcache\DrupalMemcacheInterface */
    $memcache = \Drupal::service('memcache.factory')->get($bin, TRUE);
    $stats    = $memcache->stats($bin, 'default', TRUE);

    if (empty($stats[$bin])) {

      // Break this out to make Drupal Messenger service easier to read.
      $additional_message = $this->t(
        '@enable the memcache module',
        [
          '@enable' => Link::fromTextAndUrl(t('enable'), Url::fromUri('base:/admin/modules', ['fragment' => 'edit-modules-performance-and-scalability'])),
        ]
      );
      if (\Drupal::moduleHandler()->moduleExists('memcache')) {
        $additional_message = $this->t(
          'visit the Drupal admin @status page',
          [
            '@status' => Link::fromTextAndUrl(t('status report'), Url::fromUri('base:/admin/reports/status')),
          ]
        );
      }

      // Failed to load statistics. Provide a useful error about where to get
      // more information and help.
      $this->messenger()->addError(
        t(
          'There may be a problem with your Memcache configuration. Please review @readme and :more for more information.',
          [
            '@readme' => 'README.txt',
            ':more'   => $additional_message,
          ]
        )
      );
    }
    else {
      if (count($stats[$bin])) {
        $stats     = $stats[$bin];
        $aggregate = array_pop($stats);

        if ($memcache->getMemcache() instanceof \Memcached) {
          $version = t('Memcached v@version', ['@version' => phpversion('Memcached')]);
        }
        elseif ($memcache->getMemcache() instanceof \Memcache) {
          $version = t('Memcache v@version', ['@version' => phpversion('Memcache')]);
        }
        else {
          $version = t('Unknown');
          $this->messenger()->addError(t('Failed to detect the memcache PECL extension.'));
        }

        foreach ($stats as $server => $statistics) {
          if (empty($statistics['uptime'])) {
            $this->messenger()->addError(t('Failed to connect to server at :address.', [':address' => $server]));
          }
          else {
            $servers[] = $server;

            $data['server_overview'][$server]    = t('v@version running @uptime', ['@version' => $statistics['version'], '@uptime' => \Drupal::service('date.formatter')->formatInterval($statistics['uptime'])]);
            $data['server_pecl'][$server]        = t('n/a');
            $data['server_time'][$server]        = \Drupal::service('date.formatter')->format($statistics['time']);
            $data['server_connections'][$server] = $this->statsConnections($statistics);
            $data['cache_sets'][$server]         = $this->statsSets($statistics);
            $data['cache_gets'][$server]         = $this->statsGets($statistics);
            $data['cache_counters'][$server]     = $this->statsCounters($statistics);
            $data['cache_transfer'][$server]     = $this->statsTransfer($statistics);
            $data['cache_average'][$server]      = $this->statsAverage($statistics);
            $data['memory_available'][$server]   = $this->statsMemory($statistics);
            $data['memory_evictions'][$server]   = number_format($statistics['evictions']);
          }
        }
      }

      // Build a custom report array.
      $report = [
        'uptime' => [
          'uptime' => [
            'label'   => t('Uptime'),
            'servers' => $data['server_overview'],
          ],
          'extension' => [
            'label'   => t('PECL extension'),
            'servers' => [$servers[0] => $version],
          ],
          'time' => [
            'label'   => t('Time'),
            'servers' => $data['server_time'],
          ],
          'connections' => [
            'label'   => t('Connections'),
            'servers' => $data['server_connections'],
          ],
        ],
        'stats' => [],
        'memory' => [
          'memory' => [
            'label'   => t('Available memory'),
            'servers' => $data['memory_available'],
          ],
          'evictions' => [
            'label'   => t('Evictions'),
            'servers' => $data['memory_evictions'],
          ],
        ],
      ];

      // Don't display aggregate totals if there's only one server.
      if (count($servers) > 1) {
        $report['uptime']['uptime']['total']      = t('n/a');
        $report['uptime']['extension']['servers'] = $data['server_pecl'];
        $report['uptime']['extension']['total']   = $version;
        $report['uptime']['time']['total']        = t('n/a');
        $report['uptime']['connections']['total'] = $this->statsConnections($aggregate);
        $report['memory']['memory']['total']      = $this->statsMemory($aggregate);
        $report['memory']['evictions']['total']   = number_format($aggregate['evictions']);
      }

      // Report on stats.
      $stats = [
        'sets'     => t('Sets'),
        'gets'     => t('Gets'),
        'counters' => t('Counters'),
        'transfer' => t('Transferred'),
        'average'  => t('Per-connection average'),
      ];

      foreach ($stats as $type => $label) {
        $report['stats'][$type] = [
          'label'   => $label,
          'servers' => $data["cache_{$type}"],
        ];

        if (count($servers) > 1) {
          $func = 'stats' . ucfirst($type);
          $report['stats'][$type]['total'] = $this->{$func}($aggregate);
        }
      }

      $output = $this->statsTablesOutput($bin, $servers, $report);
    }

    return $output;
  }

  /**
   * Callback for the Memcache Stats page.
   *
   * @param string $cluster
   *   The Memcache cluster name.
   * @param string $server
   *   The Memcache server name.
   * @param string $type
   *   The type of statistics to retrieve when using the Memcache extension.
   *
   * @return string
   *   The page output.
   */
  public function statsTableRaw($cluster, $server, $type = 'default') {
    $cluster = $this->binMapping($cluster);
    $server = str_replace('!', '/', $server);

    $slab = \Drupal::routeMatch()->getParameter('slab');
    $memcache = \Drupal::service('memcache.factory')->get($cluster, TRUE);
    if ($type == 'slabs' && !empty($slab)) {
      $stats = $memcache->stats($cluster, $slab, FALSE);
    }
    else {
      $stats = $memcache->stats($cluster, $type, FALSE);
    }

    // @codingStandardsIgnoreStart
    // @todo - breadcrumb
    // $breadcrumbs = [
    //   l(t('Home'), NULL),
    //   l(t('Administer'), 'admin'),
    //   l(t('Reports'), 'admin/reports'),
    //   l(t('Memcache'), 'admin/reports/memcache'),
    //   l(t($bin), "admin/reports/memcache/$bin"),
    // ];
    // if ($type == 'slabs' && arg(6) == 'cachedump' && user_access('access slab cachedump')) {
    //   $breadcrumbs[] = l($server, "admin/reports/memcache/$bin/$server");
    //   $breadcrumbs[] = l(t('slabs'), "admin/reports/memcache/$bin/$server/$type");
    // }
    // drupal_set_breadcrumb($breadcrumbs);
    // @codingStandardsIgnoreEnd
    if (isset($stats[$cluster][$server]) && is_array($stats[$cluster][$server]) && count($stats[$cluster][$server])) {
      $output = $this->statsTablesRawOutput($cluster, $server, $stats[$cluster][$server], $type);
    }
    elseif ($type == 'slabs' && is_array($stats[$cluster]) && count($stats[$cluster])) {
      $output = $this->statsTablesRawOutput($cluster, $server, $stats[$cluster], $type);
    }
    else {
      $output = $this->statsTablesRawOutput($cluster, $server, [], $type);
      $this->messenger()->addMessage(t('No @type statistics for this bin.', ['@type' => $type]));
    }

    return $output;
  }

  /**
   * Helper function, reverse map the memcache_bins variable.
   */
  private function binMapping($bin = 'cache') {
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->getBins();

    $bins = array_flip($memcache_bins);
    if (isset($bins[$bin])) {
      return $bins[$bin];
    }
    else {
      return $this->defaultBin($bin);
    }
  }

  /**
   * Helper function. Returns the bin name.
   */
  private function defaultBin($bin) {
    if ($bin == 'default') {
      return 'cache';
    }

    return $bin;
  }

  /**
   * Statistics report: format total and open connections.
   */
  private function statsConnections($stats) {
    return $this->t(
      '@current open of @total total',
      [
        '@current' => number_format($stats['curr_connections']),
        '@total'   => number_format($stats['total_connections']),
      ]
    );
  }

  /**
   * Statistics report: calculate # of set cmds and total cmds.
   */
  private function statsSets($stats) {
    if (($stats['cmd_set'] + $stats['cmd_get']) == 0) {
      $sets = 0;
    }
    else {
      $sets = $stats['cmd_set'] / ($stats['cmd_set'] + $stats['cmd_get']) * 100;
    }
    if (empty($stats['uptime'])) {
      $average = 0;
    }
    else {
      $average = $sets / $stats['uptime'];
    }
    return $this->t(
      '@average/s; @set sets (@sets%) of @total commands',
      [
        '@average' => number_format($average, 2),
        '@sets'    => number_format($sets, 2),
        '@set'     => number_format($stats['cmd_set']),
        '@total'   => number_format($stats['cmd_set'] + $stats['cmd_get']),
      ]
    );
  }

  /**
   * Statistics report: calculate # of get cmds, broken down by hits and misses.
   */
  private function statsGets($stats) {
    if (($stats['cmd_set'] + $stats['cmd_get']) == 0) {
      $gets = 0;
    }
    else {
      $gets = $stats['cmd_get'] / ($stats['cmd_set'] + $stats['cmd_get']) * 100;
    }
    if (empty($stats['uptime'])) {
      $average = 0;
    }
    else {
      $average = $stats['cmd_get'] / $stats['uptime'];
    }
    return $this->t(
      '@average/s; @total gets (@gets%); @hit hits (@percent_hit%) @miss misses (@percent_miss%)',
      [
        '@average'      => number_format($average, 2),
        '@gets'         => number_format($gets, 2),
        '@hit'          => number_format($stats['get_hits']),
        '@percent_hit'  => ($stats['cmd_get'] > 0 ? number_format($stats['get_hits'] / $stats['cmd_get'] * 100, 2) : '0.00'),
        '@miss'         => number_format($stats['get_misses']),
        '@percent_miss' => ($stats['cmd_get'] > 0 ? number_format($stats['get_misses'] / $stats['cmd_get'] * 100, 2) : '0.00'),
        '@total'        => number_format($stats['cmd_get']),
      ]
    );
  }

  /**
   * Statistics report: calculate # of increments and decrements.
   */
  private function statsCounters($stats) {
    if (!is_array($stats)) {
      $stats = [];
    }

    $stats += [
      'incr_hits'   => 0,
      'incr_misses' => 0,
      'decr_hits'   => 0,
      'decr_misses' => 0,
    ];

    return $this->t(
      '@incr increments, @decr decrements',
      [
        '@incr' => number_format($stats['incr_hits'] + $stats['incr_misses']),
        '@decr' => number_format($stats['decr_hits'] + $stats['decr_misses']),
      ]
    );
  }

  /**
   * Statistics report: calculate bytes transferred.
   */
  private function statsTransfer($stats) {
    if ($stats['bytes_written'] == 0) {
      $written = 0;
    }
    else {
      $written = $stats['bytes_read'] / $stats['bytes_written'] * 100;
    }
    return $this->t(
      '@to:@from (@written% to cache)',
      [
        '@to'      => format_size((int) $stats['bytes_read']),
        '@from'    => format_size((int) $stats['bytes_written']),
        '@written' => number_format($written, 2),
      ]
    );
  }

  /**
   * Statistics report: calculate per-connection averages.
   */
  private function statsAverage($stats) {
    if ($stats['total_connections'] == 0) {
      $get   = 0;
      $set   = 0;
      $read  = 0;
      $write = 0;
    }
    else {
      $get   = $stats['cmd_get'] / $stats['total_connections'];
      $set   = $stats['cmd_set'] / $stats['total_connections'];
      $read  = $stats['bytes_written'] / $stats['total_connections'];
      $write = $stats['bytes_read'] / $stats['total_connections'];
    }
    return $this->t(
      '@read in @get gets; @write in @set sets',
      [
        '@get'   => number_format($get, 2),
        '@set'   => number_format($set, 2),
        '@read'  => format_size(number_format($read, 2)),
        '@write' => format_size(number_format($write, 2)),
      ]
    );
  }

  /**
   * Statistics report: calculate available memory.
   */
  private function statsMemory($stats) {
    if ($stats['limit_maxbytes'] == 0) {
      $percent = 0;
    }
    else {
      $percent = 100 - $stats['bytes'] / $stats['limit_maxbytes'] * 100;
    }
    return $this->t(
      '@available (@percent%) of @total',
      [
        '@available' => format_size($stats['limit_maxbytes'] - $stats['bytes']),
        '@percent'   => number_format($percent, 2),
        '@total'     => format_size($stats['limit_maxbytes']),
      ]
    );
  }

  /**
   * Generates render array for output.
   */
  private function statsTablesOutput($bin, $servers, $stats) {
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->getBins();

    $links = [];
    foreach ($servers as $server) {

      // Convert socket file path so it works with an argument, this should
      // have no impact on non-socket configurations. Convert / to !.
      $links[] = Link::fromTextandUrl($server, Url::fromUri('base:/admin/reports/memcache/' . $memcache_bins[$bin] . '/' . str_replace('/', '!', $server)))->toString();
    }

    if (count($servers) > 1) {
      $headers = array_merge(['', t('Totals')], $links);
    }
    else {
      $headers = array_merge([''], $links);
    }

    $output = [];
    foreach ($stats as $table => $data) {
      $rows = [];
      foreach ($data as $data_row) {
        $row = [];
        $row[] = $data_row['label'];
        if (isset($data_row['total'])) {
          $row[] = $data_row['total'];
        }
        foreach ($data_row['servers'] as $server) {
          $row[] = $server;
        }
        $rows[] = $row;
      }
      $output[$table] = [
        '#theme'  => 'table',
        '#header' => $headers,
        '#rows'   => $rows,

      ];
    }

    return $output;
  }

  /**
   * Generates render array for output.
   */
  private function statsTablesRawOutput($cluster, $server, $stats, $type) {
    $user          = \Drupal::currentUser();
    $current_type  = isset($type) ? $type : 'default';
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->getBins();
    $bin           = isset($memcache_bins[$cluster]) ? $memcache_bins[$cluster] : 'default';
    $slab = \Drupal::routeMatch()->getParameter('slab');

    // Provide navigation for the various memcache stats types.
    $links = [];
    if (count($memcache->statsTypes())) {
      foreach ($memcache->statsTypes() as $type) {
        // @todo render array
        $link = Link::fromTextandUrl($type, Url::fromUri('base:/admin/reports/memcache/' . $bin . '/' . str_replace('/', '!', $server) . '/' . ($type == 'default' ? '' : $type)))->toString();
        if ($current_type == $type) {
          $links[] = '<strong>' . $link . '</strong>';
        }
        else {
          $links[] = $link;
        }
      }
    }
    $build = [
      'links' => [
        '#markup' => !empty($links) ? implode($links, ' | ') : '',
      ],
    ];

    $build['table'] = [
      '#type'  => 'table',
      '#header' => [
        $this->t('Property'),
        $this->t('Value'),
      ],
    ];

    $row = 0;

    // Items are returned as an array within an array within an array.  We step
    // in one level to properly display the contained statistics.
    if ($current_type == 'items' && isset($stats['items'])) {
      $stats = $stats['items'];
    }

    foreach ($stats as $key => $value) {

      // Add navigation for getting a cachedump of individual slabs.
      if (($current_type == 'slabs' || $current_type == 'items') && is_int($key) && $user->hasPermission('access slab cachedump')) {
        $build['table'][$row]['key'] = [
          '#type' => 'link',
          '#title' => $this->t('Slab @slab', ['@slab' => $key]),
          '#url' => Url::fromUri('base:/admin/reports/memcache/' . $bin . '/' . str_replace('/', '!', $server) . '/slabs/cachedump/' . $key),
        ];
      }
      else {
        $build['table'][$row]['key'] = ['#plain_text' => $key];
      }

      if (is_array($value)) {
        $subrow = 0;
        $build['table'][$row]['value'] = ['#type' => 'table'];
        foreach ($value as $k => $v) {

          // Format timestamp when viewing cachedump of individual slabs.
          if ($current_type == 'slabs' && $user->hasPermission('access slab cachedump') && !empty($slab) && $k == 0) {
            $k = $this->t('Size');
            $v = format_size($v);
          }
          elseif ($current_type == 'slabs' && $user->hasPermission('access slab cachedump') && !empty($slab) && $k == 1) {
            $k          = $this->t('Expire');
            $full_stats = $memcache->stats($cluster);
            $infinite   = $full_stats[$cluster][$server]['time'] - $full_stats[$cluster][$server]['uptime'];
            if ($v == $infinite) {
              $v = $this->t('infinite');
            }
            else {
              $v = $this->t('in @time', ['@time' => \Drupal::service('date.formatter')->formatInterval($v - \Drupal::time()->getRequestTime())]);
            }
          }
          $build['table'][$row]['value'][$subrow] = [
            'key' => ['#plain_text' => $k],
            'value' => ['#plain_text' => $v],
          ];
          $subrow++;
        }
      }
      else {
        $build['table'][$row]['value'] = ['#plain_text' => $value];
      }
      $row++;
    }

    return $build;
  }

}
