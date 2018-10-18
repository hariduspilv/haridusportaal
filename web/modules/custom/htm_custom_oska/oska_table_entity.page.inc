<?php

/**
 * @file
 * Contains oska_table_entity.page.inc.
 *
 * Page callback for Oska table entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Oska table entity templates.
 *
 * Default template: oska_table_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_oska_table_entity(array &$variables) {
  // Fetch OskaTableEntity Entity Object.
  $oska_table_entity = $variables['elements']['#oska_table_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
