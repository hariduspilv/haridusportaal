<?php

/**
 * @file
 * Contains \Drupal\hms_field\Plugin\Field\FieldWidget\HMSFieldWidget.
 */

namespace Drupal\hms_field\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\hms_field\HMSServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'hms_default' widget.
 *
 * @FieldWidget(
 *   id = "hms_default",
 *   label = @Translation("Hour Minutes and Seconds"),
 *   field_types = {
 *     "hms"
 *   },
 * )
 */
class HMSFieldWidget extends WidgetBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, HMSServiceInterface $hms_service) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
    $this->hms_service = $hms_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($plugin_id, $plugin_definition, $configuration['field_definition'], $configuration['settings'], $configuration['third_party_settings'], $container->get('hms_field.hms'));
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return array(
      'format' => "h:mm",
      'default_placeholder' => 1,
      'placeholder' => ''
    ) + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = parent::settingsForm($form, $form_state);

    $elements['format'] = array(
      '#type' => 'select',
      '#title' => t('Input format'),
      '#default_value' => $this->getSetting('format'),
      '#options' => $this->hms_service->format_options(),
      '#description' => t('The input format used for this field.'),
    );
    $elements['default_placeholder'] = array(
      '#type' => 'checkbox',
      '#title' => t('Default placeholder'),
      '#default_value' => $this->getSetting('default_placeholder'),
      '#description' => t('Provide a default placeholder with the format.'),
    );
    $elements['placeholder'] = array(
      '#type' => 'textfield',
      '#title' => t('Placeholder'),
      '#default_value' => $this->getSetting('placeholder'),
      '#description' => t('Text that will be shown inside the field until a value is entered. This hint is usually a sample value or a brief description of the expected format.'),
      '#states' => array(
        'invisible' => array(
          ':input[name*="default_placeholder"]' => array('checked' => TRUE),
        ),
      ),
    );
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = array();

    $summary[] = t('Format: @format', array('@format' => $this->getSetting('format')));
    $summary[] = t('Placeholder: @value', array('@value' => ($this->getSetting('default_placeholder') ? $this->getSetting('format') : $this->getSetting('placeholder'))));

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element += array(
      '#attributes' => array('class' => array('hms-field')),
      '#default_value' => isset($items[$delta]->value) ? $items[$delta]->value : NULL,
      '#format' => $this->getSetting('format'),
      '#placeholder' => ($this->getSetting('default_placeholder')) ? $this->getSetting('format') : $this->getSetting('placeholder'),
      '#type' => 'hms',
    );
    return array('value' => $element);
  }
}
