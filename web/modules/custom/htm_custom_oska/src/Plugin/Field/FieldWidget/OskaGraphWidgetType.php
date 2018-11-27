<?php

namespace Drupal\htm_custom_oska\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\EntityReferenceAutocompleteTagsWidget;
use Drupal\Core\Field\Plugin\Field\FieldWidget\EntityReferenceAutocompleteWidget;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextfieldWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\Component\Serialization\Json;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Component\Utility\NestedArray;
use Drupal\Component\Utility\SortArray;

/**
 * Plugin implementation of the 'oska_graph_widget_type' widget.
 *
 * @FieldWidget(
 *   id = "oska_graph_widget_type",
 *   label = @Translation("Oska graph widget type"),
 *   field_types = {
 *     "oska_graph_field"
 *   }
 * )
 */

class OskaGraphWidgetType extends WidgetBase {

    /**
     * {@inheritdoc}
     */
    public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

        $field_name = $this->fieldDefinition->getName();
        $data = isset($items[$delta]->filter_values) ? json_decode($items[$delta]->filter_values, true)['graph_options'] : NULL;
        $fields = [];
        $settings = $this->getFieldSettings();
        $entity_fields = \Drupal::service('entity_field.manager')->getFieldDefinitions($settings['target_type'], 'bundle');
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
                'multi' => $this->t('multi')
            ],
            '#required' => FALSE,
            '#empty_option'  => '-',
            '#ajax' => [
                'callback' => [$this,'ajax_dependent_graph_set_callback'],
                'wrapper' => 'secondary_graph_set'.$delta
            ],
            '#delta' => $delta,
        ];

        $element['graph_options'] = [
            '#prefix' => '<div id="secondary_graph_set'.$delta.'">',
            '#suffix' => '</div>',
        ];

        if(isset($form_state->getUserInput()[$field_name])){
            $graph_set = $form_state->getUserInput()[$field_name][$delta]['graph_set'];
        }else if(isset($items[$delta]->graph_type)){
            $graph_set = $items[$delta]->graph_set;
        }else{
            $graph_set = false;
        }

        if($graph_set){
            if($entity_fields){
                $element['graph_options']['graph_title'] = [
                    '#title' => $this->t('Graph title'),
                    '#type' => 'textfield',
                    '#placeholder' => $this->t("Enter title for graph."),
                    '#default_value' => isset($items[$delta]->graph_title) ? $items[$delta]->graph_title : NULL,
                    '#maxlength' => 100,
                ];

                foreach($entity_fields as $key => $field){
                    $field_settings = $field->getSettings();
                    if(isset($field_settings['graph_filter'])){
                        $fields[$key] = $field;
                        if(!isset($field_settings['graph_indicator'])){
                            $v_axis_options[$key] = $this->t($field->getLabel()->getUntranslatedString());
                        }
                    }
                    if(isset($field_settings['graph_indicator'])){
                        $fields[$key] = $field;
                    }
                    if(isset($field_settings['graph_label'])){
                        $fields[$key] = $field;
                        $v_axis_options[$key] = $this->t($field->getLabel()->getUntranslatedString());
                    }
                }

                if($graph_set === 'simple'){
                    $graph_type_options = array(
                        'line' => $this->t('line'),
                        'bar' => $this->t('bar'),
                        'column' => $this->t('column'),
                        'pie' => $this->t('pie'),
                        'doughnut' => $this->t('doughnut')
                    );
                }elseif($graph_set === 'combo'){
                    $graph_type_options = array(
                        'line' => $this->t('line'),
                        'bar' => $this->t('bar')
                    );
                }else{
                    $graph_type_options = array(
                        'bar' => $this->t('bar'),
                        'column' => $this->t('column')
                    );
                }

                $element['graph_options']['graph_type'] = [
                    '#title' => $this->t('Graph type'),
                    '#size' => 256,
                    '#type' => 'select',
                    '#default_value' => isset($data['graph_type']) ? $data['graph_type'] : NULL,
                    '#options' => $graph_type_options,
                    '#required' => FALSE,
                    '#empty_option'  => '-',
                    '#ajax' => [
                        'callback' => [$this,'ajax_dependent_graph_type_options_callback'],
                        'wrapper' => 'secondary_graph_type_options'.$delta,
                    ],
                    '#delta' => $delta,
                ];

                $element['graph_options']['graph_v_axis'] = [
                    '#title' => $this->t('Graph v-axis'),
                    '#size' => 256,
                    '#type' => 'select',
                    '#default_value' => isset($data['graph_v_axis']) ? $data['graph_v_axis'] : NULL,
                    '#options' =>  $v_axis_options,
                    '#empty_option'  => '-',
                    '#required' => FALSE,
                    '#element_validate' => array(array($this, 'validateChartVaxisInput')),
                    '#delta' => $delta,
                ];

                if($graph_set === 'multi'){
                    $element['graph_options']['graph_group_by'] = [
                        '#title' => $this->t('Group results'),
                        '#size' => 256,
                        '#type' => 'select',
                        '#default_value' => isset($data['graph_group_by']) ? $data['graph_group_by'] : NULL,
                        '#options' =>  $v_axis_options,
                        '#empty_option'  => '-',
                        '#required' => FALSE,
                        '#delta' => $delta,
                    ];
                }

                foreach($fields as $key => $field){
                    if($field->getType() === 'entity_reference'){
                        if(isset($data[$key])){
                            $data[$key] = $this->getEntities($data[$key]);
                        }
                        $selection = [];
                        foreach($field->getSettings()['handler_settings']['target_bundles'] as $bundle){
                            $selection[] = $bundle;
                        }
                        $element['graph_options'][$key] = [
                            '#title' => $this->t($field->getLabel()->getUntranslatedString()),
                            '#type' => 'entity_autocomplete',
                            '#target_type' => 'taxonomy_term',
                            '#description' => $this->t('Enter multiple options by separating them with a comma.'),
                            '#tags' => TRUE,
                            '#selection_settings' => [
                                'target_bundles' => $selection
                            ],
                            '#validate_reference' => FALSE,
                            '#required' => FALSE,
                            '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                        ];
                    }else{
                        $field_name_item = $field->getName();
                        $selection = explode(PHP_EOL, file_get_contents($oska_filters_path.$key));
                        $title = $field->getLabel()->getUntranslatedString();
                        $element['graph_options'][$key] = [
                            '#title' => $this->t($title),
                            '#type' => 'select',
                            '#options' => $selection,
                            '#multiple' => TRUE,
                            '#required' => FALSE,
                            '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                        ];
                    }
                }

                if($graph_set == 'combo'){

                    $element['graph_options']['secondary_graph_type'] = [
                        '#title' => $this->t('Secondary graph type'),
                        '#size' => 256,
                        '#type' => 'select',
                        '#default_value' => isset($items[$delta]->secondary_graph_type) ? $items[$delta]->secondary_graph_type : NULL,
                        '#options' => [
                            'line' => $this->t('line'),
                            'bar' => $this->t('bar'),
                        ],
                        '#empty_option'  => '-',
                        '#required' => FALSE,
                        '#delta' => $delta,
                    ];

                    $element['graph_options']['secondary_graph_indicator'] = [
                        '#title' => $this->t('Secondary OSKA indicator'),
                        '#type' => 'entity_autocomplete',
                        '#target_type' => 'taxonomy_term',
                        '#description' => $this->t('Enter multiple options by separating them with a comma.'),
                        '#tags' => TRUE,
                        '#selection_settings' => [
                            'target_bundles' => array('oska_indicator' => 'oska_indicator')
                        ],
                        '#validate_reference' => FALSE,
                        '#required' => FALSE,
                        '#default_value' => isset($data['secondary_graph_indicator']) ? $this->getEntities($data['secondary_graph_indicator']) : NULL,
                    ];
                }
            }
        }

        return $element;

    }

    public function ajax_dependent_graph_type_options_callback(array &$form, FormStateInterface $form_state){
        $field_name = $this->fieldDefinition->getName();
        $trigger_element = $form_state->getTriggeringElement();

        return $form[$field_name]['widget'][$trigger_element['#delta']]['secondary_graph_type'];
    }

    public function ajax_dependent_graph_set_callback(array &$form, FormStateInterface $form_state){
        $field_name = $this->fieldDefinition->getName();
        $trigger_element = $form_state->getTriggeringElement();

        return $form[$field_name]['widget'][$trigger_element['#delta']]['graph_options'];
    }

    public function getEntities($target_ids){
        $entities = [];
        foreach($target_ids as $target_id){
            $entities[] = Term::load($target_id['target_id']);
        }
        return $entities;
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

    public function getSecondaryGraphOptions($primary_graph_type){

        $select_options = [];

        switch($primary_graph_type){
            case 'line':
                $select_options = [
                    '' => $this->t('Select secondary graph type'),
                    'bar' => $this->t('bar'),
                ];
                break;
            case 'bar':
                $select_options = [
                    '' => $this->t('Select secondary graph type'),
                    'line' => $this->t('line'),
                ];
                break;
        }

        return $select_options;
    }

    /**
     * Validate chart selection.
     */
    public function validateChartVaxisInput(&$element, FormStateInterface &$form_state, $form) {
        $parent_field = $this->fieldDefinition->getName();
        $chart_values = $form_state->getValue($parent_field)[$element['#delta']]['graph_options'];
        if($chart_values['graph_type'] != '' || $chart_values['oska_indicator'] != NULL) {
            if($element['#value'] == ''){
                $form_state->setError($element, t('Chart v-axis is missing'));
            }
        }
        if($chart_values['oska_indicator'] == NULL) {
            $form_state->setError($element, t('Chart indicator is missing'));
        }
    }
}