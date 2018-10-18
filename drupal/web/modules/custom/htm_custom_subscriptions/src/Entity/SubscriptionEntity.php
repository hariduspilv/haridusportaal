<?php

namespace Drupal\htm_custom_subscriptions\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
* Defines the Subscription entity entity.
*
* @ingroup htm_custom_subscriptions
*
* @ContentEntityType(
*   id = "subscription_entity",
*   label = @Translation("Subscription entity"),
*   handlers = {
*     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
*     "list_builder" = "Drupal\htm_custom_subscriptions\SubscriptionEntityListBuilder",
*     "views_data" = "Drupal\htm_custom_subscriptions\Entity\SubscriptionEntityViewsData",
*     "translation" = "Drupal\htm_custom_subscriptions\SubscriptionEntityTranslationHandler",
*
*     "form" = {
*       "default" = "Drupal\htm_custom_subscriptions\Form\SubscriptionEntityForm",
*       "add" = "Drupal\htm_custom_subscriptions\Form\SubscriptionEntityForm",
*       "edit" = "Drupal\htm_custom_subscriptions\Form\SubscriptionEntityForm",
*       "delete" = "Drupal\htm_custom_subscriptions\Form\SubscriptionEntityDeleteForm",
*     },
*     "access" = "Drupal\htm_custom_subscriptions\SubscriptionEntityAccessControlHandler",
*     "route_provider" = {
*       "html" = "Drupal\htm_custom_subscriptions\SubscriptionEntityHtmlRouteProvider",
*     },
*   },
*   base_table = "subscription_entity",
*   data_table = "subscription_entity_field_data",
*   translatable = TRUE,
*   admin_permission = "administer subscription entity entities",
*   entity_keys = {
*     "id" = "id",
*     "label" = "subscriber_email",
*     "uuid" = "uuid",
*     "uid" = "user_id",
*     "langcode" = "langcode",
*     "status" = "status",
*   },
*   links = {
*     "canonical" = "/admin/structure/subscription_entity/{subscription_entity}",
*     "add-form" = "/admin/structure/subscription_entity/add",
*     "edit-form" = "/admin/structure/subscription_entity/{subscription_entity}/edit",
*     "delete-form" = "/admin/structure/subscription_entity/{subscription_entity}/delete",
*     "collection" = "/admin/structure/subscription_entity",
*   },
*   field_ui_base_route = "subscription_entity.settings"
* )
*/
class SubscriptionEntity extends ContentEntityBase implements SubscriptionEntityInterface {

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
    ->setDescription(t('The user ID of author of the Subscription entity entity.'))
    ->setRevisionable(TRUE)
    ->setSetting('target_type', 'user')
    ->setSetting('handler', 'default')
    ->setTranslatable(TRUE)
    ->setDisplayOptions('view', [
      'label' => 'hidden',
      'type' => 'author',
    ])
    ->setDisplayOptions('form', [
      'type' => 'entity_reference_autocomplete',
      'settings' => [
        'match_operator' => 'CONTAINS',
        'size' => '60',
        'autocomplete_type' => 'tags',
        'placeholder' => '',
      ],
    ])
    ->setDisplayConfigurable('form', TRUE)
    ->setDisplayConfigurable('view', TRUE);

    $fields['subscriber_email'] = BaseFieldDefinition::create('email')
    ->setLabel(t('Email'))
    ->setDescription(t('Subscribers email.'))
    ->setRevisionable(TRUE)
    ->setSettings([
      'max_length' => 50,
      'text_processing' => 0,
    ])
    ->setDefaultValue('')
    ->setDisplayOptions('view', [
      'label' => 'above',
      'type' => 'email',
    ])
    ->setDisplayOptions('form', [
      'type' => 'string_textfield',
    ])
    ->setDisplayConfigurable('form', TRUE)
    ->setDisplayConfigurable('view', TRUE)
    ->setRequired(TRUE);

    $fields['language'] = BaseFieldDefinition::create('language')
    ->setLabel(t('Language'))
    ->setTranslatable(TRUE)
    ->setDisplayOptions('form', [
      'type' => 'language_select',
    ]);

    $fields['tag'] = BaseFieldDefinition::create('entity_reference')
    ->setLabel(t('Tags'))
    ->setDescription(t('Tags to subscribe to'))
    ->setRevisionable(TRUE)
    ->setSetting('target_type', 'taxonomy_term')
    ->setSetting('handler', 'default:taxonomy_term')
    ->setSetting('handler_settings',
    array(
      'target_bundles' => array(
        'tags' => 'tags'
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

      $fields['newtags'] = BaseFieldDefinition::create('string_long')
        ->setLabel(t('Suggested tags'))
        ->setDescription(t('Latest suggested tags.'))
        ->setDisplayOptions('form', [
          'type' => 'readonly_field_widget',
        ]);

      $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Subscription entity is published.'))
      ->setRevisionable(TRUE)
      ->setDefaultValue(FALSE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
      ]);

      $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'))
      ->setDisplayOptions('view', array(
        'label' => 'above',
        'type' => 'entity_reference',
      ));

      $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'))
      ->setDisplayOptions('view', array(
        'label' => 'above',
        'type' => 'entity_reference',
      ));

      return $fields;
    }

  }
