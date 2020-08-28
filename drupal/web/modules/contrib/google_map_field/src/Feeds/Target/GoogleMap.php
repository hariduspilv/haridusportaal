<?php

namespace Drupal\google_map_field\Feeds\Target;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\feeds\FieldTargetDefinition;
use Drupal\feeds\Plugin\Type\Target\ConfigurableTargetInterface;
use Drupal\feeds\Plugin\Type\Target\FieldTargetBase;

/**
 * Defines a google map field mapper.
 *
 * @FeedsTarget(
 *   id = "google_map",
 *   field_types = {"google_map_field"}
 * )
 */
class GoogleMap extends FieldTargetBase implements ConfigurableTargetInterface {

  /**
   * {@inheritdoc}
   */
  protected static function prepareTarget(FieldDefinitionInterface $field_definition) {
    return FieldTargetDefinition::createFromFieldDefinition($field_definition)
      ->addProperty('name')
      ->addProperty('lat')
      ->addProperty('lon')
      ->addProperty('zoom')
      ->addProperty('type')
      ->addProperty('width')
      ->addProperty('height')
      ->addProperty('marker')
      ->addProperty('traffic')
      ->addProperty('marker_icon')
      ->addProperty('controls')
      ->addProperty('infowindow');
  }

  /**
   * {@inheritdoc}
   */
  protected function prepareValue($delta, array &$values) {
    $fields = $this->getConfigurationFields();
    foreach ($fields as $field_id => $name) {
      $config_id = 'default_' . $field_id;      
      if (!$values['value']) {
        $values['value'] = $this->configuration[$config_id];
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return parent::defaultConfiguration() + $this->getConfigurationDefaultValues();
  }

  /**
   * Callback to get default configuration values.
   *
   * @return array
   *   List of default configuration values.
   */
  public function getConfigurationDefaultValues() {
    $values = [
      'default_name' => 'Default location',
      'default_lat' => '51.524295',
      'default_lon' => '-0.12799',
      'default_zoom' => '9',
      'default_type' => 'roadmap',
      'default_width' => '100%',
      'default_height' => '450px',
      'default_marker' => '1',
      'default_traffic' => '0',
      'default_marker_icon' => '',
      'default_controls' => '1',
      'default_infowindow' => '',
    ];

    return $values;
  }

  /**
   * Callback to get configuration fields.
   *
   * @return array
   *   List of configuration fields.
   */
  public function getConfigurationFields() {
    $fields = [
      'name' => 'name',
      'lat' => 'latitude',
      'lon' => 'logitude',
      'zoom' => 'zoom',
      'type' => 'type',
      'width' => 'width',
      'height' => 'height',
      'marker' => 'marker',
      'traffic' => 'traffic',
      'marker_icon' => 'marker_icon',
      'controls' => 'controls',
      'infowindow' => 'infowindow',
    ];

    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $fields = $this->getConfigurationFields();
    foreach ($fields as $index => $name) {
      $field_id = 'default_' . $index;
      $form[$field_id] = [
        '#type' => 'textfield',
        '#title' => $this->t('Default %field value', [
          '%field' => $name,
        ]),
        '#default_value' => $this->configuration[$field_id],
        '#description' => $this->t('Default %field value to use if the field is not ommited.', [
          '%field' => $name,
        ]),
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getSummary() {
    $summary = parent::getSummary();

    $fields = $this->getConfigurationFields();
    $summary[] = $this->t('<strong>Default values</strong> (if source is not selected):');
    foreach ($fields as $index => $name) {
      $field_id = 'default_' . $index;
      $summary[] = $this->t('%fieldid: %fieldvalue', [
        '%fieldid' => $name,
        '%fieldvalue' => $this->configuration[$field_id],
      ]);
    }

    return $summary;
  }

}
