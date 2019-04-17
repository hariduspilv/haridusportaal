<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin base of the generic field type.
 */
abstract class ComputedFieldItemBase extends FieldItemBase {
  use ComputedFieldItemTrait {
    fieldSettingsForm as getFieldSettingsFormBase;
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultFieldSettings() {
    return [
      'prefix' => '',
      'suffix' => '',
      'code' => '$value = 0;',
    ] + parent::defaultFieldSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    $element = $this->getFieldSettingsFormBase($form, $form_state);
    $settings = $this->getSettings();

    $element['prefix'] = [
      '#type' => 'textfield',
      '#title' => t('Prefix'),
      '#default_value' => $settings['prefix'],
      '#size' => 60,
      '#description' => t("Define a string that should be prefixed to the value, like '$ ' or '&euro; '. Leave blank for none. Separate singular and plural values with a pipe ('pound|pounds')."),
    ];

    $element['suffix'] = [
      '#type' => 'textfield',
      '#title' => t('Suffix'),
      '#default_value' => $settings['suffix'],
      '#size' => 60,
      '#description' => t("Define a string that should be suffixed to the value, like ' m', ' kb/s'. Leave blank for none. Separate singular and plural values with a pipe ('pound|pounds')."),
    ];

    $element['code']['#title'] = $this->t('Code (PHP) to compute the numeric value');
    $element['code']['#description'] .= t('
<p>
  Here\'s a simple example using the <code>$entity</code>-array which sets the computed field\'s value to the value of the sum of the number fields (<code>field_a</code> and <code>field_b</code>) in an entity:
  <ul>
    <li><code>$value = $entity->field_a->value + $entity->field_b->value;</code></li>
  </ul>
</p>
<p>
  An alternative example using the <code>$fields</code>-array:
  <ul>
    <li><code>$value = $fields[\'field_a\'][0][\'value\'] + $fields[\'field_b\'][0][\'value\'];</code></li>
  </ul>
</p>
    ');
    return $element;
  }

}
