<?php

/**
 * @file
 * Contains subscription_entity.page.inc.
 *
 * Page callback for Subscription entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Subscription entity templates.
 *
 * Default template: subscription_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_subscription_entity(array &$variables) {
  // Fetch SubscriptionEntity Entity Object.
  $subscription_entity = $variables['elements']['#subscription_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
