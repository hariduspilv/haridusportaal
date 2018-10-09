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
        $properties['graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Graph type'));
        $properties['secondary_graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Secondary graph type'));

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
        $schema['columns']['graph_type'] = [
            'description' => 'Graph filter values.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['secondary_graph_type'] = [
            'description' => 'Graph filter values.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];

        return $schema;
    }

    public function preSave()
    {

        $this->values = [
            'graph_type' => $this->values['graph_type'],
            'secondary_graph_type' => $this->values['secondary_graph_type'],
            'value' => $this->getGoogleGraphData($this->values),
            'filter_values' => json_encode($this->values, TRUE),
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

    public function getGoogleGraphData($graph_info){
        $condition_count = 0;
        $target_type = $this->definition->getSettings()['target_type'];
        $filter_values = $graph_info;

        foreach($graph_info as $key => $value){
            if($key != 'graph_type' && $key != 'secondary_graph_type'){
                $filter_values[$key] = $value;
                unset($graph_info[$key]);
            }else{
                unset($filter_values[$key]);
            }
        }

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

        if(isset($entity_ids)){
            $entities = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple($entity_ids);
            $graph_value = $this->getGoogleGraphValue($entities, $graph_info, $filter_values);

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

    public function getGoogleGraphValue($entities, $graph_info, $filter_values){

        $array = '[
            ["Year", "Sales", "Expenses"],
            ["2004",  1000,      400],
            ["2005",  1170,      460],
            ["2006",  660,       1120],
            ["2007",  1030,      540]]';

        $new_array = [

        ];
        #kint(json_decode($array));
        #kint($filter_values);
        #die();

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
                $year = $entity->year->value;
                if(!isset($labelsums[$labelval])){
                    $labelsums[$labelval][$year] = $val;
                }else{
                    $labelsums[$labelval][$year] .= $val;
                }
            }

            #add data for each row
            $data_array = [];
            $data_array[] = [$entity->year->getName(), $entity->$label_field->getName()];
            foreach($labelsums as $label => $value){
                foreach($value as $year => $val){
                    $data_array[] = [(string)$year, intval($val)];
                }
            }
        }else{
            return FALSE;
        }

        return json_encode($data_array, TRUE);
    }
}
