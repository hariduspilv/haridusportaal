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
 *   id = "oska_dynamic_graph_field",
 *   label = @Translation("Oska dynamic graph field"),
 *   description = @Translation("Field which consists of OSKA dynamic graph information"),
 *   default_widget = "oska_dynamic_graph_widget_type",
 *   default_formatter = "oska_graph_formatter_type"
 * )
 */
class OskaDynamicGraphField extends FieldItemBase {

    /**
     * {@inheritdoc}
     */
    public static function defaultStorageSettings() {
        return [
                'csv_location' => '',
            ] + parent::defaultStorageSettings();
    }

    public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition)
    {
        $properties['graph_set'] = DataDefinition::create('string')
            ->setLabel(t('Chart set'));
        $properties['graph_title'] = DataDefinition::create('string')
            ->setLabel(t('Chart title'));
        $properties['graph_v_axis'] = DataDefinition::create('string')
            ->setLabel(t('Chart x axis'));
        $properties['filter_values'] = DataDefinition::create('string')
            ->setLabel(t('Graph filter values'));
        $properties['graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Graph type'));
        $properties['secondary_graph_type'] = DataDefinition::create('string')
            ->setLabel(t('Secondary graph type'));
        $properties['graph_text'] = DataDefinition::create('string')
            ->setLabel(t('Graph info text'));

        return $properties;

    }

    public static function schema(FieldStorageDefinitionInterface $field_definition)
    {
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
        $schema['columns']['graph_v_axis'] = [
            'description' => 'Graph v axis.',
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
        $element['csv_location'] = [
            '#title' => $this->t('Location of csv'),
            '#type' => 'textfield',
            '#placeholder' => $this->t("Enter location for CSV"),
            '#default_value' => $this->getSetting('csv_location'),
            '#maxlength' => 100,
        ];
        return $element;
    }
}
