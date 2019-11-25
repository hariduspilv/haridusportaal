<?php

namespace Drupal\purge\Plugin\Purge\Queue\Exception;

/**
 * Unexpected service condition.
 *
 * This exception is only thrown from within the queue service, in case of
 * severe conditions it didn't expect. The most common use case is when the
 * loaded queue fails ::createItem() or ::createItemMultiple() calls.
 */
class UnexpectedServiceConditionException extends \Exception {}
