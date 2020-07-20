<?php

/**
 * @file
 * Contains \Drupal\Core\Field\Plugin\Field\FieldFormatter\ComputedPhpFormatterPhp.
 */

namespace Drupal\computed_field_php_formatter\Plugin\Field\FieldFormatter;

use Drupal\Component\Utility\Html;
use Drupal\computed_field\Plugin\Field\FieldFormatter\ComputedPhpFormatterBase;
use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'Free PHP' formatter for computed fields.
 *
 * @FieldFormatter(
 *   id = "computed_php_free",
 *   label = @Translation("Computed PHP (free input)"),
 *   field_types = {
 *     "computed_integer",
 *     "computed_decimal",
 *     "computed_float",
 *     "computed_string",
 *     "computed_string_long",
 *   }
 * )
 */
class ComputedPhpFormatterPhp extends ComputedPhpFormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'php_code' => '$display_value = \'<b>PHP:</b> $value = \' . $value_escaped;'
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [
      'php_code' => [
        '#type' => 'textarea',
        '#title' => t('PHP Code'),
        '#default_value' => $this->getSetting('php_code'),
        '#description' =>
          t('Enter the PHP expression to format the value. The variables available to your code include:
<ul>
<li><code>$display_value</code>: the resulting value (to be set in this code),</li>
<li><code>$value</code>: the raw value to be formatted,</li>
<li><code>$value_escaped</code>: the sanitized value to be formatted,</li>
<li><code>$item</code>: the field item,</li>
<li><code>$delta</code>: current index of the field in case of multi-value computed fields (counting from 0).</li>
<li><code>$langcode</code>: The language code.</li>
</ul>')
      ]
    ] + parent::settingsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $settings = $this->getSettings();
    $summary = parent::settingsSummary();

    $summary[] = nl2br(Html::escape($settings['php_code']));

    return $summary;
  }


  /**
   * Do something with the value before displaying it.
   *
   * @param mixed $value
   *   The (computed) value of the item.
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   The item to format for output
   * @param int $delta
   *   The delta value (index) of the item in case of multiple items
   * @param string $langcode
   *   The language code
   * @return mixed
   */
  public function formatItem($value, FieldItemInterface $item, $delta = 0, $langcode = NULL) {
    $settings = $this->getSettings();
    $value_escaped = Html::escape($value);
    $display_value = NULL;

    eval($settings['php_code']);

    return $display_value;
  }
}
