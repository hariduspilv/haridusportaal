<?php

/**
 * @file
 * Contains oska_entity.page.inc.
 *
 * Page callback for Oska entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Oska entity templates.
 *
 * Default template: oska_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_oska_file_entity(array &$variables) {
  // Fetch OskaEntity Entity Object.
  $oska_file_entity = $variables['elements']['#oska_file_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
