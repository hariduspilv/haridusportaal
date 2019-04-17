<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\Plugin\Field\FieldType\StringItemBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin base of the string field type.
 */
abstract class ComputedStringItemBase extends StringItemBase {
  use ComputedFieldItemTrait {
    fieldSettingsForm as getFieldSettingsFormBase;
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultFieldSettings() {
    return [
      'code' => '$value = \'\';',
    ] + parent::defaultFieldSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    $element = $this->getFieldSettingsFormBase($form, $form_state);

    $element['code']['#title'] = $this->t('Code (PHP) to compute the <em>text</em> value');
    $element['code']['#description'] .= t('
<p>
  Here\'s a simple example using the <code>$entity</code>-array which sets the computed field\'s value to the concatenation of fields (<code>field_a</code> and <code>field_b</code>) in an entity:
  <ul>
    <li><code>$value = $entity->field_a->value . $entity->field_b->value;</code></li>
  </ul>
</p>
<p>
  An alternative example using the <code>$fields</code>-array:
  <ul>
    <li><code>$value = $fields[\'field_a\'][0][\'value\'] . $fields[\'field_b\'][0][\'value\'];</code></li>
  </ul>
</p>
    ');
    return $element;
  }

}
