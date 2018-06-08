<?php

/**
 * @file
 * Contains event_reg_entity.page.inc.
 *
 * Page callback for Event registration entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Event registration templates.
 *
 * Default template: event_reg_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_event_reg_entity(array &$variables) {
  // Fetch EventRegEntity Entity Object.
  $event_reg_entity = $variables['elements']['#event_reg_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
