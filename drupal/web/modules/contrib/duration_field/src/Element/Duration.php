<?php

namespace Drupal\duration_field\Element;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\Core\Render\Element\FormElement;
use Drupal\duration_field\Service\DurationService;

/**
 * Provides a duration form element.
 *
 * @FormElement("duration")
 */
class Duration extends FormElement {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    $class = get_class($this);
    return [
      '#input' => TRUE,
      '#tree' => TRUE,
      '#granularity' => 'y:m:d:h:i:s',
      // Required elements should be in the format y:m:d:h:i:s.
      '#required_elements' => '',
      '#element_validate' => [
        [$class, 'validateElement'],
      ],
      '#pre_render' => [
        [$class, 'preRenderElement'],
      ],
      '#process' => [
        'Drupal\Core\Render\Element\RenderElement::processAjaxForm',
        [$class, 'processElement'],
      ],
      '#theme_wrappers' => ['form_element'],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function valueCallback(&$element, $input, FormStateInterface $form_state) {

    if ($input !== FALSE && !is_null($input)) {
      return DurationService::convertValue($input);
    }

    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public static function processElement(&$element, FormStateInterface $form_state, &$complete_form) {

    $granularity = explode(':', $element['#granularity']);
    $required_elements = explode(':', $element['#required_elements']);

    $value = FALSE;
    if (isset($element['#value']) && $element['#value']) {
      $value = new \DateInterval($element['#value']);
    }

    $time_mappings = [
      'y' => [
        'label' => t('Years'),
        'key' => 'year',
      ],
      'm' => [
        'label' => t('Months'),
        'key' => 'month',
        'format' => 'm',
      ],
      'd' => [
        'label' => t('Days'),
        'key' => 'day',
      ],
      'h' => [
        'label' => t('Hours'),
        'key' => 'hour',
      ],
      'i' => [
        'label' => t('Minutes'),
        'key' => 'minute',
      ],
      's' => [
        'label' => t('Seconds'),
        'key' => 'second',
      ],
    ];

    // Create a wrapper for the elements. This is done in this manner
    // rather than nesting the elements in a wrapper with #prefix and #suffix
    // so as to not end up with [wrapper] as part of the name attribute
    // of the elements.
    $element['wrapper_open'] = [
      '#markup' => '<div class="duration-inner-wrapper">',
      '#weight' => -1,
    ];

    foreach ($time_mappings as $key => $info) {
      if (preg_grep('/' . $key . '/i', $granularity)) {
        $element[$info['key']] = [
          '#id' => $element['#id'] . '-' . $info['key'],
          '#type' => 'number',
          '#title' => $info['label'],
          '#value' => $value ? $value->format('%' . $key) : 0,
          '#required' => preg_grep('/' . $key . '/i', $required_elements) ? TRUE : FALSE,
          '#weight' => 0,
          '#min' => 0,
        ];

        if (!empty($element['#ajax'])) {
          $element[$info['key']]['#ajax'] = $element['#ajax'];
        }
      }
    }

    $element['wrapper_close'] = [
      '#markup' => '</div>',
      '#weight' => 1,
    ];

    // Attach the CSS for the display of the output.
    $element['#attached']['library'][] = 'duration_field/element';

    return $element;
  }

  /**
   * Prepares the element for rendering.
   *
   * @param array $element
   *   An associative array containing the properties of the element. Properties
   *   used: #title, #value, #description, #size, #placeholder, #required,
   *   #attributes.
   *
   * @return array
   *   The $element with prepared values ready for rendering
   */
  public static function preRenderElement(array $element) {

    // Set the wrapper as a container to the inner values.
    $element['#attributes']['type'] = 'container';

    Element::setAttributes($element, ['id', 'name', 'value']);
    static::setAttributes($element, ['form-duration']);

    return $element;
  }

  /**
   * Sets the value of the submitted element.
   */
  public static function validateElement(&$element, FormStateInterface $form_state) {
    $mappings = [
      'year' => 'Y',
      'month' => 'M',
      'day' => 'D',
      'hour' => 'H',
      'minute' => 'M',
      'second' => 'S',
    ];

    $values = [];
    foreach ($mappings as $key => $duration_key) {
      if (isset($element[$key])) {
        $values[$key] = $element[$key]['#value'];
      }
    }

    $form_state->setValue('duration', DurationService::convertValue($values));
  }

}
