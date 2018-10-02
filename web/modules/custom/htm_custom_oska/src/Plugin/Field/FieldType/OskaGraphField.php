<?php

namespace Drupal\htm_custom_oska\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\Component\Utility\Html;
use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;
use Drupal\Core\TypedData\DataReferenceTargetDefinition;
use Drupal\Core\Entity\TypedData\EntityDataDefinition;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Component\Serialization\Json;
use Drupal\taxonomy\Entity\Term;

/**
 * Plugin implementation of the 'oska_graph_field' field type.
 *
 * @FieldType(
 *   id = "oska_graph_field",
 *   label = @Translation("Oska graph field"),
 *   description = @Translation("Field which consists of OSKA graph information"),
 *   default_widget = "oska_graph_widget_type",
 *   default_formatter = "oska_graph_formatter_type"
 * )
 */
class OskaGraphField extends FieldItemBase {

    /**
     * {@inheritdoc}
     */
    public static function defaultStorageSettings() {
        return [
                'target_type' => '',
            ] + parent::defaultStorageSettings();
    }

    public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition)
    {
        $properties['value'] = DataDefinition::create('string')
            ->setLabel(t('Graph title'));
        $properties['filter_values'] = DataDefinition::create('string')
            ->setLabel(t('Graph filter values'));

        return $properties;

    }

    public static function schema(FieldStorageDefinitionInterface $field_definition)
    {
        $schema['columns']['value'] = [
            'description' => 'Graph title.',
            'type' => 'json',
            'pgsql_type' => 'json',
            'mysql_type' => 'json',
            'not null' => FALSE,
        ];
        $schema['columns']['filter_values'] = [
            'description' => 'Graph filter values.',
            'type' => 'json',
            'pgsql_type' => 'json',
            'mysql_type' => 'json',
            'not null' => FALSE,
        ];

        return $schema;
    }

    public function preSave()
    {
        $graph_type = $this->values['graph_type'];
        $this->values = [
            'value' => $this->getGoogleGraphData($this->values),
            'filter_values' => json_encode($this->values, TRUE),
            'graph_type' => $graph_type
        ];
    }

    public function storageSettingsForm(array &$form, FormStateInterface $form_state, $has_data)
    {
        $target_type_options = [];
        $objects = \Drupal::entityTypeManager()->getDefinitions();
        foreach($objects as $key => $object){
            if(strpos($key, "_entity")){
                $target_type_options[$key] = $object->getLabel();
            }
        }
        $element['target_type'] = [
            '#type' => 'select',
            '#title' => t('Type of item to reference'),
            '#options' => $target_type_options,
            '#default_value' => $this->getSetting('target_type'),
            '#required' => TRUE,
            '#disabled' => $has_data,
            '#size' => 1,
        ];
        return $element;
    }

    public function getGoogleGraphData($filter_values){
        $condition_count = 0;
        $target_type = $this->definition->getSettings()['target_type'];
        unset($filter_values['graph_type']);

        $query = \Drupal::entityQuery($target_type);

        foreach($filter_values as $key => $filter){
            if(isset($filter[0]['target_id'])){
                $search_args = $this->cleanFilters($filter);
                if($search_args != NULL){
                    $query->condition($key.'.target_id', $search_args, 'IN');
                    $condition_count++;
                }
            }else{
                if(count($filter) > 0){
                    $query->condition($key, $filter, 'IN');
                    $condition_count++;
                }
            }
        }
        if($condition_count > 0){
            $entity_ids = $query->execute();

        }

        if($entity_ids){
            $entities = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple($entity_ids);
            $graph_value = $this->getGoogleGraphValue($entities);

            return $graph_value;
        }else{
            return NULL;
        }


    }

    public function cleanFilters($filters){
        foreach($filters as $filter){
            $cleaned_filters[] = $filter['target_id'];
        }
        return $cleaned_filters;
    }

    public function getGoogleGraphValue($entities){

        $raw_value = [
            'cols' => [],
            'rows' => [],
        ];

        #add default group label name
        $raw_value['cols'][] = [
            'id' => '',
            'label' => 'Label',
            'pattern' => '',
            'type' => 'string',
        ];

        #add group value field
        $raw_value['cols'][] = [
            'id' => '',
            'label' => 'Value',
            'pattern' => '',
            'type' => 'number',
        ];

        #get entity fields for finding label and value fields
        $entity_fields = reset($entities)->getFields();

        #find label and value fields
        foreach($entity_fields as $key => $field){
            if(isset($field->getSettings()['graph_label'])){
                $label_field = $key;
            }
            if(isset($field->getSettings()['graph_value'])){
                $value_field = $key;
            }
        }
        if($label_field && $value_field){
            $labelsums = [];
            #get value for each label, sum reoccurring labels
            foreach($entities as $entity){
                $labelval = $entity->$label_field->value;
                $val = $entity->$value_field->value;
                if(!isset($labelsums[$labelval])){
                    $labelsums[$labelval] = $val;
                }else{
                    $labelsums[$labelval] .= $val;
                }
            }

            #add data for each row
            foreach($labelsums as $label => $value){
                $raw_value['rows'][]['c'] = [
                  [
                      'v' => $label,
                      'f' => NULL
                  ],
                    [
                        'v' => $value,
                        'f' => NULL
                    ]
                ];
            }
        }else{
            return FALSE;
        }

        return json_encode($raw_value, TRUE);
    }
}
