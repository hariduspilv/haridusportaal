<?php

namespace Drupal\htm_custom_oska\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\taxonomy\Entity\Term;
use Drupal\Component\Utility\Html;
use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;
use Drupal\Core\TypedData\DataReferenceTargetDefinition;
use Drupal\Core\Entity\TypedData\EntityDataDefinition;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Component\Serialization\Json;

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
            ->setLabel(t('Chart value'))
            ->setComputed(TRUE)
            ->setClass('\Drupal\htm_custom_oska\GoogleChartValue');
        $properties['graph_v_axis'] = DataDefinition::create('string')
            ->setLabel(t('Chart x axis'));
        $properties['filter_values'] = DataDefinition::create('string')
            ->setLabel(t('Graph filter values'));
        $properties['graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Graph type'));
        $properties['secondary_graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Secondary graph type'));
        $properties['graph_indicator'] = DataDefinition::create('string')
            ->setLabel(t('First graph indicator'));
        $properties['secondary_graph_indicator'] = DataDefinition::create('string')
            ->setLabel(t('Secondary graph indicator'));

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
            'description' => 'Main graph type.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['secondary_graph_type'] = [
            'description' => 'Combo graph type.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_v_axis'] = [
            'description' => 'Graph v axis.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_indicator'] = [
            'description' => 'First graph indicator.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['secondary_graph_indicator'] = [
            'description' => 'Secondary graph indicator.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];


        return $schema;
    }

    public function preSave()
    {
        $graph_v_axis_value = $this->getCleanLabel($this->values['graph_v_axis']);
        $indicators = $this->getIndicators($this->values);
        $this->values = [
            'graph_type' => $this->values['graph_type'],
            'secondary_graph_type' => $this->values['secondary_graph_type'] != "" ? $this->values['secondary_graph_type'] : NULL,
            'graph_v_axis' => $graph_v_axis_value,
            'graph_indicator' => isset($indicators[0]) ? $indicators[0] : NULL,
            'secondary_graph_indicator' => isset($indicators[1]) ? $indicators[1] : NULL,
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

    public function getIndicators($filter_values){
        $target_type = $this->getFieldDefinition()->getSettings()['target_type'];

        $entities = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple();
        #get entity fields for finding indicator fields
        $entity_fields = reset($entities)->getFields();

        #find label and value fields
        foreach($entity_fields as $key => $field){
            if(isset($field->getSettings()['graph_indicator'])){
                $indicator_field = $key;
            }
        }
        if(isset($indicator_field) && isset($filter_values[$indicator_field]) && $filter_values[$indicator_field] != NULL){
            foreach($filter_values[$indicator_field] as $field_val){
                $indicators[] = Term::load($field_val['target_id'])->getName();
            }
        }else{
            $indicators = NULL;
        }
        return $indicators;
    }

    public function getCleanLabel($field_name){
        $target_type = $this->getFieldDefinition()->getSettings()['target_type'];
        $entities = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple();

        $entity_fields = reset($entities)->getFields();

        $value_name = $this->t($entity_fields[$field_name]->getFieldDefinition()->getLabel()->getUntranslatedString());

        return $value_name;
    }
}
