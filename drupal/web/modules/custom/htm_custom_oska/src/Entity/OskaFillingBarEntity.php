<?php

namespace Drupal\htm_custom_oska\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
 * Defines the Oska filling bar entity entity.
 *
 * @ingroup htm_custom_oska
 *
 * @ContentEntityType(
 *   id = "oska_filling_bar_entity",
 *   label = @Translation("Oska filling bar entity"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\htm_custom_oska\OskaFillingBarEntityListBuilder",
 *     "views_data" = "Drupal\htm_custom_oska\Entity\OskaFillingBarEntityViewsData",
 *
 *     "form" = {
 *       "default" = "Drupal\htm_custom_oska\Form\OskaFillingBarEntityForm",
 *       "add" = "Drupal\htm_custom_oska\Form\OskaFillingBarEntityForm",
 *       "edit" = "Drupal\htm_custom_oska\Form\OskaFillingBarEntityForm",
 *       "delete" = "Drupal\htm_custom_oska\Form\OskaFillingBarEntityDeleteForm",
 *     },
 *     "access" = "Drupal\htm_custom_oska\OskaFillingBarEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\htm_custom_oska\OskaFillingBarEntityHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "oska_filling_bar_entity",
 *   admin_permission = "administer oska filling bar entity entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "name",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/admin/structure/oska_filling_bar_entity/{oska_filling_bar_entity}",
 *     "add-form" = "/admin/structure/oska_filling_bar_entity/add",
 *     "edit-form" = "/admin/structure/oska_filling_bar_entity/{oska_filling_bar_entity}/edit",
 *     "delete-form" = "/admin/structure/oska_filling_bar_entity/{oska_filling_bar_entity}/delete",
 *     "collection" = "/admin/structure/oska_filling_bar_entity",
 *   },
 *   field_ui_base_route = "oska_filling_bar_entity.settings"
 * )
 */
class OskaFillingBarEntity extends ContentEntityBase implements OskaFillingBarEntityInterface {

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
      ->setDescription(t('The user ID of author of the Oska filling bar entity entity.'))
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
      ->setDescription(t('The name of the Oska filling bar entity entity.'))
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

      $fields['oska_main_profession'] = BaseFieldDefinition::create('entity_reference')
          ->setLabel(t('Oska main profession'))
          ->setRevisionable(TRUE)
          ->setSetting('target_type', 'node')
          ->setSetting('handler', 'default')
          ->setSetting('handler_settings',
              array(
                  'target_bundles' => array(
                      'oska_main_profession_page' => 'oska_main_profession_page'
                  )))
          ->setTranslatable(TRUE)
          ->setDisplayOptions('view', array(
              'label' => 'above',
              'type' => 'entity_reference',
          ))
          ->setDisplayOptions('form', array(
              'type' => 'entity_reference_autocomplete_tags',
              'settings' => array(
                  'match_operator' => 'CONTAINS',
                  'size' => '100',
                  'autocomplete_type' => 'tags',
                  'placeholder' => '',
              ),
          ))
          ->setDisplayConfigurable('form', TRUE)
          ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED);

      $fields['value'] = BaseFieldDefinition::create('string')
          ->setLabel(t('Value'))
          ->setSetting('graph_value', TRUE)
          ->setDefaultValue('')
          ->setDisplayOptions('view', [
              'label' => 'above',
              'type' => 'float',
          ])
          ->setDisplayOptions('form', [
              'type' => 'float',
          ])
          ->setDisplayConfigurable('form', TRUE)
          ->setDisplayConfigurable('view', TRUE);

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Oska filling bar entity is published.'))
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
