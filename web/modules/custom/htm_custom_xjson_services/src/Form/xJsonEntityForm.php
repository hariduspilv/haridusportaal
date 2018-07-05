<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for xJson entity edit forms.
 *
 * @ingroup htm_custom_xjson_services
 */
class xJsonEntityForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    /* @var $entity \Drupal\htm_custom_xjson_services\Entity\xJsonEntity */
    $form = parent::buildForm($form, $form_state);



		if (!$this->entity->isNew()) {
      $form['new_revision'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Create new revision'),
        '#default_value' => FALSE,
        '#weight' => 10,
      ];
    }

    $form['test'] = [
			'#markup' => new FormattableMarkup('<div id="jsoneditor" style="width: 100%; height: 800px;"></div>', []),
			'#prefix' => '<div class="test">',
			'#suffix' => '</div>',
		];

		$form['validate'] = array(
			'#type' => 'button',
			'#value' => $this->t('validate'),
			'#attributes' => [
				'id' => 'getJSON'
			]
		);

		$form['#attached']['library'] = [
				'htm_custom_xjson_services/myform',
		];
		#dump($form);
		$form['#attached']['drupalSettings']['lotus_height'] = 'test';
		$form['tere'] = [
			'#type' => 'textfield',
			'#title' => 'test',
		];
		$array = [
				'test', 'tere2'
		];
		#dump(serialize(json_encode($array)));
		$entity = $this->entity;
		dump(json_decode('{"_id": 123456, "age": 32, "name": "Johnnn"}', TRUE));
		#dump($entity->get('metatage')->value);
		#dump($entity);

		return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = $this->entity;

    // Save as a new revision if requested to do so.
    if (!$form_state->isValueEmpty('new_revision') && $form_state->getValue('new_revision') != FALSE) {
      $entity->setNewRevision();

      // If a new revision is created, save the current user as revision author.
      $entity->setRevisionCreationTime(REQUEST_TIME);
      $entity->setRevisionUserId(\Drupal::currentUser()->id());
    }
    else {
      $entity->setNewRevision(FALSE);
    }

    $status = parent::save($form, $form_state);

    switch ($status) {
      case SAVED_NEW:
        drupal_set_message($this->t('Created the %label xJson entity.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        drupal_set_message($this->t('Saved the %label xJson entity.', [
          '%label' => $entity->label(),
        ]));
    }
    $form_state->setRedirect('entity.x_json_entity.canonical', ['x_json_entity' => $entity->id()]);
  }

}
