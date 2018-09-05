<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface;
use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;
use Drupal\purge\Plugin\Purge\Purger\Exception\CapacityException;
use Drupal\purge\Plugin\Purge\Purger\Exception\DiagnosticsException;
use Drupal\purge\Plugin\Purge\Purger\Exception\LockException;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;

/**
 * Claim a chunk of items from the queue and process them.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface $purgeQueue
 *   The purge queue service.
 * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purgeProcessors
 *   The purge processors service.
 * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purgePurgers
 *   The purge purgers service.
 * @param bool $finish
 *   Whether to continue processing till the queue is empty or not.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queue_work($format, QueueServiceInterface $purgeQueue, ProcessorsServiceInterface $purgeProcessors, PurgersServiceInterface $purgePurgers, $finish) {
  $return_boolean = in_array($format, ['yaml', 'json']);
  $return = function($data, $msg) use($return_boolean) {
    $func = ($data === FALSE) ? 'drush_set_error' : 'dt';
    if (is_object($msg)) {
      $msg = ['NOT_AUTHORIZED', $msg->getMessage()];
    }
    if ($return_boolean) {
      return $data;
    }
    return call_user_func_array($func, $msg);
  };

  // Retrieve our queuer object and fail when it is not returned.
  if (!($processor = $purgeProcessors->get('drush_purge_queue_work'))) {
    return $return(FALSE, ['NOT_AUTHORIZED', dt('Not authorized, processor missing!')]);
  }

  // In finish mode, we'll fork ourselves until the entire queue is empty.
  if ($finish) {
    if ($purgeQueue->numberOfItems() < 1) {
      return $return(FALSE, ['NOT_AUTHORIZED', dt('No items can be claimed from the queue.')]);
    }

    // Create the arguments list. Silence subprocesses in boolean mode.
    $arguments = ['@self', 'p-queue-work', [], ['format' => $format]];
    if ($return_boolean) {
      $arguments[] = ['integrate' => FALSE];
    }

    // Iterate until the queue is empty and collect return values.
    $returns = [];
    while (($purgeQueue->numberOfItems() > 0) && (!in_array(FALSE, $returns))) {
      $cmd = call_user_func_array('drush_invoke_process', $arguments);
      if ($cmd['error_status']) {
        $cmd['object'] = FALSE;
      }
      if (is_array($cmd['object']) && empty($cmd['object'])) {
        $cmd['object'] = FALSE;
      }
      $returns[] = $cmd['object'];
    }
    return $return($returns, ['Finished!']);
  }

  // Single chunk processing mode.
  else {
    if (!($claims = $purgeQueue->claim())) {
      return $return(FALSE, ['NOT_AUTHORIZED', dt('No items can be claimed from the queue.')]);
    }
    // Attempt the cache invalidation and deal with errors.
    try {
      $purgePurgers->invalidate($processor, $claims);
    }
    catch (DiagnosticsException $e) {
      return $return(FALSE, $e);
    }
    catch (CapacityException $e) {
      return $return(FALSE, $e);
    }
    catch (LockException $e) {
      return $return(FALSE, $e);
    }
    finally {
      $purgeQueue->handleResults($claims);
    }

    // Evaluate all claim states to booleans and collect the results. Then
    // return the overall outcome, which is FALSE if one failed.
    $results = [];
    foreach ($claims as $claim) {
      $results[] = in_array($claim->getStateString(), ['PROCESSING', 'SUCCEEDED']);
    }
    $result = !in_array(FALSE, $results);
    return $return($result, ['Processed @number objects...', ['@number' => count($claims)]]);
  }
}
