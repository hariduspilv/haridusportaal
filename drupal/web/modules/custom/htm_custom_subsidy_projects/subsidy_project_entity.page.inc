<?php

/**
 * @file
 * Contains subsidy_project_entity.page.inc.
 *
 * Page callback for Subsidy project entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Subsidy project templates.
 *
 * Default template: subsidy_project_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_subsidy_project_entity(array &$variables) {
  // Fetch SubsidyProjectEntity Entity Object.
  $subsidy_project_entity = $variables['elements']['#subsidy_project_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
