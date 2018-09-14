<?php

/**
 * @file
 * Contains \Drupal\easychart\Plugin\Field\FieldWidget\EasychartFormatter.
 */

namespace Drupal\easychart\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\easychart\EasychartHelper;

/**
 * Provides a default Easychart formatter.
 *
 * @FieldFormatter(
 *   id = "easychart_default",
 *   module = "easychart",
 *   label = @Translation("Default"),
 *   field_types = {
 *     "easychart"
 *   },
 *   quickedit = {
 *     "editor" = "disabled"
 *   }
 * )
 */
class Easychart extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {

    // Unique distinction by $entity_id & $delta.
    $entity_id = $items->getEntity()->id();
    $field_name = $this->fieldDefinition->getFieldStorageDefinition()->getName();
    $element = [];

    foreach ($items as $delta => $item) {
      if ($output = EasychartHelper::easychartPrintChart($item->getValue(), $entity_id, $delta, $field_name)) {
        $element[$delta] = array('#markup' => $output['markup']);
        $element['#attached']['drupalSettings']['easychart'][$output['identifier']] = array(
          'config' => $output['config'],
          'csv' => $output['csv'],
          'presets' => $output['presets'],
        );
      }
    }

    if (!empty($element)) {
      EasychartHelper::addRenderLibraries($element);
    }

    return $element;
  }

}
