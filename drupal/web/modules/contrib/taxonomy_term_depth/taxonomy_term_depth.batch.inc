<?php
/**
 * @file
 */

/**
 * Require constants here again
 */
require_once __DIR__. '/constants.inc';

/**
 * @param $options
 * @param $context
 */
function taxonomy_term_depth_batch_callbacks_update_term_depth($options, &$context) {
  /**
   * @var \Drupal\Core\Database\Connection.
   */
  $dbh = \Drupal::database();

  $sandbox = &$context['sandbox'];
  // Build query
  $query = $dbh->select('taxonomy_term_field_data', 'ttd');
  $query
    ->fields('ttd', array('tid'));

  if (!empty($options['vids'])) {
    $query
      ->condition('ttd.vid', (array) $options['vids'], 'IN');
  }

  $query
    ->groupBy('ttd.tid');

  // Count ALL elements and save the value for further usage
  if (!isset($sandbox['count'])) {
    // Clear all depths first
    $updateQuery = $dbh->update('taxonomy_term_field_data')
      ->fields([
        'depth_level' => NULL,
      ]);

    if (!empty($options['vids'])) {
      $updateQuery
        ->condition('vid', (array) $options['vids'], 'IN');
    }

    $updateQuery
      ->execute();

    $sandbox['count'] = $query->countQuery()->execute()->fetchField();
  }

  $sandbox += array(
    'position' => 0,
    'bunch' => 20,
  );

  //$sandbox['position'] += $sandbox['bunch'];

  $query
    ->range($sandbox['position'], $sandbox['bunch']);

  foreach ($query->execute() as $row) {
    // Forcely rebuild data in database
    taxonomy_term_depth_get_by_tid($row->tid, TRUE);
    $sandbox['position']++;
  }

  $context['finished'] = $sandbox['position'] / $sandbox['count'];
  $context['finished'] = $context['finished'] > 1 ? 1 : $context['finished'];
}
