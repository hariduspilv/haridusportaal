<?php

namespace Drupal\htm_custom_event_registration\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\node\Entity\Node;
use Drupal\user\UserInterface;

/**
 * Defines the Event registration entity.
 *
 * @ingroup htm_custom_event_registration
 *
 * @ContentEntityType(
 *   id = "event_reg_entity",
 *   label = @Translation("Event registration"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\htm_custom_event_registration\EventRegEntityListBuilder",
 *     "views_data" = "Drupal\htm_custom_event_registration\Entity\EventRegEntityViewsData",
 *     "translation" = "Drupal\htm_custom_event_registration\EventRegEntityTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\htm_custom_event_registration\Form\EventRegEntityForm",
 *       "add" = "Drupal\htm_custom_event_registration\Form\EventRegEntityForm",
 *       "edit" = "Drupal\htm_custom_event_registration\Form\EventRegEntityForm",
 *       "delete" = "Drupal\htm_custom_event_registration\Form\EventRegEntityDeleteForm",
 *     },
 *     "access" = "Drupal\htm_custom_event_registration\EventRegEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\htm_custom_event_registration\EventRegEntityHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "event_reg_entity",
 *   data_table = "event_reg_entity_field_data",
 *   translatable = TRUE,
 *   admin_permission = "administer event registration entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "name",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status"
 *   },
 *   links = {
 *     "canonical" = "/admin/structure/event_reg_entity/{event_reg_entity}",
 *     "add-form" = "/admin/structure/event_reg_entity/add",
 *     "edit-form" = "/admin/structure/event_reg_entity/{event_reg_entity}/edit",
 *     "delete-form" = "/admin/structure/event_reg_entity/{event_reg_entity}/delete",
 *     "collection" = "/admin/structure/event_reg_entity",
 *   },
 *   field_ui_base_route = "event_reg_entity.settings"
 * )
 */
class EventRegEntity extends ContentEntityBase implements EventRegEntityInterface {

  use EntityChangedTrait;

  /**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage_controller, array &$values) {
    parent::preCreate($storage_controller, $values);
    $values += [
      'user_id' => \Drupal::currentUser()->id(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return $this->get('name')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setName($name) {
    $this->set('name', $name);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getCreatedTime() {
    return $this->get('created')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setCreatedTime($timestamp) {
    $this->set('created', $timestamp);
    return $this;
  }

	/**
	 * @inheritDoc
	 */
	public function getChangedTime()
	{
		return $this->get('changed')->value;
	}

	/**
	 * @inheritDoc
	 */
	public function setChangedTime($timestamp)
	{
		$this->set('changed', $timestamp);
		return $this;
	}


	/**
   * {@inheritdoc}
   */
  public function getOwner() {
    return $this->get('user_id')->entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwnerId() {
    return $this->get('user_id')->target_id;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwnerId($uid) {
    $this->set('user_id', $uid);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwner(UserInterface $account) {
    $this->set('user_id', $account->id());
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function isPublished() {
    return (bool) $this->getEntityKey('status');
  }

  /**
   * {@inheritdoc}
   */
  public function setPublished($published) {
    $this->set('status', $published ? TRUE : FALSE);
    return $this;
  }

	/**
	 * @inheritDoc
	 */
	public function getTranslatedFieldLabel($name, $langcode){
		$label = $this->{$name}->getFieldDefinition()->getFieldStorageDefinition()->getLabel()->getUntranslatedString();
		return t($label, [], ['langcode' => $langcode]);
	}

	public function getReferenceEventDates($format = NULL){
		/* @var Node $event */
		$event = $this->get('event_reference')->entity;

		$first_event_date = strtotime($event->get('field_event_main_date')->value);
		$last_event_date = null;
		if($ref = $event->get('field_event_date')->referencedEntities()){
			foreach($ref as $value){
				$unix_event_date = strtotime($value->field_event_date->value);
				$last_event_date = ($unix_event_date >= $last_event_date)
					? $unix_event_date
					: $last_event_date;
			}
		}

		$d = NULL;

		if($format){
			if($last_event_date){
				$d = implode(' - ', [date($format, $first_event_date), date($format, $last_event_date)]);
			}else{
				$d = date($format, $first_event_date);
			}
		}else{
			if($last_event_date){
				$d = ['start' => $first_event_date, 'last' => $last_event_date];
			}else{
				$d = ['start' => $first_event_date];
			}
		}
		return $d;

	}


	/**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['user_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Event registration entity.'))
      ->setSetting('target_type', 'user')
      ->setSetting('handler', 'default')
      ->setTranslatable(TRUE)
			->setDisplayOptions('view', [
				'label' => 'hidden',
				'type' => 'author',
				'weight' => 0,
			])
			->setDisplayOptions('form', [
				'type' => 'entity_reference_autocomplete',
				'weight' => 5,
				'settings' => [
					'match_operator' => 'CONTAINS',
					'size' => '60',
					'autocomplete_type' => 'tags',
					'placeholder' => '',
				],
			]);

    $fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Name'))
      ->setDescription(t('The name of the Event registration entity.'))
      ->setSettings([
        'max_length' => 50,
        'text_processing' => 0,
      ])
      ->setDefaultValue('')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => -4,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -4,
      ])
      ->setRequired(TRUE);

    $fields['participant_first_name'] = BaseFieldDefinition::create('string')
			->setLabel(t('Participant First name'))
			->setTranslatable(TRUE)
			->setSettings([
					'max_length' => 50,
					'text_processing' => 0,
			])
			->setDefaultValue('')
			->setDisplayOptions('view', [
					'label' => 'above',
					'type' => 'string',
					'weight' => -4,
			])
			->setDisplayOptions('form', [
				'type' => 'string_textfield',
				'weight' => -4,
			])
			->setRequired(TRUE);

    $fields['participant_last_name'] = BaseFieldDefinition::create('string')
			->setLabel(t('Participant Last name'))
			->setTranslatable(TRUE)
			->setSettings([
					'max_length' => 50,
					'text_processing' => 0,
			])
			->setDefaultValue('')
			->setDisplayOptions('view', [
					'label' => 'above',
					'type' => 'string',
					'weight' => -4,
			])
			->setDisplayOptions('form', [
					'type' => 'string_textfield',
					'weight' => -4,
				])
			->setRequired(TRUE);

    $fields['participant_organization'] = BaseFieldDefinition::create('string')
			->setLabel(t('Participant organization'))
			->setTranslatable(TRUE)
			->setSettings([
					'max_length' => 50,
					'text_processing' => 0,
			])
			->setDefaultValue('')
			->setDisplayOptions('view', [
					'label' => 'above',
					'type' => 'string',
					'weight' => -4,
			])
			->setDisplayOptions('form', [
					'type' => 'string_textfield',
					'weight' => -4,
				])
			->setRequired(FALSE);

    $fields['participant_email'] = BaseFieldDefinition::create('email')
			->setLabel(t('Participant email'))
			->setTranslatable(TRUE)
			->setDisplayOptions('view', [
				'label' => 'above',
				'type' => 'string',
				'weight' => -3
			])
			->setDisplayOptions('form', [
					'type' => 'string_textfield',
					'weight' => -4,
				])
			->setRequired(TRUE);

		$fields['participant_phone'] = BaseFieldDefinition::create('telephone')
			->setLabel(t('Participant telephone'))
			->setTranslatable(TRUE)
			->setDisplayOptions('view', [
				'label' => 'above',
				'type' => 'string',
				'weight' => -3
			])
			->setDisplayOptions('form', [
				'type' => 'string_textfield',
				'weight' => -4,
			]);

		$fields['participant_idcode'] = BaseFieldDefinition::create('string')
			->setLabel(t('IDcode'))
			->setTranslatable(TRUE)
			->setDisplayOptions('form', [
				'type' => 'string_textarea',
				'settings' => [
						'cols' => '6',
				],
				'weight' => -4,
			]);

		$fields['language'] = BaseFieldDefinition::create('language')
			->setLabel(t('Language'))
			->setTranslatable(TRUE)
			->setDisplayOptions('form', [
				'type' => 'language_select',
				'weight' => 0,
			]);

		$fields['participant_comment'] = BaseFieldDefinition::create('string_long')
			->setLabel(t('Comment'))
			->setTranslatable(TRUE)
			->setDisplayOptions('form', [
				'type' => 'string_textarea',
				'settings' => [
						'cols' => '6',
				],
				'weight' => -4,
			]);

		$fields['event_reference'] = BaseFieldDefinition::create('entity_reference')
			->setLabel(t('Event'))
			->setDescription(t('The user ID of author of the Event registration entity.'))
			->setSetting('target_type', 'node')
			->setSetting('handler_settings',['target_bundles'=>['event'=>'event']] )
			->setSetting('handler', 'default')
			->setTranslatable(TRUE)
			->setDisplayOptions('form', [
				'type' => 'entity_reference_autocomplete',
				'weight' => 1,
				'settings' => [
					'match_operator' => 'CONTAINS',
					'size' => '60',
					'autocomplete_type' => '',
					'placeholder' => '',
				],
			])
			->setRequired(TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Registration date'))
      ->setDescription(t('The time that the entity was created.'))
			->setDisplayOptions('form', [
				'type' => 'readonly_field_widget',
				'weight' => 10,
			]);

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('changed'))
      ->setDescription(t('The time that the entity was last updated.'));

		$fields['status'] = BaseFieldDefinition::create('boolean')
			->setLabel(t('Publishing status'))
			->setDescription(t('A boolean indicating whether the event is published.'))
			->setDefaultValue(TRUE);

    return $fields;
  }

}
