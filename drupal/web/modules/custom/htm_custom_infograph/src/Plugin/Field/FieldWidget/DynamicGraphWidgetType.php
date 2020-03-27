<?php

namespace Drupal\htm_custom_infograph\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Component\Utility\NestedArray;
use Drupal\Component\Utility\SortArray;

/**
 * Plugin implementation of the 'dynamic_graph_widget_type' widget.
 *
 * @FieldWidget(
 *   id = "dynamic_graph_widget_type",
 *   label = @Translation("Dynamic graph widget type"),
 *   field_types = {
 *     "dynamic_graph_field"
 *   }
 * )
 */

class DynamicGraphWidgetType extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state)
  {

    $field_name = $this->fieldDefinition->getName();
    $data = isset($items[$delta]->filter_values) ? json_decode($items[$delta]->filter_values, true)['graph_options'] : FALSE;
    $fields = [];

    $graph_filters = [
      'teema', 'aasta', 'silt'
    ];
    $filters_path = '/app/drupal/web/sites/default/files/private/infograph_filters/';
    $files_path = '/app/drupal/web/sites/default/files/private/infograph/';

    $basic_graph_types = ['line', 'pie', 'doughnut'];

    $element += [
      '#type' => 'fieldset',
      '#title' => $this->t('Graph'),
    ];

    $source_file_options = [];
    $source_files = array_slice(scandir('/app/drupal/web/sites/default/files/private/infograph/'), 2);
    foreach ($source_files as $file) {
      $source_file_options[pathinfo($file, PATHINFO_FILENAME)] = $file;
    }

    $element['graph_source_file'] = [
      '#title' => $this->t('Graph source file'),
      '#size' => 1,
      '#type' => 'select',
      '#default_value' => isset($data['graph_source_file']) ? $data['graph_source_file'] : NULL,
      '#options' => $source_file_options,
      '#required' => FALSE,
      '#empty_option' => '-',
      '#delta' => $delta,
      '#ajax' => [
        'callback' => [$this, 'ajax_dependent_graph_set_callback'],
        'wrapper' => 'secondary_dynamic_graph_set' . $delta
      ],
    ];

    $element['graph_type'] = [
      '#prefix' => '<div id="graph_source' . $delta . '">',
      '#suffix' => '</div>',
      '#title' => $this->t('Graph type'),
      '#size' => 1,
      '#type' => 'select',
      '#default_value' => isset($items[$delta]->graph_type) ? $items[$delta]->graph_type : NULL,
      '#options' => [
        'line' => $this->t('line'),
        'pie' => $this->t('pie'),
        'doughnut' => $this->t('doughnut'),
        'clustered column' => $this->t('clustered column'),
        'stacked column' => $this->t('stacked column'),
        'stacked column 100' => $this->t('stacked column 100%'),
        'clustered bar' => $this->t('clustered bar'),
        'stacked bar' => $this->t('stacked bar'),
        'stacked bar 100' => $this->t('stacked bar 100%'),
      ],
      '#required' => FALSE,
      '#empty_option' => '-',
      '#ajax' => [
        'callback' => [$this, 'ajax_dependent_graph_set_callback'],
        'wrapper' => 'secondary_dynamic_graph_set' . $delta
      ],
      '#delta' => $delta,
    ];

    $element['graph_options'] = [
      '#prefix' => '<div id="secondary_dynamic_graph_set' . $delta . '">',
      '#suffix' => '</div>',
    ];

    if (isset($form_state->getUserInput()[$field_name])) {
      $graph_type = $form_state->getUserInput()[$field_name][$delta]['graph_type'];
    } else if (isset($items[$delta]->graph_type)) {
      $graph_type = $items[$delta]->graph_type;
    } else {
      $graph_type = false;
    }

    if (isset($form_state->getUserInput()[$field_name])) {
      $graph_source = $form_state->getUserInput()[$field_name][$delta]['graph_source_file'];
    } else if (isset($data['graph_source_file'])) {
      $graph_source = $data['graph_source_file'];
    } else {
      $graph_source = false;
    }

    if ($graph_type && $graph_source) {
      $element['graph_options']['graph_title'] = [
        '#title' => $this->t('Graph title'),
        '#type' => 'textfield',
        '#placeholder' => $this->t("Enter title for graph."),
        '#default_value' => isset($items[$delta]->graph_title) ? $items[$delta]->graph_title : NULL,
        '#maxlength' => 100,
        '#element_validate' => array(array($this, 'validateChartInput')),
        '#delta' => $delta,
      ];

      foreach ($graph_filters as $field) {
        $fields[$field] = $this->t(ucfirst($field));
      }

      $indicator_data = json_decode(file_get_contents($filters_path.$graph_source.'/naitaja'), TRUE);
      $indicator_options = [];

      if ($indicator_data) {
        foreach ($indicator_data as $key => $value) {
          $indicator_options[$key] = $key;
        }
      }

      $group_by_options = $fields;
      $group_by_options['naitaja'] = $this->t('indicator');

      if (in_array($graph_type, $basic_graph_types)) {
        $element['graph_options']['graph_indicator'] = [
          '#title' => $this->t('Indicator'),
          '#type' => 'select',
          '#options' => $indicator_options,
          '#multiple' => TRUE,
          '#description' => $this->t('To select multiple values, use CTRL click.'),
          '#required' => FALSE,
          '#default_value' => isset($data['graph_indicator']) ? $data['graph_indicator'] : NULL,
          '#ajax' => [
            'callback' => [$this, 'ajax_dependent_graph_filters_callback'],
            'wrapper' => 'dynamic_graph_filter_set' . $delta,
          ],
          '#element_validate' => array(array($this, 'validateChartInput')),
          '#delta' => $delta,
        ];
      } else {
        $element['graph_options']['indicator_count'] = [
          '#type' => 'number',
          '#title' => $this->t('Indicator count'),
          '#default_value' => isset($data['indicator_count']) ? $data['indicator_count'] : 0,
          '#min' => 0,
          '#ajax' => [
            'event' => 'input',
            'callback' => [$this, 'ajax_dependent_indicator_callback'],
            'wrapper' => 'graph_indicators' . $delta
          ],
          '#delta' => $delta
        ];

        $element['graph_options']['indicators'] = [
          '#type' => 'fieldset',
          '#title' => $this->t('Indicators'),
          '#prefix' => '<div id="graph_indicators' . $delta . '">',
          '#suffix' => '</div>',
        ];

        if (isset($form_state->getUserInput()[$field_name])) {
          $indicator_count = $form_state->getUserInput()[$field_name][$delta]['graph_options']['indicator_count'];
        } else if (isset($data['indicator_count'])) {
          $indicator_count = $data['indicator_count'];
        } else {
          $indicator_count = 0;
        }

        for ($i = 0; $i < $indicator_count; $i++) {
          $element['graph_options']['indicators'][$i]['indicator_set'] = [
            '#type' => 'fieldset'
          ];

          $element['graph_options']['indicators'][$i]['indicator_set']['graph_indicator'] = [
            '#title' => $this->t('Indicator'),
            '#type' => 'select',
            '#options' => $indicator_options,
            '#size' => 1,
            '#multiple' => FALSE,
            '#required' => FALSE,
            '#empty_option' => '-',
            '#default_value' => isset($data['indicators'][$i]['indicator_set']['graph_indicator']) ? $data['indicators'][$i]['indicator_set']['graph_indicator'] : NULL,
            '#ajax' => [
              'callback' => [$this, 'ajax_dependent_graph_filters_callback'],
              'wrapper' => 'dynamic_graph_filter_set' . $delta,
            ],
            '#element_validate' => array(array($this, 'validateChartInput')),
            '#delta' => $delta,
          ];

          $element['graph_options']['indicators'][$i]['indicator_set']['secondary_graph_indicator'] = [
            '#title' => $this->t('Secondary indicator'),
            '#type' => 'select',
            '#options' => $indicator_options,
            '#multiple' => TRUE,
            '#description' => $this->t('To select multiple values, use CTRL click.'),
            '#required' => FALSE,
            '#default_value' => isset($data['indicators'][$i]['indicator_set']['secondary_graph_indicator']) ? $data['indicators'][$i]['indicator_set']['secondary_graph_indicator'] : NULL,
            '#ajax' => [
              'callback' => [$this, 'ajax_dependent_graph_filters_callback'],
              'wrapper' => 'dynamic_graph_filter_set' . $delta,
            ],
            '#delta' => $delta,
          ];
        }
      }

      $element['graph_options']['graph_v_axis'] = [
        '#title' => $this->t('Graph v-axis'),
        '#size' => 1,
        '#type' => 'select',
        '#default_value' => isset($data['graph_v_axis']) ? $data['graph_v_axis'] : NULL,
        '#options' => $fields,
        '#empty_option' => '-',
        '#required' => FALSE,
        '#element_validate' => array(array($this, 'validateChartInput')),
        '#delta' => $delta,
      ];

      $element['graph_options']['graph_group_by'] = [
        '#title' => $this->t('Group results'),
        '#type' => 'select',
        '#multiple' => TRUE,
        '#description' => $this->t('To select multiple values, use CTRL click.'),
        '#default_value' => isset($data['graph_group_by']) ? $data['graph_group_by'] : NULL,
        '#options' => $group_by_options,
        '#element_validate' => array(array($this, 'validateChartInput')),
        '#empty_option' => '-',
        '#required' => FALSE,
        '#delta' => $delta,
      ];

      $element['graph_options']['graph_filters'] = [
        '#prefix' => '<div id="dynamic_graph_filter_set' . $delta . '">',
        '#suffix' => '</div>',
      ];


      $graph_indicator = [];
      $secondary_graph_indicator = [];

      if (in_array($graph_type, $basic_graph_types)) {
        if (isset($form_state->getUserInput()[$field_name])) {
          $graph_indicator = $form_state->getUserInput()[$field_name][$delta]['graph_options']['graph_indicator'];
        } else if (isset($data['graph_indicator'])) {
          $graph_indicator = $data['graph_indicator'];
        }
      } else {
        if (isset($form_state->getUserInput()[$field_name][$delta]['graph_options']['indicators'])) {
          foreach ($form_state->getUserInput()[$field_name][$delta]['graph_options']['indicators'] as $indicator_input) {
            $graph_indicator[] = $indicator_input['indicator_set']['graph_indicator'];
            $secondary_graph_indicator = array_merge($secondary_graph_indicator, $indicator_input['indicator_set']['secondary_graph_indicator']);
          }
        } else if (isset($data['indicators'])) {
          foreach ($data['indicators'] as $indicator_input) {
            $graph_indicator[] = $indicator_input['indicator_set']['graph_indicator'];
            $secondary_graph_indicator = array_merge($secondary_graph_indicator, $indicator_input['indicator_set']['secondary_graph_indicator']);
          }
        }
      }

      $graph_indicator = !empty($secondary_graph_indicator) ? array_unique(array_merge($graph_indicator, $secondary_graph_indicator)) : $graph_indicator;

      foreach ($fields as $key => $field) {

        $selection_data = json_decode(file_get_contents($filters_path.$graph_source.'/'.$key), TRUE);
        $selection = [];

        foreach ($graph_indicator as $value) {
          if (isset($selection_data[$value])) {
            foreach ($selection_data[$value] as $select_item) {
              $selection[$select_item] = $select_item;
            }
          }
        }

        $element['graph_options']['graph_filters'][$key] = [
          '#title' => $field,
          '#type' => 'select',
          '#options' => $selection,
          '#multiple' => TRUE,
          '#description' => $this->t('To select multiple values, use CTRL click.'),
          '#required' => FALSE,
          '#default_value' => isset($data['graph_filters'][$key]) ? $data['graph_filters'][$key] : NULL,
        ];
      }

      $element['graph_options']['graph_y_min'] = [
        '#title' => $this->t('Minimum Y'),
        '#type' => 'textfield',
        '#placeholder' => $this->t("Enter minimum Y value."),
        '#default_value' => isset($data['graph_y_min']) ? $data['graph_y_min'] : 0,
        '#maxlength' => 100,
        '#element_validate' => array(array($this, 'validateChartYInput')),
        '#delta' => $delta,
      ];

      if (!in_array($graph_type, $basic_graph_types)) {

        $element['graph_options']['secondary_graph_y_min'] = [
          '#title' => $this->t('Secondary minimum Y'),
          '#type' => 'textfield',
          '#placeholder' => $this->t("Enter secondary minimum Y value."),
          '#default_value' => isset($data['secondary_graph_y_min']) ? $data['secondary_graph_y_min'] : 0,
          '#maxlength' => 100,
          '#delta' => $delta,
        ];

        $element['graph_options']['secondary_graph_type'] = [
          '#title' => $this->t('Secondary graph type'),
          '#size' => 1,
          '#type' => 'select',
          '#default_value' => isset($items[$delta]->secondary_graph_type) ? $items[$delta]->secondary_graph_type : NULL,
          '#options' => [
            'line' => $this->t('line'),
          ],
          '#empty_option' => '-',
          '#required' => FALSE,
          '#delta' => $delta,
        ];
      }

      $element['graph_options']['graph_y_unit'] = [
        '#title' => $this->t('Graph Y unit'),
        '#type' => 'select',
        '#size' => 1,
        '#options' => [
          'summa' => $this->t('summa'),
          'euro' => $this->t('euro'),
        ],
        '#multiple' => FALSE,
        '#required' => FALSE,
        '#default_value' => isset($data['graph_y_unit']) ? $data['graph_y_unit'] : NULL,
      ];

      $element['graph_options']['graph_text'] = [
        '#title' => $this->t('Graph info text'),
        '#type' => 'text_format',
        '#maxlength' => 1500,
        '#default_value' => isset($data['graph_text']['value']) ? $data['graph_text']['value'] : NULL,
      ];
    }
    return $element;
  }

  public function ajax_dependent_graph_type_options_callback(array &$form, FormStateInterface $form_state){
    $field_name = $this->fieldDefinition->getName();
    $trigger_element = $form_state->getTriggeringElement();

    if($trigger_element['#value'] === 'combo'){
      return $form[$field_name]['widget'][$trigger_element['#delta']]['graph_options']['secondary_graph_type'];
    }
  }

  public function ajax_dependent_graph_set_callback(array &$form, FormStateInterface $form_state){
    $field_name = $this->fieldDefinition->getName();
    $trigger_element = $form_state->getTriggeringElement();

    return $form[$field_name]['widget'][$trigger_element['#delta']]['graph_options'];
  }

  public function ajax_dependent_graph_filters_callback(array &$form, FormStateInterface $form_state){
    $field_name = $this->fieldDefinition->getName();
    $trigger_element = $form_state->getTriggeringElement();

    return $form[$field_name]['widget'][$trigger_element['#delta']]['graph_options']['graph_filters'];
  }

  public function ajax_dependent_indicator_callback(array &$form, FormStateInterface $form_state){
    $field_name = $this->fieldDefinition->getName();
    $trigger_element = $form_state->getTriggeringElement();

    return $form[$field_name]['widget'][$trigger_element['#delta']]['graph_options']['indicators'];
  }

  public function extractFormValues(FieldItemListInterface $items, array $form, FormStateInterface $form_state)
  {
    $field_name = $this->fieldDefinition->getName();


    // Extract the values from $form_state->getValues().
    $path = array_merge($form['#parents'], [$field_name]);
    $key_exists = NULL;
    $values = NestedArray::getValue($form_state->getValues(), $path, $key_exists);

    foreach($values as $key => $value){
      if($this->checkSubmitValues($value) != TRUE){
        unset($values[$key]);
      }
    }

    if ($key_exists) {
      // Account for drag-and-drop reordering if needed.
      if (!$this->handlesMultipleValues()) {
        // Remove the 'value' of the 'add more' button.
        unset($values['add_more']);

        // The original delta, before drag-and-drop reordering, is needed to
        // route errors to the correct form element.
        foreach ($values as $delta => &$value) {
          $value['_original_delta'] = $delta;
        }

        usort($values, function ($a, $b) {
          return SortArray::sortByKeyInt($a, $b, '_weight');
        });
      }

      // Let the widget massage the submitted values.
      $values = $this->massageFormValues($values, $form, $form_state);
      // Assign the values and remove the empty ones.
      $items->setValue($values);
      $items->filterEmptyItems();

      // Put delta mapping in $form_state, so that flagErrors() can use it.
      $field_state = static::getWidgetState($form['#parents'], $field_name, $form_state);
      foreach ($items as $delta => $item) {
        $field_state['original_deltas'][$delta] = isset($item->_original_delta) ? $item->_original_delta : $delta;
        unset($item->_original_delta, $item->_weight);
      }
      static::setWidgetState($form['#parents'], $field_name, $form_state, $field_state);
    }
  }

  public function checkSubmitValues($submitted_values){
    $newValue = FALSE;
    foreach($submitted_values as $key => $value){
      if($key != '_weight'){
        if(is_array($value)){
          if(count($value) > 0){
            $newValue = TRUE;
          }
        }else if($value != '' || $value != NULL){
          $newValue = TRUE;
        }
      }
    }

    return $newValue;
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {

    $hierarchy_path = '/app/drupal/web/sites/default/files/private/infograph_filters/';

    foreach($values as $key => $value){
      $value['graph_options']['graph_source_file'] = $value['graph_source_file'];
      $value['hierarchy'] = json_decode(file_get_contents($hierarchy_path.$value['graph_source_file'].'/hierarchy'), TRUE);
      $new_values[$key] = [
        'graph_type' => $value['graph_type'],
        'graph_title' => $value['graph_options']['graph_title'],
        'secondary_graph_type' => isset($value['graph_options']['secondary_graph_type']) ? $value['graph_options']['secondary_graph_type'] : NULL,
        'graph_text' => $value['graph_options']['graph_text']['value'],
        'filter_values' => json_encode($value, TRUE),
      ];
    }

    return isset($new_values) ? $new_values : $values;
  }

  public function array_key_last( $array ) {
    $key = NULL;

    if ( is_array( $array ) ) {

      end( $array );
      $key = key( $array );
    }

    return $key;
  }

  /**
   * Validate chart data is entered.
   */
  public function validateChartInput(&$element, FormStateInterface &$form_state, $form) {

    if(empty($element['#value'])) {
      $form_state->setError($element, t($element['#title']->getUntranslatedString().' is empty.'));
    }
  }

  public function validateChartYInput(&$element, FormStateInterface &$form_state, $form) {

    if(!is_numeric($element['#value']) && $element['#value'] < 0) {
      $form_state->setError($element, t($element['#title']->getUntranslatedString().' is incorrect.'));
    }
  }
}
