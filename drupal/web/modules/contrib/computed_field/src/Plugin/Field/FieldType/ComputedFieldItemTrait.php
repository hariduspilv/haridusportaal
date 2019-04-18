<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Form\FormStateInterface;

/**
 * Common methods for Computed Field FieldType plugins.
 *
 * The FieldType plugins in this module descend from either FieldItemBase
 * (numbers via ComputedFieldItemBase) or StringItemBase (strings via
 * ComputedStringItemBase). As they have no common ancestry outside of Core,
 * it's necessary to introduce this trait to prevent code duplication across
 * hierarchies.
 */
trait ComputedFieldItemTrait {

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave() {
    $value = $this->executeCode();
    $this->setValue($value);
  }

  /**
   * Performs the field value computation.
   */
  public function executeCode() {
    $code = $this->getSettings()['code'];

    $entity_type_manager = \Drupal::EntityTypeManager();
    $entity = $this->getEntity();
    $fields = $entity->toArray();
    $delta = $this->name;

    if ($this->computeFunctionNameExists()) {
      $compute_function = $this->getComputeFunctionName();
      $value = $compute_function($entity_type_manager, $entity, $fields, $delta);
    }
    else {
      $value = NULL;
      eval($code);
    }
    return $value;
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    $element = [];
    $settings = $this->getSettings();

    $element['code'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Code (PHP) to compute the value'),
      '#default_value' => $settings['code'],
      '#required' => TRUE,
      '#disabled' => $this->computeFunctionNameExists(),
      '#description' => t('
<p>
  <em><strong>WARNING:</strong> We strongly recommend that code be provided by a
  hook implementation in one of your custom modules, not here. This is far more
  secure than allowing code to be entered into this form from the Web UI. In
  addition, any code saved here will be stored in the database instead of your
  revision control system, which probably is not what you want. The hook
  implementation function signature should be
  <strong>%function($entity_type_manager, $entity, $fields, $delta)</strong>,
  and the desired value should be returned. If/when it exists, this form element
  will be greyed out.</em>
</p>
<p>The variables available to your code include:</p>
<ul>
  <li><code>$entity_type_manager</code>: The entity type manager.</li>
  <li><code>$entity</code>: The entity the field belongs to.</li>
  <li><code>$fields</code>: The list of fields available in this entity.</li>
  <li><code>$delta</code>: Current index of the field in case of multi-value computed fields (counting from 0).</li>
  <li><code>$value</code>: The resulting value to be set above, or returned in your hook implementation).</li>
</ul>
      ', [
        '%function' => $this->getComputeFunctionName(),
      ]),
    ];

    return $element;
  }

  /**
   * Fetches this field's compute function name for implementing elsewhere.
   *
   * @return string
   *   The function name.
   */
  protected function getComputeFunctionName() {
    $field_name = $this->definition->getFieldDefinition()->getName();
    return 'computed_field_' . $field_name . '_compute';
  }

  /**
   * Determines if a compute function exists for this field.
   *
   * @return string
   *   The function name.
   */
  protected function computeFunctionNameExists() {
    return function_exists($this->getComputeFunctionName());
  }

}
