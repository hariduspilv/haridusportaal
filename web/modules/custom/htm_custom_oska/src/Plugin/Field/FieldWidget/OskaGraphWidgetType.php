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

        $data = isset($items[$delta]->filter_values) ? json_decode($items[$delta]->filter_values, true) : NULL;
        $fields = [];
        $settings = $this->getFieldSettings();
        $entity = \Drupal::entityTypeManager()->getStorage($settings['target_type'])->loadMultiple();
        $entity = reset($entity);

        $element += [
            '#type' => 'fieldset',
            '#title' => $this->t('Graph'),
        ];

        if($entity){
            foreach($entity->getFields() as $key => $field){
                $field_settings = $field->getSettings();
                if(isset($field_settings['graph_filter'])){
                    $fields[$key] = $field;
                    if(!isset($field_settings['graph_indicator'])){
                        $v_axis_options[$key] = $this->t($field->getFieldDefinition()->getLabel()->getUntranslatedString());
                    }
                }
                if(isset($field_settings['graph_indicator'])){
                    $fields[$key] = $field;
                    $secondary_indicator[$key] = $field;
                }
                if(isset($field_settings['graph_label'])){
                    $v_axis_options[$key] = $this->t($field->getFieldDefinition()->getLabel()->getUntranslatedString());
                }
            }

            $element['graph_type'] = [
                '#title' => $this->t('Graph type'),
                '#size' => 256,
                '#type' => 'select',
                '#default_value' => isset($data['graph_type']) ? $data['graph_type'] : NULL,
                '#options' => [
                    'line' => $this->t('line'),
                    'bar' => $this->t('bar'),
                    'column' => $this->t('column'),
                    'pie' => $this->t('pie'),
                    'doughnut' => $this->t('doughnut'),
                    'scatter' => $this->t('scatter')
                ],
                '#required' => FALSE,
                '#empty_option'  => '-',
                '#ajax' => [
                    'callback' => [$this,'ajax_dependent_graph_type_options_callback'],
                    'wrapper' => 'secondary_graph_type_options'.$delta,
                ],
                '#delta' => $delta,
            ];

            foreach($fields as $key => $field){
                if($field instanceof \Drupal\Core\Field\EntityReferenceFieldItemList){
                    if(isset($data[$key])){
                        $data[$key] = $this->getEntities($data[$key]);
                    }
                    $selection = [];
                    foreach($field->getSettings()['handler_settings']['target_bundles'] as $bundle){
                        $selection[] = $bundle;
                    }
                    $element[$key] = [
                        '#title' => $this->t($field->getFieldDefinition()->getLabel()->getUntranslatedString()),
                        '#type' => 'entity_autocomplete',
                        '#target_type' => 'taxonomy_term',
                        '#tags' => TRUE,
                        '#selection_settings' => [
                            'target_bundles' => $selection
                        ],
                        '#validate_reference' => FALSE,
                        '#required' => FALSE,
                        '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                    ];
                }else{
                    $selection = [];
                    $values = \Drupal::entityTypeManager()->getStorage($settings['target_type'])->loadMultiple();
                    $field_name_item = $field->getName();
                    foreach($values as $value){
                        $selection_item = $value->$field_name_item->value;
                        if($selection_item != ''){
                            $selection[$selection_item] = $selection_item;
                        }
                    }
                    $title = $field->getFieldDefinition()->getLabel()->getUntranslatedString();
                    $element[$key] = [
                        '#title' => $this->t($title),
                        '#type' => 'select',
                        '#options' => $selection,
                        '#multiple' => TRUE,
                        '#required' => FALSE,
                        '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                    ];
                }
            }

            $element['graph_v_axis'] = [
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

            $field_name = $this->fieldDefinition->getName();

            if(isset($form_state->getUserInput()[$field_name])){
                $sec_graph_options = $this->getSecondaryGraphOptions($form_state->getUserInput()[$field_name][$delta]['graph_type']);
            }else if(isset($items[$delta]->graph_type)){
                $sec_graph_options = $this->getSecondaryGraphOptions($items[$delta]->graph_type);
            }else{
                $sec_graph_options = $this->getSecondaryGraphOptions('');
            }
            $element['secondary_graph_type'] = [
                '#prefix' => '<div id="secondary_graph_type_options'.$delta.'">',
                '#suffix' => '</div>',
                '#title' => $this->t('Secondary graph type'),
                '#size' => 256,
                '#type' => 'select',
                '#disabled' => count($sec_graph_options) > 0 ? FALSE : TRUE,
                '#default_value' => isset($items[$delta]->secondary_graph_type) ? $items[$delta]->secondary_graph_type : NULL,
                '#options' =>  $sec_graph_options,
                '#empty_option'  => '-',
                '#required' => FALSE,
            ];

        }

        return $element;

    }

    public function ajax_dependent_graph_type_options_callback(array &$form, FormStateInterface $form_state){
        $field_name = $this->fieldDefinition->getName();
        $trigger_element = $form_state->getTriggeringElement();

        return $form[$field_name]['widget'][$trigger_element['#delta']]['secondary_graph_type'];
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
        $chart_values = $form_state->getValue($parent_field)[$element['#delta']];
        if($chart_values['graph_type'] != '' || $chart_values['oska_indicator'] != NULL) {
            if($element['#value'] == ''){
                $form_state->setError($element, t('Chart v-axis is missing'));
            }
        }
    }
}
