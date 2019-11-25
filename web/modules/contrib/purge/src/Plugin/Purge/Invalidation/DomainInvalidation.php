<?php

namespace Drupal\purge\Plugin\Purge\Invalidation;

/**
 * Describes an entire domain to be invalidated.
 *
 * @PurgeInvalidation(
 *   id = "domain",
 *   label = @Translation("Domain"),
 *   description = @Translation("Invalidates an entire domain name."),
 *   examples = {"www.site.com", "site.com"},
 *   expression_required = TRUE,
 *   expression_can_be_empty = FALSE,
 *   expression_must_be_string = TRUE
 * )
 */
class DomainInvalidation extends InvalidationBase implements InvalidationInterface {}
