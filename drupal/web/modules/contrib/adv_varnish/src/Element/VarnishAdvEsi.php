<?php

namespace Drupal\adv_varnish\Element;

use Drupal\Core\GeneratedUrl;
use Drupal\Core\Render\Element\RenderElement;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;

/**
 * Provides an entity varnish esi form element.
 *
 * The #default_value accepted by this element is either an entity object or an
 * array of entity objects.
 * [#original_build] is used for collect attachments.
 * TODO avoid using original_build.
 *
 * Example with using hook_api:
 *
 * @code
 * $esiElement = [
 *   '#type => 'adv_esi',
 *   '#data_type' => 'user-name',
 *   '#params' => [],
 *   '#original_build' => [
 *     '#markup' => t('Administrator'),
 *     '#attached' => [],
 *   ],
 * ];
 *
 * // TODO Example with using static methods.:
 * $esiElement = [
 *   '#type => 'adv_esi',
 *   '#callback' => ['\Drupal\adv_varnish\EsiExample', 'userName'],
 *   '#params' => [],
 * ];
 * @endcode
 *
 * @RenderElement("adv_esi")
 */
class VarnishAdvEsi extends RenderElement {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    $class = get_class($this);
    return [
      '#pre_render' => [
        [$class, 'preRenderEsi'],
      ],
    ];
  }

  /**
   * PreRender a esi element.
   *
   * @param array $element
   *   An associative array containing the properties and children of the
   *   container.
   *
   * @return array
   *   The preRendered element.
   */
  public static function preRenderEsi(array $element) {
    if (!isset($element['#attached'])) {
      $element['#attached'] = [];
    }

    // Add attached from original build.
    // TODO add attachments on the page with response.
    if (isset($element['#original_build'])) {
      // Load dependencies via render.
      \Drupal::service('renderer')->renderRoot($element['#original_build']);
      $element['#attached'] = static::findAttachments($element['#original_build'], $element['#attached']);
      unset($element['#original_build']);
    }

    // Create placeholder.
    $params = ['query' => isset($element['#params']) ? $element['#params'] : []];
    if (isset($element['#data_type'])) {
      $src = Url::fromRoute('adv_varnish.esi', ['type' => $element['#data_type']], $params);
    }
    // TODO create placeholder based on ['#callback' => ''].
    if (!empty($src)) {
      $src_string = $src->toString();
      if ( $src_string instanceof GeneratedUrl ) {
        $src_string = $src_string->getGeneratedUrl();
      }
      $element['esi'] = [
        '#markup' => Markup::create('<esi:include src="' . $src_string . '" max-age="0" />'),
      ];
    }
    return $element;
  }

  /**
   * Function for finding Attached data.
   *
   * @param array $element
   *   Element for lookup attachments.
   * @param array $attach
   *   Attachments.
   *
   * @return array
   *   Attachments.
   */
  public static function findAttachments(array $element, array $attach = []) {
    if (!is_array($element)) {
      return $attach;
    }

    // Process Attachments.
    if (isset($element['#attached']) && is_array($element['#attached'])) {
      $attach = static::collectAttachments($element, $attach);
    }

    // Lookup child elements.
    foreach ($element as $item) {
      if (!is_array($item)) {
        continue;
      }
      $attach = static::findAttachments($item, $attach);
    }

    return $attach;
  }

  /**
   * Collect Attachments from Element to the $attach array.
   *
   * @param array $element
   *   Element.
   * @param array $attach
   *   Attachments.
   *
   * @return array
   *   Attachments.
   */
  protected static function collectAttachments(array $element, array $attach) {
    foreach ($element['#attached'] as $key => $items) {
      if (!in_array($key, ['library', 'drupalSettings'])) {
        continue;
      }
      if (!isset($attach[$key])) {
        $attach[$key] = [];
      }
      // Process library.
      if ($key == 'library') {
        $attach[$key] = array_merge($attach[$key], $items);
        continue;
      }

      // Process drupalSettings.
      foreach ($items as $drupalSettingsKey => $drupalSettingsItem) {
        if (!isset($attach[$key][$drupalSettingsKey])) {
          $attach[$key][$drupalSettingsKey] = [];
        }
        $attach[$key][$drupalSettingsKey] = array_merge($attach[$key][$drupalSettingsKey], $items[$drupalSettingsKey]);
      }
    }
    return $attach;
  }

}
