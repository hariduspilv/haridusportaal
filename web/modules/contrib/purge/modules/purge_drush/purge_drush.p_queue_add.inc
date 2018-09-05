<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\InvalidExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\MissingExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface;
use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;

/**
 * Add one or more items to the queue for later processing.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface $purgeQueue
 *   The purge queue service.
 * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purgeQueuers
 *   The purge queuers service.
 * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface $purgeInvalidationFactory
 *   The purge invalidation factory service.
 * @param string ...
 *   All other parameters are expected to be in the format "<TYPE> <EXPRESSION>"
 *   and can contain comma's to separate extra items, in the same format.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queue_add($format, QueueServiceInterface $purgeQueue, QueuersServiceInterface $purgeQueuers, InvalidationsServiceInterface $purgeInvalidationFactory) {
  $return_exception = function($exception, $message = '') use($format) {
    if ($format === 'string') {
      return drush_set_error('ERROR', $message ? $message : $exception->getMessage());
    }
    return FALSE;
  };

  // Retrieve our queuer object and fail when it is not returned.
  if (!($queuer = $purgeQueuers->get('drush_purge_queue_add'))) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('NOT_AUTHORIZED', dt('Not authorized, queuer missing!'));
  }

  // Clean input and parse comma-separated input items.
  $items = array_slice(func_get_args(), 4);
  $items = array_map('trim', explode(',', implode(' ', $items)));
  array_walk($items, function(&$value, $key) {
    $value = explode(' ', $value);
    if (!isset($value[1])) {
      $value[1] = NULL;
    }
  });

  // Iterate the provided input and provide feedback to the user.
  $invalidations = [];
  foreach ($items as $i => $item) {
    list($type, $expression) = $item;
    if (is_null($type) || empty($type)) {
      unset($items[$i]);
      continue;
    }

    // Instantiate the invalidation object based on user input.
    try {
      $invalidations[] = $purgeInvalidationFactory->get($type, $expression);
    }
    catch (PluginNotFoundException $e) {
      return $return_exception(
        $e,
        dt("Type '@type' does not exist, see 'drush p-types' for available types.", ['@type' => $type])
      );
    }
    catch (InvalidExpressionException $e) {
      return $return_exception($e);
    }
    catch (TypeUnsupportedException $e) {
      return $return_exception(
        $e,
        dt("There is no purger supporting '@type', please install one!", ['@type' => $type])
      );
    }
    catch (MissingExpressionException $e) {
      return $return_exception($e);
    }

    // Prevent users from accidentally harming their website.
    if (($format === 'string') && ($type === 'everything')) {
      drush_print("Invalidating everything will mass-clear potentially"
        . " thousands of pages, which could temporarily make your site really"
        . " slow as external caches will have to warm up again.\n");
      if (!drush_confirm("Are you really sure?")) {
        drush_user_abort();
        return;
      }
    }
  }

  // Add the objects to the queue and give user feedback.
  $purgeQueue->add($queuer, $invalidations);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('Added @count item(s) to the queue.', ['@count' => count($invalidations)]);
}
