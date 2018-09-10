<?php

namespace Drupal\htm_custom_favorites\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
 * Defines the Favorite entity entity.
 *
 * @ingroup htm_custom_favorites
 *
 * @ContentEntityType(
 *   id = "favorite_entity",
 *   label = @Translation("Favorite entity"),
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
 *   admin_permission = "administer favorite entity entities",
 *   entity_keys = {
 *     "id" = "id",
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
      ->setDescription(t('The user ID of author of the Favorite entity entity.'))
      ->setRevisionable(TRUE)
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

		$fields['favorites'] = BaseFieldDefinition::create('entity_reference_revisions')
			->setLabel(t('Type'))
			->setDescription(t('The Paragraphs type.'))
			->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
			->setSetting('target_type', 'paragraph')
			->setSetting('handler', 'default')
			->setSetting('handler_settings',
					['target_bundles'=> ['favorite_item'=>'favorite_item']
			])
			->setDisplayOptions('form', [
				'type' => 'entity_reference_paragraphs'
			]);


    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Favorite entity is published.'))
      ->setDefaultValue(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'weight' => -3,
      ]);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'));

    return $fields;
  }

}
