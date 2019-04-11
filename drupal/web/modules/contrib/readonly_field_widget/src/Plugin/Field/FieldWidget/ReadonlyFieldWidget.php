<?php

namespace Drupal\readonly_field_widget\Plugin\Field\FieldWidget;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;

/**
 * Plugin implementation of the 'readonly_field_widget' widget.
 *
 * @FieldWidget(
 *   id = "readonly_field_widget",
 *   label = @Translation("Readonly"),
 *   weight = 1,
 *   field_types = {
 *   }
 * )
 */
class ReadonlyFieldWidget extends WidgetBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The formatter plugin manager.
   *
   * @var \Drupal\Core\Field\FormatterPluginManager
   */
  private $fieldFormatterManager;

  /**
   * {@inheritdoc}
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, $field_formatter_manager, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
    $this->fieldFormatterManager = $field_formatter_manager;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'label' => 'above',
      'formatter_type' => NULL,
      'formatter_settings' => NULL,
      'show_description' => FALSE,
    ];
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
      $container->get('plugin.manager.field.formatter'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function formMultipleElements(FieldItemListInterface $items, array &$form, FormStateInterface $form_state) {
    return $this->formSingleElement($items, 0, [], $form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    if ($this->isDefaultValueWidget($form_state)) {
      return [
        '#markup' => $this->t('Widget is set to Read-Only, switch the widget to something else in order to set default values'),
      ];
    }

    $entity_type = $items->getEntity()->getEntityType()->id();

    /*@var $view_builder \Drupal\Core\Entity\EntityViewBuilderInterface*/
    $view_builder = $this->entityTypeManager->getViewBuilder($entity_type);

    $formatter_type = $this->getSetting('formatter_type');
    $formatter_settings = $this->getSetting('formatter_settings');

    $options = [
      'type' => $formatter_type,
      'label' => $this->getSetting('label'),
      'settings' => isset($formatter_settings[$formatter_type]) ? $formatter_settings[$formatter_type] : [],
    ];

    $element['readonly_field'] = $view_builder->viewField($items, $options);

    // Show description only if there are items to show too.
    if ($this->getSetting('show_description') && !$items->isEmpty()) {
      $element['description'] = [
        '#type' => 'container',
        ['#markup' => $this->getFilteredDescription()],
        '#attributes' => [
          'class' => ['description'],
        ],
      ];
    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {

    $field_type_formatters = $this->fieldFormatterManager->getOptions($this->fieldDefinition->getType());
    $field_type_definitions = $this->fieldFormatterManager->getDefinitions();
    $formatters = [];
    foreach ($field_type_formatters as $formatter_type => $formatter_label) {
      if (!empty($field_type_definitions[$formatter_type])
        && $field_type_definitions[$formatter_type]['class']::isApplicable($this->fieldDefinition)) {
        $formatters[$formatter_type] = $formatter_label;
      }
    }

    $field_name = $this->fieldDefinition->getName();

    $element = [
      'label' => [
        '#title' => $this->t('Label'),
        '#type' => 'select',
        '#options' => $this->labelOptions(),
        '#default_value' => $this->getSetting('label'),
      ],
      'formatter_type' => [
        '#title' => $this->t('Format'),
        '#type' => 'select',
        '#options' => $formatters,
        '#default_value' => $this->getSetting('formatter_type'),
      ],
      'show_description' => [
        '#title' => $this->t('Show Description'),
        '#description' => $this->t('Show the configured description under widget.'),
        '#type' => 'checkbox',
        '#default_value' => $this->getSetting('show_description'),
      ],
    ];

    foreach (array_keys($formatters) as $formatter_plugin_id) {

      $formatter_plugin = $this->getFormatterInstance($formatter_plugin_id);

      $settings_form = $formatter_plugin->settingsForm($form, $form_state);

      if (!empty($settings_form)) {
        $element['formatter_settings'][$formatter_plugin_id] = [
          '#type' => 'fieldset',
          '#title' => $formatters[$formatter_plugin_id] . ' ' . $this->t('Settings'),
          '#states' => [
            'visible' => [
              ':input[name="fields[' . $field_name . '][settings_edit_form][settings][formatter_type]"]' => ['value' => $formatter_plugin_id],
            ],
          ],
        ] + $settings_form;
      }
    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {

    $formatters = $this->fieldFormatterManager->getOptions($this->fieldDefinition->getType());
    $label_options = $this->labelOptions();

    $plugin = $this->getFormatterInstance();
    if ($plugin) {
      $summary = $plugin->settingsSummary();
      $formatter_type = $this->getSetting('formatter_type');
      if (isset($formatters[$formatter_type])) {
        $summary[] = t('Format: @format', ['@format' => $formatters[$formatter_type]]);
      }
    }

    $summary[] = t('Label: @label', [
      '@label' => $label_options[$this->getSetting('label')],
    ]);

    $summary[] = t('Show Description: @show_desc', [
      '@show_desc' => $this->getSetting('show_description') ? $this->t('Yes') : $this->t('No'),
    ]);
    return $summary;
  }

  /**
   * Retrieves a formatter plugin instance.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   *
   * @return \Drupal\Core\Field\FormatterInterface
   *   A formatter plugin instance.
   */
  private function getFormatterInstance($plugin_id = NULL) {
    $settings = $this->getSetting('formatter_settings');
    if (empty($plugin_id)) {
      $plugin_id = $this->getSetting('formatter_type');
    }

    $options = [
      'view_mode' => 'default',
      'field_definition' => $this->fieldDefinition,
      'configuration' => [
        'type' => $plugin_id,
        'settings' => isset($settings[$plugin_id]) ? $settings[$plugin_id] : [],
      ],
    ];

    return $this->fieldFormatterManager->getInstance($options);
  }

  /**
   * Returns label options for field formatters.
   *
   * @return array
   *   The label options
   */
  private function labelOptions() {
    return [
      'above' => $this->t('Above'),
      'inline' => $this->t('Inline'),
      'hidden' => '- ' . $this->t('Hidden') . ' -',
      'visually_hidden' => '- ' . $this->t('Visually Hidden') . ' -',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function errorElement(array $element, ConstraintViolationInterface $error, array $form, FormStateInterface $form_state) {
    // Skip validation for read only fields.
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function flagErrors(FieldItemListInterface $items, ConstraintViolationListInterface $violations, array $form, FormStateInterface $form_state) {
    // Skip validation for read only fields.
  }

}
