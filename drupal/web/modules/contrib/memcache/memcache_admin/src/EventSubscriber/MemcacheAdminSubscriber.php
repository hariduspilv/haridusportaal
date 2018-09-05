<?php

/**
 * Memcache Admin event subscriber.
 */

namespace Drupal\memcache_admin\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Drupal\Component\Render\HtmlEscapedText;
use Drupal\Core\Render\HtmlResponse;

/**
 * Memcache Admin Subscriber.
 */
class MemcacheAdminSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['display_statistics'];
    return $events;
  }

  /**
   * Display statistics on page.
   */
  public function display_statistics(FilterResponseEvent $event) {
    $user = \Drupal::currentUser();

    // Removed exclusion critiria, untested. Will likely need to add some of
    // these back in.
    //   strstr($_SERVER['PHP_SELF'], '/update.php')
    //   substr($_GET['q'], 0, strlen('batch')) == 'batch'
    //   strstr($_GET['q'], 'autocomplete')
    //   substr($_GET['q'], 0, strlen('system/files')) == 'system/files'
    //   in_array($_GET['q'], ['upload/js', 'admin/content/node-settings/rebuild'])
    // @todo validate these checks
    if ($user->id() == 0) {
      // suppress for the above criteria.
    }
    else {
      $response = $event->getResponse();

      // Don't call theme() during shutdown if the registry has been rebuilt (such
      // as when enabling/disabling modules on admin/build/modules) as things break.
      // Instead, simply exit without displaying admin statistics for this page
      // load.  See http://drupal.org/node/616282 for discussion.
      // @todo make sure this is not still a requirement.
      // if (!function_exists('theme_get_registry') || !theme_get_registry()) {
      //   return;
      // }

      // Try not to break non-HTML pages.
      if ($response instanceof HTMLResponse) {

        // This should only apply to page content.
        if (stripos($response->headers->get('content-type'), 'text/html') !== FALSE) {
          $show_stats = \Drupal::config('memcache_admin.settings')->get('show_memcache_statistics');
          if ($show_stats && $user->hasPermission('access memcache statistics')) {
            $output = '';

            $memcache       = \Drupal::service('memcache.factory')->get(NULL, TRUE);
            $memcache_stats = $memcache->request_stats();
            if (!empty($memcache_stats['ops'])) {
              foreach ($memcache_stats['ops'] as $row => $stats) {
                $memcache_stats['ops'][$row][0] = new HtmlEscapedText($stats[0]);
                $memcache_stats['ops'][$row][1] = number_format($stats[1], 2);
                $hits                           = number_format($this->stats_percent($stats[2], $stats[3]), 1);
                $misses                         = number_format($this->stats_percent($stats[3], $stats[2]), 1);
                $memcache_stats['ops'][$row][2] = number_format($stats[2]) . " ($hits%)";
                $memcache_stats['ops'][$row][3] = number_format($stats[3]) . " ($misses%)";
              }

              $build = [
                '#theme'  => 'table',
                '#header' => [
                  t('operation'),
                  t('total ms'),
                  t('total hits'),
                  t('total misses'),
                ],
                '#rows'   => $memcache_stats['ops'],
              ];
              $output .= \Drupal::service('renderer')->renderRoot($build);
            }

            if (!empty($memcache_stats['all'])) {
              foreach ($memcache_stats['all'] as $row => $stats) {
                $memcache_stats['all'][$row][1] = new HtmlEscapedText($stats[1]);
                $memcache_stats['all'][$row][2] = new HtmlEscapedText($stats[2]);
                $memcache_stats['all'][$row][3] = new HtmlEscapedText($stats[3]);
              }

              $buiild = [
                '#theme'  => 'table',
                '#header' => [
                  t('ms'),
                  t('operation'),
                  t('bin'),
                  t('key'),
                  t('status'),
                ],
                '#rows'   => $memcache_stats['all'],
              ];
              $output .= \Drupal::service('renderer')->renderRoot($build);
            }

            if (!empty($output)) {
              $response->setContent($response->getContent() . '<div id="memcache-devel"><h2>' . t('Memcache statistics') . '</h2>' . $output . '</div>');
            }
          }
        }
      }
    }
  }

  /**
   * Helper function. Calculate a percentage.
   */
  private function stats_percent($a, $b) {
    if ($a == 0) {
      return 0;
    }
    elseif ($b == 0) {
      return 100;
    }
    else {
      return $a / ($a + $b) * 100;
    }
  }
}