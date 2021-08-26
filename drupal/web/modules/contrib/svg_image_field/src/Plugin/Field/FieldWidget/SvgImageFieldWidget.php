<?php

namespace Drupal\svg_image_field\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Renderer;
use Drupal\Core\Render\ElementInfoManagerInterface;
use Drupal\file\Entity\File;
use Drupal\file\Plugin\Field\FieldWidget\FileWidget;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'image_image' widget.
 *
 * @FieldWidget(
 *   id = "svg_image_field_widget",
 *   label = @Translation("SVG image"),
 *   field_types = {
 *     "svg_image_field"
 *   }
 * )
 */
class SvgImageFieldWidget extends FileWidget {

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\Renderer
   */
  protected $renderer;

  /**
   * The entity repository Service.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  /**
   * {@inheritdoc}
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, ElementInfoManagerInterface $element_info, Renderer $renderer, EntityRepositoryInterface $entity_repository) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings, $element_info);
    $this->renderer = $renderer;
    $this->entityRepository = $entity_repository;
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
      $container->get('element_info'),
      $container->get('renderer'),
      $container->get('entity.repository')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'progress_indicator' => 'throbber',
      'preview_image_max_width' => 300,
      'preview_image_max_height' => 300,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::settingsForm($form, $form_state);
    $element['preview_image_max_width'] = [
      '#title' => t('Preview image max width'),
      '#type' => 'number',
      '#default_value' => $this->getSetting('preview_image_max_width'),
      '#weight' => 15,
    ];
    $element['preview_image_max_height'] = [
      '#title' => t('Preview image max height'),
      '#type' => 'number',
      '#default_value' => $this->getSetting('preview_image_max_height'),
      '#weight' => 16,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();
    $preview_image_max_width = t('Preview image width: @width', ['@width' => $this->getSetting('preview_image_max_width')]);
    $preview_image_max_height = t('Preview image height: @height', ['@height' => $this->getSetting('preview_image_max_height')]);

    array_unshift($summary, $preview_image_max_width);
    array_unshift($summary, $preview_image_max_height);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  protected function formMultipleElements(FieldItemListInterface $items, array &$form, FormStateInterface $form_state) {
    $elements = parent::formMultipleElements($items, $form, $form_state);

    $cardinality = $this->fieldDefinition->getFieldStorageDefinition()->getCardinality();
    $file_upload_help = [
      '#theme' => 'file_upload_help',
      '#description' => '',
      '#upload_validators' => $elements[0]['#upload_validators'],
      '#cardinality' => $cardinality,
    ];
    if ($cardinality == 1) {
      // If there's only one field, return it as delta 0.
      if (empty($elements[0]['#default_value']['fids'])) {
        $file_upload_help['#description'] = $this->getFilteredDescription();
        $elements[0]['#description'] = $this->renderer->renderPlain($file_upload_help);
      }
    }
    else {
      $elements['#file_upload_description'] = $file_upload_help;
    }

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);

    $field_settings = $this->getFieldSettings();
    $element['#upload_validators']['file_validate_extensions'][0] = 'svg';
    $element['#upload_validators']['svg_image_field_validate_mime_type'] = [];

    // Add properties needed by process() method.
    $element['#preview_image_max_width'] = $this->getSetting('preview_image_max_width');
    $element['#preview_image_max_height'] = $this->getSetting('preview_image_max_height');
    $element['#title_field'] = $field_settings['title_field'];
    $element['#title_field_required'] = $field_settings['title_field_required'];
    $element['#alt_field'] = $field_settings['alt_field'];
    $element['#alt_field_required'] = $field_settings['alt_field_required'];

    // Default image.
    $default_image = $field_settings['default_image'];
    if (empty($default_image['uuid'])) {
      $default_image = $this->fieldDefinition->getFieldStorageDefinition()->getSetting('default_image');
    }
    // Convert the stored UUID into a file ID.
    if (!empty($default_image['uuid']) && $entity = $this->entityRepository->loadEntityByUuid('file', $default_image['uuid'])) {
      $default_image['fid'] = $entity->id();
    }
    $element['#default_image'] = !empty($default_image['fid']) ? $default_image : [];

    return $element;
  }

  /**
   * Form API callback: Processes a image_image field element.
   *
   * Expands the image_image type to include the alt and title fields.
   *
   * This method is assigned as a #process callback in formElement() method.
   */
  public static function process($element, FormStateInterface $form_state, $form) {
    $item = $element['#value'];
    $item['fids'] = $element['fids']['#value'];

    $element['#theme'] = 'image_widget';

    // Add the image preview.
    if (!empty($element['#files']) && ($element['#preview_image_max_width'] || $element['#preview_image_max_height'])) {
      $file = reset($element['#files']);
      $attributes = [
        'style' => '',
      ];
      if (!empty($element['#preview_image_max_width'])) {
        $attributes['style'] = "max-width: {$element['#preview_image_max_width']}px;";
      }
      if (!empty($element['#preview_image_max_height'])) {
        $attributes['style'] .= "max-height: {$element['#preview_image_max_height']}px;";
      }
      if (!empty($item['alt'])) {
        $attributes['alt'] = $item['alt'];
        $attributes['title'] = $attributes['alt'];
      }
      $element['preview'] = [
        '#theme' => 'svg_image_field_formatter',
        '#inline' => FALSE,
        '#attributes' => $attributes,
        '#uri' => $file->getFileUri(),
        '#svg_data' => NULL,
      ];
    }
    elseif (!empty($element['#default_image'])) {
      $default_image = $element['#default_image'];
      $file = File::load($default_image['fid']);
      if (!empty($file)) {
        $attributes = [
          'style' => '',
        ];
        if (!empty($element['#preview_image_max_width'])) {
          $attributes['style'] = "max-width={$element['#preview_image_max_width']}px;";
        }
        if (!empty($element['#preview_image_max_height'])) {
          $attributes['style'] .= "max-height={$element['#preview_image_max_height']}px;";
        }
        $element['preview'] = [
          '#weight' => -10,
          '#theme' => 'svg_image_field_formatter',
          '#inline' => FALSE,
          '#attributes' => $attributes,
          '#uri' => $file->getFileUri(),
          '#svg_data' => NULL,
        ];
      }
    }

    // Add the additional alt and title fields.
    $element['alt'] = [
      '#title' => t('Alternative text'),
      '#type' => 'textfield',
      '#default_value' => isset($item['alt']) ? $item['alt'] : '',
      '#description' => t('This text will be used by screen readers, search engines, or when the image cannot be loaded.'),
        // @see https://www.drupal.org/node/465106#alt-text
      '#maxlength' => 512,
      '#weight' => -12,
      '#access' => (bool) $item['fids'] && $element['#alt_field'],
      '#required' => $element['#alt_field_required'],
      '#element_validate' => $element['#alt_field_required'] == 1 ? [[get_called_class(), 'validateRequiredFields']] : [],
    ];
    $element['title'] = [
      '#type' => 'textfield',
      '#title' => t('Title'),
      '#default_value' => isset($item['title']) ? $item['title'] : '',
      '#description' => t('The title is used as a tool tip when the user hovers the mouse over the image.'),
      '#maxlength' => 1024,
      '#weight' => -11,
      '#access' => (bool) $item['fids'] && $element['#title_field'],
      '#required' => $element['#title_field_required'],
      '#element_validate' => $element['#title_field_required'] == 1 ? [[get_called_class(), 'validateRequiredFields']] : [],
    ];

    return parent::process($element, $form_state, $form);
  }

  /**
   * Validate callback for alt and title field, if the user wants them required.
   *
   * This is separated in a validate function instead of a #required flag to
   * avoid being validated on the process callback.
   */
  public static function validateRequiredFields($element, FormStateInterface $form_state) {
    // Only do validation if the function is triggered from other places than
    // the image process form.
    if (!in_array('file_managed_file_submit', $form_state->getTriggeringElement()['#submit'])) {
      // If the image is not there, we do not check for empty values.
      $parents = $element['#parents'];
      $field = array_pop($parents);
      $image_field = NestedArray::getValue($form_state->getUserInput(), $parents);
      // We check for the array key, so that it can be NULL (like if the user
      // submits the form without using the "upload" button).
      if (!array_key_exists($field, $image_field)) {
        return;
      }
    }
    else {
      $form_state->setLimitValidationErrors([]);
    }
  }

}
