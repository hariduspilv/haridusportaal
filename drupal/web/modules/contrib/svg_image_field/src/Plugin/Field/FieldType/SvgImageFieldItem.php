<?php

namespace Drupal\svg_image_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StreamWrapper\StreamWrapperInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\file\Plugin\Field\FieldType\FileItem;

/**
 * Plugin implementation of the 'svg_image' field type.
 *
 * @FieldType(
 *   id = "svg_image_field",
 *   label = @Translation("Svg Image"),
 *   description = @Translation("This field stores the ID of an image file as an integer value."),
 *   category = @Translation("Reference"),
 *   default_widget = "svg_image_field_widget",
 *   default_formatter = "svg_image_field_formatter",
 *   column_groups = {
 *     "file" = {
 *       "label" = @Translation("File"),
 *       "columns" = {
 *         "target_id"
 *       },
 *       "require_all_groups_for_translation" = TRUE
 *     },
 *     "alt" = {
 *       "label" = @Translation("Alt"),
 *       "translatable" = TRUE
 *     },
 *     "title" = {
 *       "label" = @Translation("Title"),
 *       "translatable" = TRUE
 *     },
 *   },
 *   list_class = "\Drupal\file\Plugin\Field\FieldType\FileFieldItemList",
 *   constraints = {"ReferenceAccess" = {}, "FileValidation" = {}}
 * )
 */
class SvgImageFieldItem extends FileItem {

  /**
   * The entity manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public static function defaultStorageSettings() {
    return [
      'default_image' => [
        'uuid' => NULL,
        'alt' => '',
        'title' => '',
      ],
    ] + parent::defaultStorageSettings();
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultFieldSettings() {
    $settings = [
      'file_extensions' => 'svg',
      'alt_field' => 1,
      'alt_field_required' => 1,
      'title_field' => 0,
      'title_field_required' => 0,
      'default_image' => [
        'uuid' => NULL,
        'alt' => '',
        'title' => '',
      ],
    ] + parent::defaultFieldSettings();

    unset($settings['description_field']);
    return $settings;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return [
      'columns' => [
        'target_id' => [
          'description' => 'The ID of the file entity.',
          'type' => 'int',
          'unsigned' => TRUE,
        ],
        'alt' => [
          'description' => "Alternative image text, for the image's 'alt' attribute.",
          'type' => 'varchar',
          'length' => 512,
        ],
        'title' => [
          'description' => "Image title text, for the image's 'title' attribute.",
          'type' => 'varchar',
          'length' => 1024,
        ],
      ],
      'indexes' => [
        'target_id' => ['target_id'],
      ],
      'foreign keys' => [
        'target_id' => [
          'table' => 'file_managed',
          'columns' => ['target_id' => 'fid'],
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties = parent::propertyDefinitions($field_definition);

    unset($properties['display']);
    unset($properties['description']);

    $properties['alt'] = DataDefinition::create('string')
      ->setLabel(t('Alternative text'))
      ->setDescription(t("Alternative image text, for the image's 'alt' attribute."));

    $properties['title'] = DataDefinition::create('string')
      ->setLabel(t('Title'))
      ->setDescription(t("Image title text, for the image's 'title' attribute."));

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public function storageSettingsForm(array &$form, FormStateInterface $form_state, $has_data) {
    $element = [];

    // We need the field-level 'default_image' setting, and $this->getSettings()
    // will only provide the instance-level one, so we need to explicitly fetch
    // the field.
    $settings = $this->getFieldDefinition()->getFieldStorageDefinition()->getSettings();

    $scheme_options = \Drupal::service('stream_wrapper_manager')->getNames(StreamWrapperInterface::WRITE_VISIBLE);
    $element['uri_scheme'] = [
      '#type' => 'radios',
      '#title' => t('Upload destination'),
      '#options' => $scheme_options,
      '#default_value' => $settings['uri_scheme'],
      '#description' => t('Select where the final files should be stored. Private file storage has significantly more overhead than public files, but allows restricted access to files within this field.'),
    ];

    // Add default_image element.
    static::defaultImageForm($element, $settings);
    $element['default_image']['#description'] = t('If no image is uploaded, this image will be shown on display.');

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    // Get base form from FileItem.
    $element = parent::fieldSettingsForm($form, $form_state);

    $settings = $this->getSettings();
    // Remove the description option.
    unset($element['description_field']);
    $element['file_extensions']['#disabled'] = TRUE;
    // Add title and alt configuration options.
    $element['alt_field'] = [
      '#type' => 'checkbox',
      '#title' => t('Enable <em>Alt</em> field'),
      '#default_value' => $settings['alt_field'],
      '#description' => t('The alt attribute may be used by search engines, screen readers, and when the image cannot be loaded. Enabling this field is recommended.'),
      '#weight' => 9,
    ];
    $element['alt_field_required'] = [
      '#type' => 'checkbox',
      '#title' => t('<em>Alt</em> field required'),
      '#default_value' => $settings['alt_field_required'],
      '#description' => t('Making this field required is recommended.'),
      '#weight' => 10,
      '#states' => [
        'visible' => [
          ':input[name="settings[alt_field]"]' => ['checked' => TRUE],
        ],
      ],
    ];
    $element['title_field'] = [
      '#type' => 'checkbox',
      '#title' => t('Enable <em>Title</em> field'),
      '#default_value' => $settings['title_field'],
      '#description' => t('The title attribute is used as a tooltip when the mouse hovers over the image. Enabling this field is not recommended as it can cause problems with screen readers.'),
      '#weight' => 11,
    ];
    $element['title_field_required'] = [
      '#type' => 'checkbox',
      '#title' => t('<em>Title</em> field required'),
      '#default_value' => $settings['title_field_required'],
      '#weight' => 12,
      '#states' => [
        'visible' => [
          ':input[name="settings[title_field]"]' => ['checked' => TRUE],
        ],
      ],
    ];

    // Add default_image element.
    static::defaultImageForm($element, $settings);
    $element['default_image']['#description'] = t("If no image is uploaded, this image will be shown on display and will override the field's default image.");
    return $element;
  }

  /**
   * Builds the default_image details element.
   *
   * @param array $element
   *   The form associative array passed by reference.
   * @param array $settings
   *   The field settings array.
   */
  protected function defaultImageForm(array &$element, array $settings) {
    $element['default_image'] = [
      '#type' => 'details',
      '#title' => t('Default image'),
      '#open' => TRUE,
    ];
    // Convert the stored UUID to a FID.
    $fids = [];
    $uuid = $settings['default_image']['uuid'];
    if ($uuid && ($file = $this->getEntityTypeManager()->getStorage('file')->loadByProperties(['uuid' => $uuid]))) {
      $file = reset($file);
      $fids[0] = $file->id();
    }
    $upload_validators = $this->getUploadValidators();
    $upload_validators['svg_image_field_validate_mime_type'] = [];
    $element['default_image']['uuid'] = [
      '#type' => 'managed_file',
      '#title' => t('Image'),
      '#description' => t('Image to be shown if no image is uploaded.'),
      '#default_value' => $fids,
      '#upload_location' => $settings['uri_scheme'] . '://default_images/',
      '#element_validate' => [
        '\Drupal\file\Element\ManagedFile::validateManagedFile',
            [get_class($this), 'validateDefaultImageForm'],
      ],
      '#upload_validators' => $upload_validators,
    ];
    $element['default_image']['alt'] = [
      '#type' => 'textfield',
      '#title' => t('Alternative text'),
      '#description' => t('This text will be used by screen readers, search engines, and when the image cannot be loaded.'),
      '#default_value' => $settings['default_image']['alt'],
      '#maxlength' => 512,
    ];
    $element['default_image']['title'] = [
      '#type' => 'textfield',
      '#title' => t('Title'),
      '#description' => t('The title attribute is used as a tooltip when the mouse hovers over the image.'),
      '#default_value' => $settings['default_image']['title'],
      '#maxlength' => 1024,
    ];
  }

  /**
   * Validates the managed_file element for the default Image form.
   *
   * This function ensures the fid is a scalar value and not an array. It is
   * assigned as a #element_validate callback in
   * \Drupal\image\Plugin\Field\FieldType\ImageItem::defaultImageForm().
   *
   * @param array $element
   *   The form element to process.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public static function validateDefaultImageForm(array &$element, FormStateInterface $form_state) {
    // Consolidate the array value of this field to a single FID as #extended
    // for default image is not TRUE and this is a single value.
    if (isset($element['fids']['#value'][0])) {
      $value = $element['fids']['#value'][0];
      // Convert the file ID to a uuid.
      if ($file = \Drupal::entityTypeManager()->getStorage('file')->load($value)) {
        $value = $file->uuid();
      }
    }
    else {
      $value = '';
    }
    $form_state->setValueForElement($element, $value);
  }

  /**
   * {@inheritdoc}
   */
  public function isDisplayed() {
    // Image items do not have per-item visibility settings.
    return TRUE;
  }

  /**
   * Gets the entity manager.
   *
   * @return \Drupal\Core\Entity\EntityTypeManagerInterface
   *   The entity manager service.
   */
  protected function getEntityTypeManager() {
    if (!isset($this->entityTypeManager)) {
      $this->entityTypeManager = \Drupal::entityTypeManager();
    }
    return $this->entityTypeManager;
  }

}
