<?php

/**
 * @file
 * Contains \Drupal\hms_field\Element\Hmsfield.
 */

namespace Drupal\hms_field\Element;

use Drupal\Core\Render\Element;
use Drupal\Core\Render\Element\FormElement;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a one-line text field form element.
 *
 * @FormElement("hms")
 */
class HMS extends FormElement {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {

    $class = get_class($this);
    return array(
      '#input' => TRUE,
      '#size' => 8,
      '#maxlength' => 16,
      '#default_value' => FALSE,
      '#format' => 'h:mm:ss',
      '#placeholder' => 'h:mm:ss',
      '#autocomplete_route_name' => FALSE,
      '#process' => array(
        array($class, 'processAutocomplete'),
        array($class, 'processAjaxForm'),
        array($class, 'processPattern'),
        array($class, 'processGroup'),
      ),
      '#pre_render' => array(
        array($class, 'preRenderHMS'),
      ),
      '#element_validate' => array(
        array($class, 'validateHMS'),
      ),
      '#theme' => 'input__textfield',
      '#theme_wrappers' => array('form_element'),

    );
  }

  /**
   * Form element validation handler for #type 'hms'.
   *
   * Note that #required is validated by _form_validate() already.
   */
  public static function validateHMS(&$element, FormStateInterface $form_state, &$complete_form) {
    $value = trim($element['#value']);

    $form_state->setValueForElement($element, $value);
    if ($value !== '' && !\Drupal::service('hms_field.hms')->isValid($value, $element['#format'])) {
      $form_state->setError($element, t('Please enter a correct hms value in format %format.', array('%format' => $element['#format'])));
    } else {
      // Format given value to seconds if input is valid.
      $seconds = \Drupal::service('hms_field.hms')
        ->formatted_to_seconds($value, $element['#format']);
      $form_state->setValueForElement($element, $seconds);
    }
  }

  /**
   * Prepares a #type 'hms' render element for input.html.twig.
   *
   * @param array $element
   *   An associative array containing the properties of the element.
   *   Properties used: #title, #value, #description, #size, #maxlength,
   *   #placeholder, #required, #attributes.
   *
   * @return array
   *   The $element with prepared variables ready for input.html.twig.
   */
  public static function preRenderHMS($element) {

    Element::setAttributes($element, array(
      'id',
      'name',
      'value',
      'size',
      'maxlength',
      'placeholder'
    ));
    static::setAttributes($element, array('form-hms'));

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function valueCallback(&$element, $input, FormStateInterface $form_state) {
    // Get saved value from db.
    if ($input === FALSE) {
      $formatted = \Drupal::service('hms_field.hms')
        ->seconds_to_formatted($element['#default_value'], $element['#format']);
      return $formatted;
    }
  }
}
