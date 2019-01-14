<?php

namespace Drupal\htm_custom_event_registration\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for Event registration edit forms.
 *
 * @ingroup htm_custom_event_registration
 */
class EventRegEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_event_registration\Entity\EventRegEntity */
    $form = parent::buildForm($form, $form_state);

    $entity = $this->entity;

		$form['name_group'] = [
			'#type' => 'fieldset',
			'#title' => $this->t('Participant information'),
			'#weight' => 2,
		];

		$form['name_group']['participant_idcode'] = $form['participant_idcode'];
		unset($form['participant_idcode']);

		$form['name_group']['participant_first_name'] = $form['participant_first_name'];
		unset($form['participant_first_name']);

		$form['name_group']['participant_last_name'] = $form['participant_last_name'];
		unset($form['participant_last_name']);

		$form['name_group']['participant_organization'] = $form['participant_organization'];
		unset($form['participant_organization']);

		$form['name_group']['participant_email'] = $form['participant_email'];
		unset($form['participant_email']);

		$form['name_group']['participant_phone'] = $form['participant_phone'];
		unset($form['participant_phone']);

		$form['name_group']['participant_comment'] = $form['participant_comment'];
		unset($form['participant_comment']);

		$form['additional'] = [
			'#type' => 'fieldset',
			'#title' => $this->t('Additional information'),
			'#weight' => 3,
		];

		$form['additional']['created'] = $form['created'];
		unset($form['created']);

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
        drupal_set_message($this->t('Created the %label Event registration.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        drupal_set_message($this->t('Saved the %label Event registration.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.event_reg_entity.canonical', ['event_reg_entity' => $entity->id()]);
  }

}
