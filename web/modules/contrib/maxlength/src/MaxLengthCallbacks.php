<?php

namespace Drupal\maxlength;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Security\TrustedCallbackInterface;

/**
 * Trusted render callbacks.
 */
class MaxLengthCallbacks implements TrustedCallbackInterface {

  public static function trustedCallbacks() {
    return ['maxlengthPreRender', 'processElement'];
  }

  /**
   * Pre render function to set maxlength attributes.
   *
   * @param array $element
   *   The render array.
   *
   * @return array
   *   The processed render array.
   */
  public static function maxlengthPreRender($element) {
    if (isset($element['#maxlength_js']) && $element['#maxlength_js'] === TRUE) {
      if (((isset($element['#attributes']['maxlength']) && $element['#attributes']['maxlength'] > 0))) {
        $element['#attributes']['class'][] = 'maxlength';
        $element['#attached']['library'][] = 'maxlength/maxlength';
      }
      if (((isset($element['summary']['#attributes']['maxlength']) && $element['summary']['#attributes']['maxlength'] > 0))) {
        $element['summary']['#attributes']['class'][] = 'maxlength';
        $element['summary']['#attached']['library'][] = 'maxlength/maxlength';
      }
    }
    return $element;
  }

  /**
   * Process handler for the form elements that can have maxlength attribute.
   *
   * @param array $element
   *   The render array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Form state.
   *
   * @return array
   *   The processed render array.
   */
  public static function processElement($element, FormStateInterface $form_state) {
    if (isset($element['#attributes']['#maxlength_js_enforce']) && $element['#attributes']['#maxlength_js_enforce']) {
      $element['#attributes']['class'][] = 'maxlength_js_enforce';
    }
    if (isset($element['#attributes']['#maxlength_js_truncate_html']) && $element['#attributes']['#maxlength_js_truncate_html']) {
      $element['#attributes']['class'][] = 'maxlength_js_truncate_html';
    }
    return $element;
  }


}
