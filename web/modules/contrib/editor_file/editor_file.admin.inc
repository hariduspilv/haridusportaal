<?php

/**
 * @file
 * Administration functions for editor_file.module.
 */

use Drupal\Core\StreamWrapper\StreamWrapperInterface;
use Drupal\editor\Entity\Editor;
use Drupal\Component\Utility\Environment;

/**
 * Subform constructor to configure the text editor's file upload settings.
 *
 * @param \Drupal\editor\Entity\Editor $editor
 *   The text editor entity that is being edited.
 *
 * @return array
 *   The file upload settings form.
 *
 * @see \Drupal\editor_file\Plugin\CKEditorPlugin\DrupalFile
 */
function editor_file_upload_settings_form(Editor $editor) {
  // Defaults.
  $file_upload = $editor->getThirdPartySettings('editor_file');
  $file_upload += [
    'status' => TRUE,
    'scheme' => \Drupal::config('system.file')->get('default_scheme'),
    'directory' => 'inline-files',
    'extensions' => 'txt',
    'max_size' => '',
  ];

  $form['status'] = [
    '#type' => 'checkbox',
    '#title' => t('Enable file uploads'),
    '#default_value' => $file_upload['status'],
    '#attributes' => [
      'data-editor-file-upload' => 'status',
    ],
  ];
  $show_if_file_uploads_enabled = [
    'visible' => [
      ':input[data-editor-file-upload="status"]' => ['checked' => TRUE],
    ],
  ];

  // Any visible, writable wrapper can potentially be used for uploads,
  // including a remote file system that integrates with a CDN.
  $options = \Drupal::service('stream_wrapper_manager')->getDescriptions(StreamWrapperInterface::WRITE_VISIBLE);
  if (!empty($options)) {
    $form['scheme'] = [
      '#type' => 'radios',
      '#title' => t('File storage'),
      '#default_value' => $file_upload['scheme'],
      '#options' => $options,
      '#states' => $show_if_file_uploads_enabled,
      '#access' => count($options) > 1,
    ];
  }
  // Set data- attributes with human-readable names for all possible stream
  // wrappers, so that drupal.ckeditor.drupalfile.admin's summary rendering
  // can use that.
  foreach (\Drupal::service('stream_wrapper_manager')->getNames(StreamWrapperInterface::WRITE_VISIBLE) as $scheme => $name) {
    $form['scheme'][$scheme]['#attributes']['data-label'] = t('Storage: @name', ['@name' => $name]);
  }

  $form['directory'] = [
    '#type' => 'textfield',
    '#default_value' => $file_upload['directory'],
    '#title' => t('Upload directory'),
    '#description' => t("A directory relative to Drupal's files directory where uploaded files will be stored."),
    '#states' => $show_if_file_uploads_enabled,
  ];

  $extensions = str_replace(' ', ', ', $file_upload['extensions']);
  $form['extensions'] = [
    '#type' => 'textfield',
    '#title' => t('Allowed file extensions'),
    '#default_value' => $extensions,
    '#description' => t('Separate extensions with a space or comma and do not include the leading dot.'),
    '#element_validate' => [['\Drupal\file\Plugin\Field\FieldType\FileItem', 'validateExtensions']],
    '#maxlength' => 256,
    // By making this field required, we prevent a potential security issue
    // that would allow files of any type to be uploaded.
    '#required' => TRUE,
    '#states' => $show_if_file_uploads_enabled,
  ];

  $default_max_size = format_size(Environment::getUploadMaxSize());
  $form['max_size'] = [
    '#type' => 'textfield',
    '#default_value' => $file_upload['max_size'],
    '#title' => t('Maximum file size'),
    '#description' => t('If this is left empty, then the file size will be limited by the PHP maximum upload size of @size.', ['@size' => $default_max_size]),
    '#maxlength' => 20,
    '#size' => 10,
    '#placeholder' => $default_max_size,
    '#states' => $show_if_file_uploads_enabled,
  ];

  return $form;
}
