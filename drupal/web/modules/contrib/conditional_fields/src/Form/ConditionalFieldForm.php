<?php

namespace Drupal\conditional_fields\Form;

use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\conditional_fields\Conditions;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Class ConditionalFieldForm.
 *
 * @package Drupal\conditional_fields\Form
 */
class ConditionalFieldForm extends FormBase {

  protected $editPath = 'conditional_fields.edit_form';

  protected $deletePath = 'conditional_fields.delete_form';

  /**
   * Uuid generator.
   *
   * @var UuidInterface
   */
  protected $uuidGenerator;

  /**
   * Provides an interface for an entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * Provides an interface for entity type managers.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * CF lists builder.
   *
   * @var Conditions $list
   */
  protected $list;

  /**
   * Class constructor.
   *
   * @param \Drupal\conditional_fields\Conditions $list
   *   Conditions list provider.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   *   Provides an interface for an entity field manager.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   Provides an interface for entity type managers.
   * @param \Drupal\Component\Uuid\UuidInterface $uuid
   *   Uuid generator.
   */
  public function __construct(Conditions $list, EntityFieldManagerInterface $entity_field_manager, EntityTypeManagerInterface $entity_type_manager, UuidInterface $uuid) {
    $this->entityFieldManager = $entity_field_manager;
    $this->entityTypeManager = $entity_type_manager;
    $this->list = $list;
    $this->uuidGenerator = $uuid;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // Instantiates this form class.
    return new static(
    // Load the service required to construct this class.
      $container->get('conditional_fields.conditions'),
      $container->get('entity_field.manager'),
      $container->get('entity_type.manager'),
      $container->get('uuid')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'conditional_field_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $entity_type = NULL, $bundle = NULL) {

    $form['entity_type'] = [
      '#type' => 'hidden',
      '#value' => $entity_type,
    ];

    $form['bundle'] = [
      '#type' => 'hidden',
      '#value' => $bundle,
    ];

    $form['conditional_fields_wrapper']['table'] = $this->buildTable($form, $form_state, $entity_type, $bundle);

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $table = $form_state->getValue('table');
    if (empty($table['add_new_dependency']) || !is_array($table['add_new_dependency'])) {
      parent::validateForm($form, $form_state);
    }
    $conditional_values = $table['add_new_dependency'];
    // Check dependency.
    if (array_key_exists('dependee', $conditional_values) &&
      array_key_exists('dependent', $conditional_values)
    ) {
      $dependent = $conditional_values['dependent'];
      $state = isset($conditional_values['state']) ? $conditional_values['state'] : NULL;
      $all_states = $this->list->conditionalFieldsStates();
      $entity_type = $form_state->getValue('entity_type');
      $bundle = $form_state->getValue('bundle');
      $instances = $this->entityFieldManager
        ->getFieldDefinitions($entity_type, $bundle);
      foreach ($dependent as $field) {
        if ($conditional_values['dependee'] == $field) {
          $form_state->setErrorByName('dependee', $this->t('You should select two different fields.'));
          $form_state->setErrorByName('dependent', $this->t('You should select two different fields.'));
        }
        // Validate required field should be visible.
        $field_instance = $instances[$field];
        if (
          $field_instance->isRequired() &&
          in_array($state, ['!visible', 'disabled', '!required'])
        ) {
          $form_state->setErrorByName('state', $this->t('Field !field is required and can not have state !state.', [
            '!field' => $field_instance->getLabel() . ' (' . $field_instance->getName() . ')',
            '!state' => $all_states[$state],
          ]));
        }
      }
    }

    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $table = $form_state->getValue('table');
    if (empty($table['add_new_dependency']) || !is_array($table['add_new_dependency'])) {
      parent::submitForm($form, $form_state);
    }

    $field_names = [];
    $form_state->set('plugin_settings_edit', NULL);

    $conditional_values = $table['add_new_dependency'];
    // Copy values from table for submit.
    $component_value = [];
    $settings = $this->list->conditionalFieldsDependencyDefaultSettings();
    foreach ($conditional_values as $key => $value) {
      if ($key == 'dependent') {
        $field_names = $value;
        continue;
      }
      if (in_array($key, ['entity_type', 'bundle', 'dependee'])) {
        $component_value[$key] = $value;
        continue;
      }
      // @TODO: it seems reasonable
      // to only set values allowed by field schema,
      // @see conditional_fields.schema.yml
      $settings[$key] = $value;
    }
    unset($settings['actions']);
    $component_value['settings'] = $settings;

    $component_value['entity_type'] = $form_state->getValue('entity_type');
    $component_value['bundle'] = $form_state->getValue('bundle');

    /** @var \Drupal\Core\Entity\Display\EntityFormDisplayInterface $entity */
    $entity = $this->entityTypeManager
      ->getStorage('entity_form_display')
      ->load($component_value['entity_type'] . '.' . $component_value['bundle'] . '.' . 'default');
    if (!$entity) {
      return;
    }

    // Handle one to one condition creating with redirect to edit form.
    if (count($field_names) == 1) {
      $field_name = reset($field_names);
      $uuid = $form_state->getValue('uuid', $this->uuidGenerator->generate());
      $field = $entity->getComponent($field_name);
      $field['third_party_settings']['conditional_fields'][$uuid] = $component_value;
      $entity->setComponent($field_name, $field);
      $entity->save();
      $parameters = [
        'entity_type' => $component_value['entity_type'],
        'bundle' => $component_value['bundle'],
        'field_name' => $field_name,
        'uuid' => $uuid,
      ];
      $form_state->setRedirect($this->editPath, $parameters);
      return;
    }

    // Handle many to one, in that case we always need new uuid.
    foreach ($field_names as $field_name) {
      $uuid = $this->uuidGenerator->generate();
      $field = $entity->getComponent($field_name);
      $field['third_party_settings']['conditional_fields'][$uuid] = $component_value;
      $entity->setComponent($field_name, $field);
    }
    $entity->save();
  }

  /**
   * Builds table with conditional fields.
   */
  protected function buildTable(array $form, FormStateInterface $form_state, $entity_type, $bundle_name = NULL) {
    $form['table'] = [
      '#type' => 'table',
      '#entity_type' => $entity_type,
      '#bundle_name' => $bundle_name,
      '#header' => [
        $this->t('Target field'),
        $this->t('Controlled by'),
        ['data' => $this->t('Description'), 'colspan' => 2],
        ['data' => $this->t('Operations'), 'colspan' => 2],
      ],
    ];

    // Build list of available fields.
    $fields = [];
    $instances = $this->entityFieldManager
      ->getFieldDefinitions($entity_type, $bundle_name);
    foreach ($instances as $field) {
      $fields[$field->getName()] = $field->getLabel() . ' (' . $field->getName() . ')';
    }

    asort($fields);

    /* Existing conditions. */

    /** @var \Drupal\Core\Entity\Display\EntityFormDisplayInterface $form_display_entity */
    $form_display_entity = $this->entityTypeManager
      ->getStorage('entity_form_display')
      ->load("$entity_type.$bundle_name.default");

    if (!$form_display_entity) {
      return $form['table'];
    }

    foreach ($fields as $field_name => $label) {
      $field = $form_display_entity->getComponent($field_name);
      if (empty($field['third_party_settings']['conditional_fields'])) {
        continue;
      }
      // Create row for existing field's conditions.
      foreach ($field['third_party_settings']['conditional_fields'] as $uuid => $condition) {
        $parameters = [
          'entity_type' => $condition['entity_type'],
          'bundle' => $condition['bundle'],
          'field_name' => $field_name,
          'uuid' => $uuid,
        ];

        $form['table'][] = [
          'dependent' => ['#markup' => $field_name],
          'dependee' => ['#markup' => $condition['dependee']],
          'state' => ['#markup' => $condition['settings']['state']],
          'condition' => ['#markup' => $condition['settings']['condition']],
          'actions' => [
            '#type' => 'operations',
            '#links' => [
              'edit' => [
                'title' => $this->t('Edit'),
                'url' => Url::fromRoute($this->editPath, $parameters),
              ],
              'delete' => [
                'title' => $this->t('Delete'),
                'url' => Url::fromRoute($this->deletePath, $parameters),
              ],
            ],
          ],
        ];
      }
    }

    /* Row for creating new condition. */

    // Build list of states.
    $states = $this->list->conditionalFieldsStates();

    // Build list of conditions.
    $conditions = [];
    foreach ($this->list->conditionalFieldsConditions() as $condition => $label) {
      $label = (string) $label;
      $conditions[$condition] = $condition == 'value' ? $this->t('has value...') : $this->t('is @label', ['@label' => (string) $label]);
    }

    // Add new dependency row.
    $form['table']['add_new_dependency'] = [
      'dependent' => [
        '#type' => 'select',
        '#multiple' => TRUE,
        '#title' => $this->t('Target field'),
        '#title_display' => 'invisible',
        '#description' => $this->t('Target field'),
        '#options' => $fields,
        '#prefix' => '<div class="add-new-placeholder">' . $this->t('Add new dependency') . '</div>',
        '#required' => TRUE,
        '#attributes' => [
          'class' => ['conditional-fields-selector'],
          'style' => ['resize: both;'],
        ],
      ],
      'dependee' => [
        '#type' => 'select',
        '#title' => $this->t('Controlled by'),
        '#title_display' => 'invisible',
        '#description' => $this->t('Control field'),
        '#options' => $fields,
        '#prefix' => '<div class="add-new-placeholder">&nbsp;</div>',
        '#required' => TRUE,
        '#attributes' => ['class' => ['conditional-fields-selector']],
      ],
      'state' => [
        '#type' => 'select',
        '#title' => $this->t('State'),
        '#title_display' => 'invisible',
        '#options' => $states,
        '#default_value' => 'visible',
        '#prefix' => $this->t('The target field is'),
      ],
      'condition' => [
        '#type' => 'select',
        '#title' => $this->t('Condition'),
        '#title_display' => 'invisible',
        '#options' => $conditions,
        '#default_value' => 'value',
        '#prefix' => $this->t('when the control field'),
      ],
      'actions' => [
        'submit' => [
          '#type' => 'submit',
          '#value' => $this->t('Add dependency'),
        ],
      ],
    ];

    $form['table']['#attached']['library'][] = 'conditional_fields/admin';

    return $form['table'];
  }

}
