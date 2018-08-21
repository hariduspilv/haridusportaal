<?php

/**
 * @file
 * Contains contribution_project_entity.page.inc.
 *
 * Page callback for Contribution project entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Contribution project templates.
 *
 * Default template: contribution_project_entity.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_contribution_project_entity(array &$variables) {
  // Fetch ContributionProjectEntity Entity Object.
  $contribution_project_entity = $variables['elements']['#contribution_project_entity'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
