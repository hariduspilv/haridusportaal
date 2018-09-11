<?php

/**
 * @file
 * Contains x_json_entity.page.inc.
 *
 * Page callback for xJson entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for xJson entity templates.
 *
 * Default template: x_json_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_x_json_entity(array &$variables) {
  // Fetch xJsonEntity Entity Object.
  $x_json_entity = $variables['elements']['#x_json_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
