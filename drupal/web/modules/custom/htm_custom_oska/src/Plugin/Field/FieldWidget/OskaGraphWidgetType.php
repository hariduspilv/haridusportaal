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
                if(isset($field_settings['graph_filter']) || isset($field_settings['graph_indicator'])){
                    $fields[$key] = $field;
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
                    'gauge' => $this->t('gauge'),
                    'pie' => $this->t('pie'),
                    'doughnut' => $this->t('doughnut'),
                    'scatter' => $this->t('scatter')
                ],
                '#empty_option'  => t('Select graph type'),
                '#ajax' => [
                    'callback' => [$this,'ajax_dependent_graph_type_options_callback'],
                    'wrapper' => 'secondary_graph_type_options'.$delta,
                    'method' => 'replace',
                ],
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
                        '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                    ];
                }else{
                    $selection = [];
                    $values = \Drupal::entityTypeManager()->getStorage($settings['target_type'])->loadMultiple();
                    $field_name_item = $field->getName();
                    foreach($values as $value){
                        $selection_item = $value->$field_name_item->value;
                        $selection[$selection_item] = $selection_item;
                    }
                    $element[$key] = [
                        '#title' => $this->t($field->getFieldDefinition()->getLabel()->getUntranslatedString()),
                        '#type' => 'select',
                        '#default_value' => isset($data[$key]) ? $data[$key] : NULL,
                        '#options' => $selection,
                        '#multiple' => TRUE,
                    ];
                }
            }

            if(isset($data['graph_type'])){
                $sec_graph_options = $this->getSecondaryGraphOptions($data['graph_type']);
            }

            $element['secondary_graph_type'] = [
                '#prefix' => '<div id="secondary_graph_type_options'.$delta.'">',
                '#suffix' => '</div>',
                '#title' => $this->t('Secondary graph type'),
                '#size' => 256,
                '#disabled' => isset($sec_graph_options) ? FALSE : TRUE,
                '#type' => isset($sec_graph_options) ? 'select' : 'hidden',
                '#default_value' => isset($data['secondary_graph_type']) ? $data['secondary_graph_type'] : NULL,
            ];

            if(isset($sec_graph_options)){
                $element['secondary_graph_type']['#options'] = $sec_graph_options;
            }
        }

        return $element;

    }

    public function ajax_dependent_graph_type_options_callback(array &$form, FormStateInterface $form_state){
        $trigger_element = $form_state->getTriggeringElement();
        $wrapper = $trigger_element['#ajax']['wrapper'];

        $element = [
            '#prefix' => '<div id="'.$wrapper.'">',
            '#suffix' => '</div>',
            '#title' => $this->t('Secondary graph type'),
            '#size' => 256,
            '#disabled' => TRUE,
            '#type' => 'hidden',
            '#default_value' => NULL,
        ];
        $graph_type = $trigger_element['#value'];

        if($graph_type != ''){
            switch($graph_type){
                case 'line':
                    $select_options = [
                        'bar' => $this->t('bar'),
                    ];
                    break;
                case 'bar':
                    $select_options = [
                        'line' => $this->t('line'),
                    ];
                    break;
            }

            if(count($select_options) > 0){
                $element = [
                    '#prefix' => '<div id="'.$wrapper.'">',
                    '#suffix' => '</div>',
                    '#title' => $this->t('Secondary graph type'),
                    '#size' => 256,
                    '#type' => 'select',
                    '#options' => $select_options,
                    '#empty_option'  => t('Select graph type'),
                ];
            }
        }
        $form_state->setRebuild();

        return $element;
    }

    public function getEntities($target_ids){
        $entities = [];
        foreach($target_ids as $target_id){
            $entities[] = Term::load($target_id['target_id']);
        }
        return $entities;
    }

    public function getSecondaryGraphOptions($primary_graph_type){

        switch($primary_graph_type){
            case 'line':
                $select_options = [
                    'bar' => $this->t('bar'),
                ];
                break;
            case 'bar':
                $select_options = [
                    'line' => $this->t('line'),
                ];
                break;
        }

        return $select_options;
    }
}
