<?php

namespace Drupal\htm_custom_oska\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for Oska filling bar entity edit forms.
 *
 * @ingroup htm_custom_oska
 */
class OskaFillingBarEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaFillingBarEntity */
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
        drupal_set_message($this->t('Created the %label Oska filling bar entity.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        drupal_set_message($this->t('Saved the %label Oska filling bar entity.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.oska_filling_bar_entity.canonical', ['oska_filling_bar_entity' => $entity->id()]);
  }

}
