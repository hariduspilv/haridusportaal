<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface;

/**
 * View the queue statistics.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface $purgeQueueStats
 *   The purge queue statistics service.
 * @param bool $reset_totals
 *   Wipe the TOTAL statistical counters.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queue_stats($format, StatsTrackerInterface $purgeQueueStats, $reset_totals) {

  // Reset the total counters if requested to.
  if ($reset_totals && ($format === 'table')) {
    drush_print("You are about to reset all total counters...\n");
    if (drush_confirm("Are you really sure?")) {
      $purgeQueueStats->resetTotals();
      drush_print("Done!");
    }
    else {
      drush_user_abort();
    }
    return;
  }
  elseif ($reset_totals) {
    $purgeQueueStats->resetTotals();
  }

  // Normal output generation.
  if ($format === 'table') {
    $table = [];
    $align_right = function($input, $size = 20) {
      return str_repeat(' ', $size - strlen($input)) . $input;
    };
    foreach ($purgeQueueStats as $statistic) {
      $table[] = [
        'left' => $align_right(strtoupper($statistic->getId())),
        'right' => $statistic->getTitle()
      ];
      $table[] = [
        'left' => $align_right($statistic->getInteger()),
        'right' => '',
      ];
      $table[] = ['left' => '', 'right' => $statistic->getDescription()];
      $table[] = ['left' => '', 'right' => ''];
    }
    return $table;
  }
  else {
    $statistics = [];
    foreach ($purgeQueueStats as $statistic) {
      $statistics[$statistic->getId()] = $statistic->getInteger();
    }
    return $statistics;
  }
}
