<?php

namespace Drupal\queue_ui;

use Drupal\Core\Queue\RequeueException;
use Drupal\Core\Queue\SuspendQueueException;
use Drupal\Core\Render\Markup;

/**
 * Batch controller to process a queue from the UI.
 *
 * Class QueueUIBatch
 *
 * @package Drupal\queue_ui
 */
class QueueUIBatch {

  /**
   * Batch step definition to process a queue.
   *
   * Each time the step is executed an item on the queue will be processed.
   * The batch job will be marked as finished when the queue is empty.
   *
   * Based on \Drupal\Core\Cron::processQueues().
   *
   * @param $queue_name
   * @param $context
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public static function step($queue_name, &$context) {
    /** @var $queue_manager \Drupal\Core\Queue\QueueWorkerManagerInterface */
    $queue_manager = \Drupal::service('plugin.manager.queue_worker');
    /** @var \Drupal\Core\Queue\QueueFactory $queue_factory */
    $queue_factory = \Drupal::service('queue');

    // Make sure every queue exists. There is no harm in trying to recreate
    // an existing queue.
    $info = $queue_manager->getDefinition($queue_name);
    $queue_factory->get($queue_name)->createQueue();
    $queue_worker = $queue_manager->createInstance($queue_name);
    $queue = $queue_factory->get($queue_name);

    $context['finished'] = 0;
    $context['results']['queue_name'] = $info['title'];

    $title = t('Processing queue %name: %count items remaining', [
      '%name' => $info['title'],
      '%count' => $queue->numberOfItems(),
    ]);

    try {
      if ($item = $queue->claimItem()) {
        // Let other modules alter the title of the item being processed.
        \Drupal::moduleHandler()
          ->alter('queue_ui_batch_title', $title, $item->data);
        $context['message'] = $title;

        // Process and delete item
        $queue_worker->processItem($item->data);
        $queue->deleteItem($item);

        // Update context
        $context['results']['processed'][] = $item->item_id;
      }
      else {
        // If we cannot claim an item we must be done processing this queue.
        $context['finished'] = 1;
      }
    } catch (RequeueException $e) {
      if (isset($item)) {
        // The worker requested the task be immediately requeued.
        $queue->releaseItem($item);
      }
    } catch (SuspendQueueException $e) {
      // If the worker indicates there is a problem with the whole queue,
      if (isset($item)) {
        // release the item and skip to the next queue.
        $queue->releaseItem($item);
      }

      watchdog_exception('queue_ui', $e);
      $context['results']['errors'][] = $e->getMessage();

      // Marking the batch job as finished will stop further processing.
      $context['finished'] = 1;
    } catch (\Exception $e) {
      // In case of any other kind of exception, log it and leave the item
      // in the queue to be processed again later.
      watchdog_exception('queue_ui', $e);
      $context['results']['errors'][] = $e->getMessage();
    }
  }

  /**
   * Callback when finishing a batch job.
   *
   * @param $success
   * @param $results
   * @param $operations
   */
  public static function finish($success, $results, $operations) {
    \Drupal::messenger()->addMessage(
      \Drupal::translation()->formatPlural(
        count($results['processed']),
        'Queue %queue: One item successfully processed.',
        'Queue %queue: @count items successfully processed.',
        ['%queue' => $results['queue_name']]
      )
    );
    if (!empty($results['errors'])) {
      \Drupal::messenger()->addError(
        \Drupal::translation()->formatPlural(
          count($results['errors']),
          'Queue %queue error: @errors',
          'Queue %queue errors: <ul><li>@errors</li></ul>',
          [
            '%queue' => $results['queue_name'],
            // We only want list markup for the plural case.
            // Thus is it very appropriate that implode
            // will not add glue for single entry array.
            '@errors' => Markup::create(implode('</li><li>', $results['errors'])),
          ]
        )
      );
    }
  }
}