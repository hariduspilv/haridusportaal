<?php

namespace Drupal\purge\Plugin\Purge\Invalidation;

/**
 * Describes that everything is to be invalidated.
 *
 * @PurgeInvalidation(
 *   id = "everything",
 *   label = @Translation("Everything"),
 *   description = @Translation("Invalidates everything."),
 *   expression_required = FALSE
 * )
 */
class EverythingInvalidation extends InvalidationBase implements InvalidationInterface {}
