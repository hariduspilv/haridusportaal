<?php

/**
 * Implements hook_drush_command().
 */
function queue_ui_drush_command() {
  $items = [];

  $items['queue-process'] = [
    'description' => 'Process queue',
    'arguments' => [
      'id' => "The QueueWorker ID",
    ],
    'aliases' => ['qp'],
  ];
  $items['queue-process-all'] = [
    'description' => 'Process all queues',
    'aliases' => ['qpa'],
  ];
  $items['queue-release'] = [
    'description' => 'Remove lease from queue',
    'arguments' => [
      'id' => "The QueueWorker ID",
    ],
    'aliases' => ['qr'],
  ];
  $items['queue-release-all'] = [
    'description' => 'Remove lease from all queue',
    'aliases' => ['qra'],
  ];

  return $items;
}

/**
 * Process queue
 *
 * @param string $queue_name
 */
function drush_queue_ui_queue_process($queue_name = NULL) {
  // Require the choice name to be filled
  if ($queue_name = _queue_ui_queue_choice($queue_name)) {
    // Add operations and start to batch process
    _queue_ui_start_batch([
      ['\Drupal\queue_ui\QueueUIBatch::step', [$queue_name]]
    ]);
  }
}

/**
 * Process all queues
 */
function drush_queue_ui_queue_process_all() {
  $operations = [];

  $queues = \Drupal::service('plugin.manager.queue_worker')->getDefinitions();
  // Add operations for each queue
  foreach ($queues as $queue_name => $queue_definition) {
    $operations[] = ['\Drupal\queue_ui\QueueUIBatch::step', [$queue_name]];
  }

  // Start batch process
  _queue_ui_start_batch($operations);
}

/**
 * Remove lease from queue
 *
 * @param string $queue_name
 */
function drush_queue_ui_queue_release($queue_name = NULL) {
  // Require the choice name to be filled
  if ($queue_name = _queue_ui_queue_choice($queue_name)) {
    _queue_ui_release_queue($queue_name);
  }
}

/**
 * Remove lease from all queues
 */
function drush_queue_ui_queue_release_all() {
  $queues = \Drupal::service('plugin.manager.queue_worker')->getDefinitions();
  // Release each queue
  foreach ($queues as $queue_name => $queue_definition) {
    _queue_ui_release_queue($queue_name);
  }
}

/**
 * Remove leases from all items in a queue
 *
 * @param $queue_name
 */
function _queue_ui_release_queue($queue_name) {
  /** @var \Drupal\queue_ui\QueueUIInterface $queue_ui */
  $queue_ui = \Drupal::service('plugin.manager.queue_ui')->fromQueueName($queue_name);

  // Remove leases
  $num_updated = $queue_ui->releaseItems($queue_name);

  drush_log(t('@count lease reset in queue @name', [
    '@count' => $num_updated,
    '@name' => $queue_name
  ]), 'ok');
}

/**
 * Give the user a choice prompt
 *
 * @param $queue_name
 * @return mixed
 */
function _queue_ui_queue_choice($queue_name) {
  // Queue name is not provided
  if (empty($queue_name)) {
    // Get all defined queue names
    $defined_queues = \Drupal::service('plugin.manager.queue_worker')->getDefinitions();

    $queue_names = array_map(function($queue) {
      // Render queue title
      return $queue['title']->render();
    }, $defined_queues);

    // Show a list of all defined queues
    $queue_name = drush_choice($queue_names, t('Which queue do you want to process?'));
  }

  return $queue_name;
}

/**
 * Helper function to start a batch process
 *
 * @param $operations
 */
function _queue_ui_start_batch($operations) {
  $batch = [
    'operations' => $operations,
  ];

  // Set and configure the batch.
  batch_set($batch);
  $batch =& batch_get();
  $batch['progressive'] = FALSE;

  // Process the batch.
  drush_backend_batch_process();
}
