<?php

/**
 * @file
 * Contains oska_indicator_entity.page.inc.
 *
 * Page callback for Oska indicator entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Oska indicator entity templates.
 *
 * Default template: oska_indicator_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_oska_indicator_entity(array &$variables) {
  // Fetch OskaIndicatorEntity Entity Object.
  $oska_indicator_entity = $variables['elements']['#oska_indicator_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
