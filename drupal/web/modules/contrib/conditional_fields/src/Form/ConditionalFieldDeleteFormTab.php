<?php

namespace Drupal\conditional_fields\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Class ConditionalFieldDeleteFormTab.
 *
 * @package Drupal\conditional_fields\Form
 */
class ConditionalFieldDeleteFormTab extends ConditionalFieldDeleteForm {

  protected $bundle;

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return Url::fromRoute('conditional_fields.tab', [
      'node_type' => $this->bundle,
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'conditional_field_delete_form_tab';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $entity_type = NULL, $bundle = NULL, $field_name = NULL, $uuid = NULL) {
    $this->bundle = $bundle;
    return parent::buildForm($form, $form_state, $entity_type, $bundle, $field_name, $uuid);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
