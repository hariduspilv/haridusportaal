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
                ]
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
        }

        return $element;

    }

    public function getEntities($target_ids){
        $entities = [];
        foreach($target_ids as $target_id){
            $entities[] = Term::load($target_id['target_id']);
        }
        return $entities;
    }
}
