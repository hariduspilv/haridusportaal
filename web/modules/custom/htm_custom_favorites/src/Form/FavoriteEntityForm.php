<?php

namespace Drupal\htm_custom_favorites\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * Form controller for Favorite entity edit forms.
 *
 * @ingroup htm_custom_favorites
 */
class FavoriteEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_favorites\Entity\FavoriteEntity */
    $form = parent::buildForm($form, $form_state);

    $entity = $this->entity;

	/*	$form['favorites'] = [
			'#type' => 'fieldset',
			'#title' => $this->t('Social Media Configuration'),
			'#collapsible' => TRUE,
			'#collapsed' => FALSE,
		];

		$field = BaseFieldDefinition::create('entity_reference')
			->setLabel(t('Type'))
			->setDescription(t('The Paragraphs type.'))
			->setSetting('target_type', 'paragraph')
			->setSetting('handler', 'default')
			->setSetting('handler_settings',['target_bundles'=>
					['additional_section'=>'additional_section']
			]);*/

		//$form['favorites'] = $field;

		/*$form['social_media_fieldset'] = [
			'#type' => 'fieldset',
			'#title' => $this->t('Social Media Configuration'),
			'#collapsible' => TRUE,
			'#collapsed' => FALSE,
		];*/
		//$form['social_media_fieldset'] = $form['participant_idcode'];

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
        drupal_set_message($this->t('Created the %label Favorite entity.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        drupal_set_message($this->t('Saved the %label Favorite entity.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.favorite_entity.canonical', ['favorite_entity' => $entity->id()]);
  }

}
