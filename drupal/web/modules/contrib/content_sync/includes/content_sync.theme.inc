<?php

/**
 * @file
 * Preprocessors and helper functions to make theming easier.
 */
use Drupal\Core\Link;
use Drupal\Core\Render\Element;
use Drupal\Core\Url;
use Drupal\Core\Serialization\Yaml;
use Drupal\Core\Template\Attribute;
use Drupal\Component\Utility\Xss;
use Drupal\webform\Element\WebformCodeMirror;
use Drupal\webform\WebformMessageManagerInterface;
use Drupal\webform\Utility\WebformYaml;
use Drupal\webform\Utility\WebformDateHelper;
use Drupal\webform\Utility\WebformDialogHelper;
use Drupal\webform\Utility\WebformElementHelper;

/**
 * Prepares variables for contnt sync help.
 *
 * Default template: content_sync_help.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - title: Help title.
 *   - content: Help content.
 */
function template_preprocess_content_sync_help(array &$variables) {
  /** @var \Drupal\content_sync\ContentSyncHelpManagerInterface $help_manager */
  $help_manager = \Drupal::service('content_sync.help_manager');

  $help_info = $variables['info'];

  $variables += $help_info;

  $help = [];
  if (!empty($help_info['menu']) && !\Drupal::config('content_sync.settings')->get('content_sync.help_menu_disabled')) {
    $help['menu'] = $help_manager->buildHelpMenu();
  }
  if (is_array($help_info['content'])) {
    $help['content'] = $help_info['content'];
  }
  else {
    $help['content'] = [
      '#markup' => $help_info['content'],
    ];
  }

  $variables['help'] = $help;
}

/******************************************************************************/
// Element templates
/******************************************************************************/

/**
 * Prepares variables for Content Sync message templates.
 *
 * Default template: content-sync-message.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - element: An associative array containing the properties of the element.
 *     Properties used: #id, #attributes, #children.
 *
 * @see template_preprocess_container()
 */
function template_preprocess_content_sync_message(array &$variables) {
  $variables['has_parent'] = FALSE;
  $element = $variables['element'];
  // Ensure #attributes is set.
  $element += ['#attributes' => []];

  // Special handling for content_sync elements.
  if (isset($element['#array_parents'])) {
    // Assign an html ID.
    if (!isset($element['#attributes']['id'])) {
      $element['#attributes']['id'] = $element['#id'];
    }
    $variables['has_parent'] = TRUE;
  }

  $variables['message'] = $element['#message'];
  $variables['attributes'] = $element['#attributes'];
  if (isset($element['#closed'])) {
    $variables['closed'] = $element['#closed'];
  }
}