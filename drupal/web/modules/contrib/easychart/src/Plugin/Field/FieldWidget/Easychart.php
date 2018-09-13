<?php

/**
 * @file
 * Contains \Drupal\easychart\Plugin\Field\FieldWidget\EasychartWidget.
 */

namespace Drupal\easychart\Plugin\Field\FieldWidget;

use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a default Easychart widget.
 *
 * @FieldWidget(
 *   id = "easychart_default",
 *   label = @Translation("Chart"),
 *   field_types = {
 *     "easychart"
 *   }
 * )
 */
class Easychart extends WidgetBase {

 /**
  * {@inheritdoc}
  */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    // Get easychart entity field values.
    $field_name = $items->getFieldDefinition()->getName();
    $entity = $items->getEntity();
    $values = $entity->get($field_name)->getValue();
    $config = \Drupal::config('easychart.settings');

    // Get the options.
    $options = '';
    if (file_exists('public://easychart-options.json')) {
      $options = file_get_contents('public://easychart-options.json');
    }

    $settings = [
      'easychartOptions' => $options,
      'easychartPresets' => $config->get('presets'),
      'easychartTemplates' => $config->get('templates'),
      'easychartCustomize' => \Drupal::currentUser()->hasPermission('access full easychart configuration'),
    ];

    // Attach settings and libraries to render array.
    $element['#attached']['drupalSettings']['easychart'] = $settings;
    $element['#attached']['library'][] = 'easychart/easychart.widget';
    $element['#attached']['library'][] = 'easychart/lib.highcharts';
    $element['#attached']['library'][] = 'easychart/lib.easycharts.full';

    $element['container'] = array(
      '#prefix' => '<div class="easychart-wrapper clearfix entity-meta">',
      '#suffix' => '</div>',
      '#type' => 'container',
      '#attributes' => array(
        'class' => array('entity-meta__header clearfix'),
        'style' => array('padding:0;')
      ),
    );

    $element['container']['config'] = array(
      '#description' => $this->t('The configuration options as described at http://api.highcharts.com/highcharts'),
      '#type' => 'hidden',
      '#default_value' => isset($values[$delta]['config']) ? $values[$delta]['config'] : NULL,
      '#attributes' => array('class' => array('easychart-config')),
    );

    $element['container']['csv'] = array(
      '#type' => 'hidden',
      '#description' => $this->t('Your chart data in CSV format'),
      '#default_value' => isset($values[$delta]['csv']) ? $values[$delta]['csv'] : NULL,
      '#attributes' => array('class' => array('easychart-csv')),
      '#element_validate' => array(array(get_called_class(), 'validateCSVElement')),
      '#csv_required' => $element['#required'],
    );

    $element['container']['csv_url'] = array(
      '#type' => 'hidden',
      '#description' => $this->t('The URL to a CSV file'),
      '#default_value' => isset($values[$delta]['csv_url']) ? $values[$delta]['csv_url'] : NULL,
      '#attributes' => array('class' => array('easychart-csv-url')),
    );

    $element['container']['preview'] = array(
      '#title' => $this->t('Easychart'),
      '#markup' => '',
      '#prefix' => '<div class="easychart-embed"><div class="easychart-header"><span class="toggle">' . t('Toggle Fullscreen') . '</span></div>',
      '#suffix' => '</div>',
    );

    return $element;
  }

  /**
   * CSV validate method.
   *
   * @param $element
   *   The csv element.
   * @param FormStateInterface $form_state
   *   The form state interface.
   */
  public static function validateCSVElement($element, FormstateInterface $form_state) {
    if ($element['#csv_required'] && empty($element['#value'])) {
      $form_state->setError($element, t('Please create an Easychart chart before saving.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    // The EasychartWidget form element returns an associative array with hidden
    // form elements, so we need to re-assign those values at the right $values
    // array keys.
    $i = 0;
    foreach ($values as &$value) {
      $value = $values[$i]['container'];
      $i++;
    }

    return $values;
  }

}
