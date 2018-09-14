<?php

/**
 * @file
 * Contains \Drupal\easychart\EasychartHelper
 */

namespace Drupal\easychart;

class EasychartHelper {

  /**
   * Helper function to print the actual chart.
   *
   * @param array $values
   *   The field item values
   * @param int $entity_id
   *   The entity id
   * @param int $delta
   *   The delta
   * @param string $field_name
   *   The field name
   *
   * @return string $output
   *   The field output.
   */
  public static function easychartPrintChart($values, $entity_id, $delta, $field_name = 'easychart') {
    $output = [];

    // Verify csv being given.
    if (empty($values['csv'])) {
      return FALSE;
    }
    // Add JS for each instance when config is set.
    else {
      // Print a div for js to pick up & render chart.
      $output['identifier'] = $entity_id . '-' .  $delta. '-' . $field_name;
      $output['markup'] = '<div class="easychart-embed--' . $output['identifier'] . '"></div>';
      // Add config to output.
      $output['config'] = $values['config'];
      // Add csv to output.
      $output['csv'] = (!empty($values['csv'])) ? $values['csv'] : '';
      $output['presets'] = \Drupal::config('easychart.settings')->get('presets');
    }
    return $output;
  }

  /**
   * Add libraries to render a chart.
   *
   * @param $element
   */
  public static function addRenderLibraries(&$element) {
    $element['#attached']['library'][] = 'easychart/easychart.render';
    $element['#attached']['library'][] = 'easychart/lib.highcharts';
    $element['#attached']['library'][] = 'easychart/lib.easycharts.render';
  }
}
