<?php

/**
 * @file
 * Contains favorite_entity.page.inc.
 *
 * Page callback for Favorite entity entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Favorite entity templates.
 *
 * Default template: favorite_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_favorite_entity(array &$variables) {
  // Fetch FavoriteEntity Entity Object.
  $favorite_entity = $variables['elements']['#favorite_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
