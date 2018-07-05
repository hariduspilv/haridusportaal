<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
 * Defines the xJson entity entity.
 *
 * @ingroup htm_custom_xjson_services
 *
 * @ContentEntityType(
 *   id = "x_json_entity",
 *   label = @Translation("xJson entity"),
 *   handlers = {
 *     "storage" = "Drupal\htm_custom_xjson_services\xJsonEntityStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\htm_custom_xjson_services\xJsonEntityListBuilder",
 *     "views_data" = "Drupal\htm_custom_xjson_services\Entity\xJsonEntityViewsData",
 *
 *     "form" = {
 *       "default" = "Drupal\htm_custom_xjson_services\Form\xJsonEntityForm",
 *       "add" = "Drupal\htm_custom_xjson_services\Form\xJsonEntityForm",
 *       "edit" = "Drupal\htm_custom_xjson_services\Form\xJsonEntityForm",
 *       "delete" = "Drupal\htm_custom_xjson_services\Form\xJsonEntityDeleteForm",
 *     },
 *     "access" = "Drupal\htm_custom_xjson_services\xJsonEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\htm_custom_xjson_services\xJsonEntityHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "x_json_entity",
 *   revision_table = "x_json_entity_revision",
 *   revision_data_table = "x_json_entity_field_revision",
 *   admin_permission = "administer xjson entity entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "label" = "name",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/admin/structure/x_json_entity/{x_json_entity}",
 *     "add-form" = "/admin/structure/x_json_entity/add",
 *     "edit-form" = "/admin/structure/x_json_entity/{x_json_entity}/edit",
 *     "delete-form" = "/admin/structure/x_json_entity/{x_json_entity}/delete",
 *     "version-history" = "/admin/structure/x_json_entity/{x_json_entity}/revisions",
 *     "revision" = "/admin/structure/x_json_entity/{x_json_entity}/revisions/{x_json_entity_revision}/view",
 *     "revision_revert" = "/admin/structure/x_json_entity/{x_json_entity}/revisions/{x_json_entity_revision}/revert",
 *     "revision_delete" = "/admin/structure/x_json_entity/{x_json_entity}/revisions/{x_json_entity_revision}/delete",
 *     "collection" = "/admin/structure/x_json_entity",
 *   },
 *   field_ui_base_route = "x_json_entity.settings"
 * )
 */
class xJsonEntity extends RevisionableContentEntityBase implements xJsonEntityInterface {

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
  protected function urlRouteParameters($rel) {
    $uri_route_parameters = parent::urlRouteParameters($rel);

    if ($rel === 'revision_revert' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }
    elseif ($rel === 'revision_delete' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }

    return $uri_route_parameters;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    parent::preSave($storage);

    foreach (array_keys($this->getTranslationLanguages()) as $langcode) {
      $translation = $this->getTranslation($langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!$translation->getOwner()) {
        $translation->setOwnerId(0);
      }
    }

    // If no revision author has been set explicitly, make the x_json_entity owner the
    // revision author.
    if (!$this->getRevisionUser()) {
      $this->setRevisionUserId($this->getOwnerId());
    }
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
      ->setDescription(t('The user ID of author of the xJson entity entity.'))
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

    $fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Name'))
      ->setDescription(t('The name of the xJson entity entity.'))
      ->setRevisionable(TRUE)
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
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setRequired(TRUE);

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the xJson entity is published.'))
      ->setRevisionable(TRUE)
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

		$fields['metatage'] = BaseFieldDefinition::create('jsonb')
				->setLabel(t('metatage'))
				->setDescription(t('metatage'))
				->setRevisionable(TRUE)
				->setDefaultValue('')
				->setDisplayOptions('form', [
						'type' => 'jsonb_textarea',
						'weight' => -4,
				]);


    return $fields;
  }

}
