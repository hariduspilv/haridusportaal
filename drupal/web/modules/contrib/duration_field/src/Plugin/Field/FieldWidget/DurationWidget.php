<?php

namespace Drupal\duration_field\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Field\WidgetInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\duration_field\Service\DurationServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Creates a default widget to output a duration field.
 *
 * @FieldWidget(
 *   id = "duration_widget",
 *   label = @Translation("Duration widget"),
 *   field_types = {
 *     "duration"
 *   }
 * )
 */
class DurationWidget extends WidgetBase implements WidgetInterface, ContainerFactoryPluginInterface {

  /**
   * The Duration service.
   *
   * @var \Drupal\duration_field\Service\DurationServiceInterface
   */
  protected $durationService;

  /**
   * Constructs a DurationWidget object.
   *
   * @param string $plugin_id
   *   The plugin ID.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The field definition.
   * @param array $settings
   *   The field settings.
   * @param array $third_party_settings
   *   Third party settings.
   * @param \Drupal\duration_field\Service\DurationServiceInterface $durationService
   *   The duration service.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, DurationServiceInterface $durationService) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);

    $this->durationService = $durationService;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings'],
      $container->get('duration_field.service')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'duration' => '',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element['duration'] = [
      '#type' => 'duration',
      '#title' => $this->t('Duration'),
      '#granularity' => $this->getGranularity(),
      '#default_value' => $this->getSetting('duration'),
      '#element_validate' => [
        [$this, 'settingsFormValidate'],
      ],
    ];

    return $element;
  }

  /**
   * Validate the submitted settings.
   */
  public function settingsFormValidate($element, FormStateInterface $form_state) {
    $duration = $form_state->getValue($element['#parents']);

    if ($error_message = $this->durationService->checkDurationInvalid($this->durationService->convertValue($duration))) {
      $form_state->setError($element, $error_message);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];

    $summary[] = t('Default Duration: @duration', ['@duration' => $this->getSetting('duration')]);

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $cardinality = $this->fieldDefinition->getFieldStorageDefinition()->getCardinality();
    $element['value'] = $element + [
      '#type' => 'duration',
      '#default_value' => isset($items[$delta]->value) ? $items[$delta]->value : '',
      '#description' => $element['#description'],
      '#cardinality' => $this->fieldDefinition->getFieldStorageDefinition()->getCardinality(),
      '#granularity' => $this->getGranularity(),
    ];

    return $element;
  }

  /**
   * Get the granularlity of field elements for the widget to display.
   *
   * @return string
   *   A comma-separate string containing keys of duration elements to be shown
   */
  private function getGranularity() {
    $granularity = $this->getFieldSetting('granularity');
    $time_elements = [
      'year' => 'y',
      'month' => 'm',
      'day' => 'd',
      'hour' => 'h',
      'minute' => 'i',
      'second' => 's',
    ];
    $granularity_elements = [];
    foreach ($time_elements as $key => $time_element) {
      if ($granularity[$key]) {
        $granularity_elements[] = $time_element;
      }
    }
    return implode(':', $granularity_elements);
  }

}
