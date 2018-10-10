<?php

namespace Drupal\htm_custom_oska\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for Oska indicator entity edit forms.
 *
 * @ingroup htm_custom_oska
 */
class OskaIndicatorEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaIndicatorEntity */
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
        drupal_set_message($this->t('Created the %label Oska indicator entity.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        drupal_set_message($this->t('Saved the %label Oska indicator entity.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.oska_indicator_entity.canonical', ['oska_indicator_entity' => $entity->id()]);
  }

}
