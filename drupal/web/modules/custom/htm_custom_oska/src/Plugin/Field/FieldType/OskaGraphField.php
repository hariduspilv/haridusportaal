<?php

namespace Drupal\htm_custom_oska\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\Core\Field\FieldItemBase;

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
        $properties['graph_set'] = DataDefinition::create('string')
            ->setLabel(t('Chart set'));
        $properties['graph_title'] = DataDefinition::create('string')
            ->setLabel(t('Chart title'));
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
        $properties['graph_text'] = DataDefinition::create('string')
            ->setLabel(t('Graph info text'));
        $properties['graph_v_axis'] = DataDefinition::create('string')
            ->setLabel(t('Graph info text'));

        return $properties;

    }

    public static function schema(FieldStorageDefinitionInterface $field_definition)
    {
        $schema['columns']['value'] = [
            'description' => 'Graph value.',
            'type' => 'json',
            'pgsql_type' => 'json',
            'mysql_type' => 'json',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_set'] = [
            'description' => 'Graph set.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_title'] = [
            'description' => 'Graph title.',
            'type' => 'varchar',
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
        $schema['columns']['graph_indicator'] = [
            'description' => 'First graph indicator.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_v_axis'] = [
            'description' => 'First graph indicator.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['secondary_graph_indicator'] = [
            'description' => 'Secondary graph indicator.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];
        $schema['columns']['graph_text'] = [
            'description' => 'Graph info text.',
            'type' => 'varchar',
            'not null' => FALSE,
        ];


        return $schema;
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
}
