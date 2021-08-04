<?php

namespace Drupal\htm_custom_oska\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for Oska file entity edit forms.
 *
 * @ingroup htm_custom_oska
 */
class OskaFileEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaFileEntity */
    $form = parent::buildForm($form, $form_state);

    $entity = $this->entity;

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = $this->entity;

    $status = parent::save($form, $form_state);

    switch ($status) {
      case SAVED_NEW:
        \Drupal::messenger()->addMessage($this->t('Created the %label Oska file entity.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        \Drupal::messenger()->addMessage($this->t('Saved the %label Oska file entity.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.oska_file_entity.canonical', ['oska_file_entity' => $entity->id()]);
  }

}
