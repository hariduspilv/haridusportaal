<?php

namespace Drupal\htm_custom_oska\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Component\Utility\NestedArray;
use Drupal\Component\Utility\SortArray;

/**
 * Plugin implementation of the 'oska_dynamic_graph_widget_type' widget.
 *
 * @FieldWidget(
 *   id = "oska_dynamic_graph_widget_type",
 *   label = @Translation("Oska dynamic graph widget type"),
 *   field_types = {
 *     "oska_dynamic_graph_field"
 *   }
 * )
 */

class OskaDynamicGraphWidgetType extends WidgetBase {

    /**
     * {@inheritdoc}
     */
    public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

        $field_name = $this->fieldDefinition->getName();
        $csv_location = $this->fieldDefinition->getSettings()['csv_location'];
        $data = isset($items[$delta]->filter_values) ? json_decode($items[$delta]->filter_values, true)['graph_options'] : NULL;
        $fields = [];

        $oska_filters = [
            'valdkond', 'alavaldkond', 'ametiala', 'periood', 'silt'
        ];
        $oska_filters_path = '/app/drupal/web/sites/default/files/private/oska_filters/';

        $element += [
            '#type' => 'fieldset',
            '#title' => $this->t('Graph'),
        ];

        $element['graph_set'] = [
            '#title' => $this->t('Graph set'),
            '#size' => 256,
            '#type' => 'select',
            '#default_value' => isset($items[$delta]->graph_set) ? $items[$delta]->graph_set : NULL,
            '#options' => [
                'simple' => $this->t('simple'),
                'combo' => $this->t('combo'),
                'multi' => $this->t('multi'),
                'multi-line' => $this->t('multi-line'),
            ],
            '#required' => FALSE,
            '#empty_option'  => '-',
            '#ajax' => [
                'callback' => [$this,'ajax_dependent_graph_set_callback'],
                'wrapper' => 'secondary_dynamic_graph_set'.$delta
            ],
            '#delta' => $delta,
        ];

        $element['graph_options'] = [
            '#prefix' => '<div id="secondary_dynamic_graph_set'.$delta.'">',
            '#suffix' => '</div>',
        ];

        if(isset($form_state->getUserInput()[$field_name])){
            $graph_set = $form_state->getUserInput()[$field_name][$delta]['graph_set'];
        }else if(isset($items[$delta]->graph_set)){
            $graph_set = $items[$delta]->graph_set;
        }else{
            $graph_set = false;
        }

        if($graph_set){
            $element['graph_options']['graph_title'] = [
                '#title' => $this->t('Graph title'),
                '#type' => 'textfield',
                '#placeholder' => $this->t("Enter title for graph."),
                '#default_value' => isset($items[$delta]->graph_title) ? $items[$delta]->graph_title : NULL,
                '#maxlength' => 100,
                '#element_validate' => array(array($this, 'validateChartInput')),
                '#delta' => $delta,
            ];

            foreach($oska_filters as $field){
                $fields[$field] = $this->t(ucfirst($field));
            }

            switch($graph_set){
                case 'simple':
                    $graph_type_options = array(
                        'line' => $this->t('line'),
                        'bar' => $this->t('bar'),
                        'column' => $this->t('column'),
                    );
                    break;
                case 'combo':
                    $graph_type_options = array(
                        'line' => $this->t('line')
                    );
                    break;
                case 'multi':
                    $graph_type_options = array(
                        'clustered bar' => $this->t('clustered bar'),
                        'stacked bar' => $this->t('stacked bar'),
                        'stacked bar 100' => $this->t('stacked bar 100%'),
                        'clustered column' => $this->t('clustered column'),
                        'stacked column' => $this->t('stacked column'),
                        'stacked column 100' => $this->t('stacked column 100%'),
                    );
                    break;
            }

            $element['graph_options']['graph_type'] = [
                '#title' => $this->t('Graph type'),
                '#size' => 256,
                '#type' => 'select',
                '#default_value' => isset($data['graph_type']) && in_array($data['graph_type'], $graph_type_options) ? $data['graph_type'] : NULL,
                '#options' => $graph_type_options,
                '#required' => FALSE,
                '#empty_option'  => '-',
                '#ajax' => [
                    'callback' => [$this,'ajax_dependent_graph_type_options_callback'],
                    'wrapper' => 'secondary_dynamic_graph_type_options'.$delta,
                ],
                '#delta' => $delta,
            ];

            $indicator_data = json_decode(file_get_contents($oska_filters_path.'naitaja'), TRUE);
            $indicator_options = [];

            foreach($indicator_data as $key => $value){
                $indicator_options[$key] = $key;
            }

            $element['graph_options']['graph_indicator'] = [
                '#title' => $this->t('OSKA indicator'),
                '#type' => 'select',
                '#options' => $indicator_options,
                '#multiple' => TRUE,
                '#required' => FALSE,
                '#default_value' => isset($data['graph_indicator']) ? $data['graph_indicator'] : NULL,
                '#ajax' => [
                    'callback' => [$this,'ajax_dependent_graph_filters_callback'],
                    'wrapper' => 'dynamic_graph_filter_set'.$delta,
                ],
                '#element_validate' => array(array($this, 'validateChartInput')),
                '#delta' => $delta,
            ];

            $element['graph_options']['graph_v_axis'] = [
                '#title' => $this->t('Graph v-axis'),
                '#size' => 256,
                '#type' => 'select',
                '#default_value' => isset($data['graph_v_axis']) ? $data['graph_v_axis'] : NULL,
                '#options' =>  $fields,
                '#empty_option'  => '-',
                '#required' => FALSE,
                '#element_validate' => array(array($this, 'validateChartInput')),
                '#delta' => $delta,
            ];

            if($graph_set === 'multi-line' || $graph_set === 'multi'){
                $element['graph_options']['graph_group_by'] = [
                    '#title' => $this->t('Group results'),
                    '#size' => 256,
                    '#type' => 'select',
                    '#default_value' => isset($data['graph_group_by']) ? $data['graph_group_by'] : NULL,
                    '#options' =>  $fields,
                    '#empty_option'  => '-',
                    '#required' => FALSE,
                    '#delta' => $delta,
                ];
            }

            $element['graph_options']['graph_filters'] = [
                '#prefix' => '<div id="dynamic_graph_filter_set'.$delta.'">',
                '#suffix' => '</div>',
            ];

            foreach($fields as $key => $field){

                if(isset($form_state->getUserInput()[$field_name])){
                    $graph_indicator = $form_state->getUserInput()[$field_name][$delta]['graph_options']['graph_indicator'];
                }else if(isset($data['graph_indicator'])){
                    $graph_indicator = $data['graph_indicator'];
                }else{
                    $graph_indicator = false;
                }

                $selection_data = json_decode(file_get_contents($oska_filters_path.$key), TRUE);
                $selection = [];

                foreach($graph_indicator as $value){
                    if(isset($selection_data[$value])){
                        foreach($selection_data[$value] as $select_item){
                            $selection[$select_item] = $select_item;
                        }
                    }
                }

                $element['graph_options']['graph_filters'][$key] = [
                    '#title' => $field,
                    '#type' => 'select',
                    '#options' => $selection,
                    '#multiple' => TRUE,
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

            if($graph_set == 'combo'){

                $element['graph_options']['secondary_graph_y_min'] = [
                    '#title' => $this->t('Secondary minimum Y'),
                    '#type' => 'textfield',
                    '#placeholder' => $this->t("Enter secondary minimum Y value."),
                    '#default_value' => isset($data['secondary_graph_y_min']) ? $data['secondary_graph_y_min'] : 0,
                    '#maxlength' => 100,
                    '#element_validate' => array(array($this, 'validateChartYInput')),
                    '#delta' => $delta,
                ];

                $element['graph_options']['secondary_graph_type'] = [
                    '#title' => $this->t('Secondary graph type'),
                    '#size' => 256,
                    '#type' => 'select',
                    '#default_value' => isset($items[$delta]->secondary_graph_type) ? $items[$delta]->secondary_graph_type : NULL,
                    '#options' => [
                        'column' => $this->t('column'),
                        'clustered_column' => $this->t('clustered column'),
                        'stacked_column' => $this->t('stacked column'),
                    ],
                    '#empty_option'  => '-',
                    '#required' => FALSE,
                    '#delta' => $delta,
                    '#element_validate' => array(array($this, 'validateChartInput')),
                    '#delta' => $delta,
                ];

                $element['graph_options']['secondary_graph_indicator'] = [
                    '#title' => $this->t('Secondary OSKA indicator'),
                    '#type' => 'select',
                    '#options' => $indicator_options,
                    '#multiple' => TRUE,
                    '#required' => FALSE,
                    '#default_value' => isset($data['secondary_graph_indicator']) ? $data['secondary_graph_indicator'] : NULL,
                    '#element_validate' => array(array($this, 'validateChartInput')),
                    '#delta' => $delta,
                ];

                $element['graph_options']['graph_y_unit'] = [
                    '#title' => $this->t('Graph Y unit'),
                    '#type' => 'select',
                    '#options' => [
                        'summa' => $this->t('summa'),
                        '%' => $this->t('%'),
                        'euro' => $this->t('euro'),
                    ],
                    '#multiple' => FALSE,
                    '#required' => FALSE,
                    '#default_value' => isset($data['graph_y_unit']) ? $data['graph_y_unit'] : NULL,
                ];
            }

            $element['graph_options']['graph_text'] = [
                '#title' => $this->t('Graph info text'),
                '#type' => 'textarea',
                '#maxlength' => 1500,
                '#default_value' => isset($data['graph_text']) ? $data['graph_text'] : NULL,
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

        $oska_hierarchy_path = '/app/drupal/web/sites/default/files/private/oska_filters/hierarchy';
        $hierarchy_data = json_decode(file_get_contents($oska_hierarchy_path), TRUE);

        foreach($values as $key => $value){
            $value['hierarchy'] = $hierarchy_data;
            $new_values[$key] = [
                'graph_set' => $value['graph_set'],
                'graph_title' => $value['graph_options']['graph_title'],
                'graph_type' => $value['graph_options']['graph_type'],
                'secondary_graph_type' => isset($value['graph_options']['secondary_graph_type']) ? $value['graph_options']['secondary_graph_type'] : NULL,
                'graph_text' => $value['graph_options']['graph_text'],
                'filter_values' => json_encode($value, TRUE),
            ];
        }

        return isset($new_values) ? $new_values : $values;
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