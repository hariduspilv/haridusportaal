<?php

namespace Drupal\key\Form;

use Drupal\Core\Entity\EntityDeleteForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\key\Plugin\KeyPluginDeleteFormInterface;

/**
 * Builds the form to delete a Key.
 */
class KeyConfigOverrideDeleteForm extends EntityDeleteForm {
  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete the override %name?', ['%name' => $this->entity->label()]);
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('entity.key_config_override.collection');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->entity->delete();
    drupal_set_message($this->t('The override %name has been deleted.', ['%name' => $this->entity->label()]));

    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
