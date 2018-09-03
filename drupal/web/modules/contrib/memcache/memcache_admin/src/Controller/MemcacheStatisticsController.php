<?php

/**
 * @file
 * Contains \Drupal\memcache_admin\Controller\MemcacheStatisticsController.
 */

namespace Drupal\memcache_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\Component\Render\HtmlEscapedText;

/**
 * Memcache Statistics.
 */
class MemcacheStatisticsController extends ControllerBase {

  /**
   * Callback for the Memcache Stats page.
   *
   * @param string $bin
   *
   * @return string
   *   The page output.
   */
  public function stats_table($bin = 'default') {
    $output  = [];
    $servers = [];

    // Get the statistics.
    $bin      = $this->bin_mapping($bin);
    $memcache = \Drupal::service('memcache.factory')->get($bin, TRUE);
    $stats    = $memcache->stats($bin, 'default', TRUE);

    if (empty($stats)) {

      // Break this out to make drupal_set_message easier to read.
      $additional_message = $this->t(
        '@enable the memcache module',
        [
          '@enable' => l(t('enable'), 'admin/modules', ['fragment' => 'edit-modules-performance-and-scalability'])
        ]
      );
      if (module_exists('memcache')) {
        $additional_message = $this->t(
          'visit the Drupal admin @status page',
          [
            '@status' => l(t('status report'), 'admin/reports/status')
          ]
        );
      }

      // Failed to load statistics. Provide a useful error about where to get
      // more information and help.
      drupal_set_message(
        t(
          'There may be a problem with your Memcache configuration. Please review @readme and :more for more information.',
          [
            '@readme' => 'README.txt',
            ':more'   => $additional_message,
          ]
        ),
        'error'
      );
    }
    else {
      if (count($stats[$bin])) {
        $stats     = $stats[$bin];
        $aggregate = array_pop($stats);

        if ($memcache->memcache() instanceof \Memcached) {
          $version = t('Memcached v@version', ['@version' => phpversion('Memcached')]);
        }
        elseif ($memcache->memcache() instanceof \Memcache) {
          $version = t('Memcache v@version', ['@version' => phpversion('Memcache')]);
        }
        else {
          $version = t('Unknown');
          drupal_set_message(t('Failed to detect the memcache PECL extension.'), 'error');
        }

        foreach ($stats as $server => $statistics) {
          if (empty($statistics['uptime'])) {
            drupal_set_message(t('Failed to connect to server at :address.', [':address' => $server]), 'error');
          }
          else {
            $servers[] = $server;

            $data['server_overview'][$server]    = t('v@version running @uptime', ['@version' => $statistics['version'], '@uptime' => \Drupal::service('date.formatter')->formatInterval($statistics['uptime'])]);
            $data['server_pecl'][$server]        = t('n/a');
            $data['server_time'][$server]        = format_date($statistics['time']);
            $data['server_connections'][$server] = $this->stats_connections($statistics);
            $data['cache_sets'][$server]         = $this->stats_sets($statistics);
            $data['cache_gets'][$server]         = $this->stats_gets($statistics);
            $data['cache_counters'][$server]     = $this->stats_counters($statistics);
            $data['cache_transfer'][$server]     = $this->stats_transfer($statistics);
            $data['cache_average'][$server]      = $this->stats_average($statistics);
            $data['memory_available'][$server]   = $this->stats_memory($statistics);
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
        $report['uptime']['connections']['total'] = $this->stats_connections($aggregate);
        $report['memory']['memory']['total']      = $this->stats_memory($aggregate);
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
          $func = "stats_{$type}";
          $report['stats'][$type]['total'] = $this->$func($aggregate);
        }
      }

      $output = $this->stats_tables_output($bin, $servers, $report);
    }

    return $output;
  }

  /**
   * Callback for the Memcache Stats page.
   *
   * @param string $cluster
   * @param string $server
   * @param string $type
   *
   * @return string
   *   The page output.
   */
  public function stats_table_raw($cluster, $server, $type = 'default') {
    $cluster = $this->bin_mapping($cluster);
    $server  = str_replace('!', '/', $server);

    // @todo - pull slab stats for Memcache
    // $slab = (int) arg(7);
    // if (arg(6) == 'cachedump' && !empty($slab) && user_access('access slab cachedump')) {
    //   $stats = dmemcache_stats($cluster, arg(7), FALSE);
    // }
    // else {
      $memcache = \Drupal::service('memcache.factory')->get($cluster, TRUE);
      $stats    = $memcache->stats($cluster, $type, FALSE);
    // }

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
    if (isset($stats[$cluster][$server]) && is_array($stats[$cluster][$server]) && count($stats[$cluster][$server])) {
      $output = $this->stats_tables_raw_output($cluster, $server, $stats[$cluster][$server], $type);
    }
    elseif ($type == 'slabs' && is_array($stats[$cluster]) && count($stats[$cluster])) {
      $output = $this->stats_tables_raw_output($cluster, $server, $stats[$cluster], $type);
    }
    else {
      $output = $this->stats_tables_raw_output($cluster, $server, [], $type);
      drupal_set_message(t('No @type statistics for this bin.', ['@type' => $type]));
    }

    return $output;
  }

  /**
   * Helper function, reverse map the memcache_bins variable.
   */
  private function bin_mapping($bin = 'cache') {
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->get_bins();

    $bins = array_flip($memcache_bins);
    if (isset($bins[$bin])) {
      return $bins[$bin];
    }
    else {
      return $this->default_bin($bin);
    }
  }

  /**
   * Helper function. Returns the bin name.
   */
  private function default_bin($bin) {
    if ($bin == 'default') {
      return 'cache';
    }

    return $bin;
  }

  /**
   * Statistics report: format total and open connections.
   */
  private function stats_connections($stats) {
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
  private function stats_sets($stats) {
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
        '@total'   => number_format($stats['cmd_set'] + $stats['cmd_get'])
      ]
    );
  }

  /**
   * Statistics report: calculate # of get cmds, broken down by hits and misses.
   */
  private function stats_gets($stats) {
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
        '@total'        => number_format($stats['cmd_get'])
      ]
    );
  }

  /**
   * Statistics report: calculate # of increments and decrements.
   */
  private function stats_counters($stats) {
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
        '@decr' => number_format($stats['decr_hits'] + $stats['decr_misses'])
      ]
    );
  }

  /**
   * Statistics report: calculate bytes transferred.
   */
  private function stats_transfer($stats) {
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
        '@written' => number_format($written, 2)
      ]
    );
  }

  /**
   * Statistics report: calculate per-connection averages.
   */
  private function stats_average($stats) {
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
        '@write' => format_size(number_format($write, 2))
      ]
    );
  }

  /**
   * Statistics report: calculate available memory.
   */
  private function stats_memory($stats) {
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
        '@total'     => format_size($stats['limit_maxbytes'])
      ]
    );
  }

  /**
   * Generates render array for output.
   */
  private function stats_tables_output($bin, $servers, $stats) {
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->get_bins();

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
  private function stats_tables_raw_output($cluster, $server, $stats, $type) {
    $user          = \Drupal::currentUser();
    $current_type  = isset($type) ? $type : 'default';
    $memcache      = \Drupal::service('memcache.factory')->get(NULL, TRUE);
    $memcache_bins = $memcache->get_bins();
    $bin           = isset($memcache_bins[$cluster]) ? $memcache_bins[$cluster] : 'default';

    // Provide navigation for the various memcache stats types.
    $links = [];
    if (count($memcache->stats_types())) {
      foreach ($memcache->stats_types() as $type) {
        $link = Link::fromTextandUrl($this->t($type), Url::fromUri('base:/admin/reports/memcache/' . $bin . '/' . str_replace('/', '!', $server) . '/' . ($type == 'default' ? '' : $type)))->toString();
        if ($current_type == $type) {
          $links[] = '<strong>' . $link . '</strong>';
        }
        else {
          $links[] = $link;
        }
      }
    }
    $output = [
      'links' => [
        '#markup' => !empty($links) ? implode($links, ' | ') : '',
      ],
    ];

    $headers = [$this->t('Property'), $this->t('Value')];
    $rows    = [];

    // Items are returned as an array within an array within an array.  We step
    // in one level to properly display the contained statistics.
    if ($current_type == 'items' && isset($stats['items'])) {
      $stats = $stats['items'];
    }

    foreach ($stats as $key => $value) {

      // Add navigation for getting a cachedump of individual slabs.
      // @todo - verify if this works correctly with Memcache
      if (($current_type == 'slabs' || $current_type == 'items') && is_int($key) && $user->hasPermission('access slab cachedump')) {
        $key = Link::fromTextandUrl($this->t($type), Url::fromUri('base:/admin/reports/memcache/' . $bin . '/' . str_replace('/', '!', $server) . '/slabs/cachedump/' . $key))->toString();
      }
      if (is_array($value)) {
        $rs = [];
        foreach ($value as $k => $v) {

          // Format timestamp when viewing cachedump of individual slabs.
          if ($current_type == 'slabs' && user_access('access slab cachedump') && arg(6) == 'cachedump' && $k == 0) {
            $k = $this->t('Size');
            $v = format_size($v);
          }
          elseif ($current_type == 'slabs' && user_access('access slab cachedump') && arg(6) == 'cachedump' && $k == 1) {
            $k          = $this->t('Expire');
            $full_stats = $memcache->stats($cluster);
            $infinite   = $full_stats[$cluster][$server]['time'] - $full_stats[$cluster][$server]['uptime'];
            if ($v == $infinite) {
              $v = $this->t('infinite');
            }
            else {
              $v = $this->t('in @time', ['@time' => format_interval($v - REQUEST_TIME)]);
            }
          }
          $k    = new HtmlEscapedText($k);
          $v    = new HtmlEscapedText($v);
          $rs[] = [$k, $v];
        }
        $rows[] = [
          'key'   => $key,
          'value' => [
            '#theme' => 'table',
            '#rows'  => $rs,
          ],
        ];
      }
      else {
        $key    = new HtmlEscapedText($key);
        $value  = new HtmlEscapedText($value);
        $rows[] = [$key, $value];
      }
    }

    $output['table'] = [
      '#theme'  => 'table',
      '#header' => $headers,
      '#rows'   => $rows,
    ];

    return $output;
  }
}
