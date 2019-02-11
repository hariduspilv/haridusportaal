<?php

/**
 * @file
 * Contains oska_filling_bar_entity.page.inc.
 *
 * Page callback for Oska filling bar entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Oska filling bar entity templates.
 *
 * Default template: oska_filling_bar_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_oska_filling_bar_entity(array &$variables) {
  // Fetch OskaFillingBarEntity Entity Object.
  $oska_filling_bar_entity = $variables['elements']['#oska_filling_bar_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
