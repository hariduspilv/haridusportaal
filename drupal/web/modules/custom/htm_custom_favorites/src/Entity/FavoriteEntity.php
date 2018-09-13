<?php

namespace Drupal\htm_custom_favorites\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
 * Defines the Favorite entity.
 *
 * @ingroup htm_custom_favorites
 *
 * @ContentEntityType(
 *   id = "favorite_entity",
 *   label = @Translation("Favorite"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\htm_custom_favorites\FavoriteEntityListBuilder",
 *     "views_data" = "Drupal\htm_custom_favorites\Entity\FavoriteEntityViewsData",
 *     "translation" = "Drupal\htm_custom_favorites\FavoriteEntityTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\htm_custom_favorites\Form\FavoriteEntityForm",
 *       "add" = "Drupal\htm_custom_favorites\Form\FavoriteEntityForm",
 *       "edit" = "Drupal\htm_custom_favorites\Form\FavoriteEntityForm",
 *       "delete" = "Drupal\htm_custom_favorites\Form\FavoriteEntityDeleteForm",
 *     },
 *     "access" = "Drupal\htm_custom_favorites\FavoriteEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\htm_custom_favorites\FavoriteEntityHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "favorite_entity",
 *   data_table = "favorite_entity_field_data",
 *   translatable = TRUE,
 *   admin_permission = "administer favorite entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "user_idcode",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/admin/structure/favorite_entity/{favorite_entity}",
 *     "add-form" = "/admin/structure/favorite_entity/add",
 *     "edit-form" = "/admin/structure/favorite_entity/{favorite_entity}/edit",
 *     "delete-form" = "/admin/structure/favorite_entity/{favorite_entity}/delete",
 *     "collection" = "/admin/structure/favorite_entity",
 *   },
 *   field_ui_base_route = "favorite_entity.settings"
 * )
 */
class FavoriteEntity extends ContentEntityBase implements FavoriteEntityInterface {

  use EntityChangedTrait;

	public function __construct(array $values, $entity_type, $bundle = FALSE, array $translations = [])
	{
		parent::__construct($values, $entity_type, $bundle, $translations);
	}


	/**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage_controller, array &$values) {
    parent::preCreate($storage_controller, $values);
    $values += [
      'user_id' => \Drupal::currentUser()->id(),
    ];
  }

	public function preSave(EntityStorageInterface $storage)
	{
		foreach($this->languageManager()->getLanguages() as $langcode => $data){
			if(!$this->hasTranslation($langcode)){
				$this->addTranslation($langcode, ['user_idcode'=> $this->get('user_idcode')->value]);
			}
		}
		#$this->save();
		parent::preSave($storage);
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
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['user_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Favorite entity.'))
      ->setRevisionable(TRUE)
      ->setSetting('target_type', 'user')
      ->setSetting('handler', 'default')
     # ->setTranslatable(TRUE)
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
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

		$fields['user_idcode'] = BaseFieldDefinition::create('string')
				->setLabel(t('IDcode'))
				->setRequired(TRUE)
				->setTranslatable(TRUE)
				->setSettings(array(
						'max_length'  => 12
				))
				->setDisplayOptions('form', [
						'type' => 'string_textfield',
						'weight' => -4,
						'settings' => [
								'size' => '20',
						],
				]);
		$fields['favorites_new'] = BaseFieldDefinition::create('favorite_field_type')
			->setLabel('Favorite')
			->setCardinality(10)
			#->setTranslatable(TRUE)
			->setDisplayOptions('form',[
					'type' => 'favorite_widget_type',
			]);

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Favorite is published.'))
      ->setDefaultValue(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'weight' => -3,
      ]);

		/*$fields['language'] = BaseFieldDefinition::create('language')
			->setLabel(t('Language'))
			#->setTranslatable(TRUE)
			#->setDefaultValue('en')
			->setDisplayOptions('form', [
					'type' => 'language_select',
			]);*/
		/*$fields['langcode'] = BaseFieldDefinition::create('language')
				->setLabel(t('Language code'))
				->setDescription(t('The language code of Contact entity.'));*/

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'));

    return $fields;
  }

}
