<?php

namespace Drupal\image_style_warmer\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for creating and editing Image Style Warmer settings.
 */
class ImageStyleWarmerSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'image_style_warmer_settings_form';
  }
  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['image_style_warmer.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('image_style_warmer.settings');
    $imageStyleOptions = image_style_options(FALSE);

    $uploadImageStyles = $config->get('upload_image_styles');
    $form['image_style_warmer_upload_image_styles'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Upload image styles'),
      '#description' => $this->t('Select image styles which will be created on image upload.'),
      '#options' => $imageStyleOptions,
      '#default_value' => !empty($uploadImageStyles) ? $uploadImageStyles : [],
      '#size' => 10,
    ];

    $queueImageStyles = $config->get('queue_image_styles');
    $form['image_style_warmer_queue_image_styles'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Queue image styles'),
      '#description' => $this->t('Select image styles which will be created via queue worker.'),
      '#options' => $imageStyleOptions,
      '#default_value' => !empty($queueImageStyles) ? $queueImageStyles : [],
      '#size' => 10,
    ];

    // Add CSS for better form layout.
    $form['#attached']['library'][] = 'image_style_warmer/image_style_warmer.admin';

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
    $form_state->setValue('image_style_warmer_upload_image_styles', array_filter($form_state->getValue('image_style_warmer_upload_image_styles')));
    $form_state->setValue('image_style_warmer_queue_image_styles', array_filter($form_state->getValue('image_style_warmer_queue_image_styles')));
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('image_style_warmer.settings');
    foreach ($form_state->getValues() as $key => $value) {
      if (strpos($key, 'image_style_warmer_') !== FALSE) {
        $config->set(str_replace('image_style_warmer_', '', $key), $value);
      }
    }
    $config->save();
    parent::submitForm($form, $form_state);
  }

}
