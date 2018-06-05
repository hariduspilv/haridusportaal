<?php

namespace Drupal\custom_subscription_administration\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
* Defines the Subscription entity entity.
*
* @ingroup custom_subscription_administration
*
* @ContentEntityType(
*   id = "subscription_entity",
*   label = @Translation("Subscription entity"),
*   handlers = {
*     "storage" = "Drupal\custom_subscription_administration\SubscriptionEntityStorage",
*     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
*     "list_builder" = "Drupal\custom_subscription_administration\SubscriptionEntityListBuilder",
*     "views_data" = "Drupal\custom_subscription_administration\Entity\SubscriptionEntityViewsData",
*     "translation" = "Drupal\custom_subscription_administration\SubscriptionEntityTranslationHandler",
*
*     "form" = {
*       "default" = "Drupal\custom_subscription_administration\Form\SubscriptionEntityForm",
*       "add" = "Drupal\custom_subscription_administration\Form\SubscriptionEntityForm",
*       "edit" = "Drupal\custom_subscription_administration\Form\SubscriptionEntityForm",
*       "delete" = "Drupal\custom_subscription_administration\Form\SubscriptionEntityDeleteForm",
*     },
*     "access" = "Drupal\custom_subscription_administration\SubscriptionEntityAccessControlHandler",
*     "route_provider" = {
*       "html" = "Drupal\custom_subscription_administration\SubscriptionEntityHtmlRouteProvider",
*     },
*   },
*   base_table = "subscription_entity",
*   data_table = "subscription_entity_field_data",
*   revision_table = "subscription_entity_revision",
*   revision_data_table = "subscription_entity_field_revision",
*   translatable = TRUE,
*   admin_permission = "administer subscription entity entities",
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
*     "canonical" = "/admin/structure/subscription_entity/{subscription_entity}",
*     "add-form" = "/admin/structure/subscription_entity/add",
*     "edit-form" = "/admin/structure/subscription_entity/{subscription_entity}/edit",
*     "delete-form" = "/admin/structure/subscription_entity/{subscription_entity}/delete",
*     "version-history" = "/admin/structure/subscription_entity/{subscription_entity}/revisions",
*     "revision" = "/admin/structure/subscription_entity/{subscription_entity}/revisions/{subscription_entity_revision}/view",
*     "revision_revert" = "/admin/structure/subscription_entity/{subscription_entity}/revisions/{subscription_entity_revision}/revert",
*     "revision_delete" = "/admin/structure/subscription_entity/{subscription_entity}/revisions/{subscription_entity_revision}/delete",
*     "translation_revert" = "/admin/structure/subscription_entity/{subscription_entity}/revisions/{subscription_entity_revision}/revert/{langcode}",
*     "collection" = "/admin/structure/subscription_entity",
*   },
*   field_ui_base_route = "subscription_entity.settings"
* )
*/
class SubscriptionEntity extends RevisionableContentEntityBase implements SubscriptionEntityInterface {

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

    // If no revision author has been set explicitly, make the subscription_entity owner the
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
  public function getEmail() {
    return $this->get('email')->value;
  }

  /**
  * {@inheritdoc}
  */
  public function setEmail($email) {
    $this->set('email', $email);
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

    $fields['name'] = BaseFieldDefinition::create('string')
    ->setLabel(t('Name'))
    ->setDescription(t('The name of the Subscription entity entity.'))
    ->setRevisionable(TRUE)
    ->setSettings([
      'max_length' => 50,
      'text_processing' => 0,
    ])
    ->setDefaultValue('')
    ->setDisplayOptions('view', [
      'label' => 'above',
      'type' => 'string',
    ])
    ->setDisplayOptions('form', [
      'type' => 'string_textfield',
    ])
    ->setDisplayConfigurable('form', TRUE)
    ->setDisplayConfigurable('view', TRUE)
    ->setRequired(TRUE);

    $fields['email'] = BaseFieldDefinition::create('email')
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
        'type' => 'entity_reference_autocomplete',
        'settings' => array(
          'match_operator' => 'CONTAINS',
          'size' => '100',
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ),
      ))
      ->setDisplayConfigurable('form', TRUE)
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED);

      $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Subscription entity is published.'))
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

      $fields['revision_translation_affected'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Revision translation affected'))
      ->setDescription(t('Indicates if the last edit of a translation belongs to current revision.'))
      ->setReadOnly(TRUE)
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);

      return $fields;
    }

  }
