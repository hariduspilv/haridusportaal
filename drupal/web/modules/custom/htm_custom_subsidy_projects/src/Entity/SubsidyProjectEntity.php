<?php

namespace Drupal\htm_custom_subsidy_projects\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\UserInterface;

/**
 * Defines the Subsidy project entity.
 *
 * @ingroup htm_custom_subsidy_projects
 *
 * @ContentEntityType(
 *   id = "subsidy_project_entity",
 *   label = @Translation("Subsidy project"),
 *   handlers = {
 *     "storage" = "Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityListBuilder",
 *     "views_data" = "Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityViewsData",
 *     "translation" = "Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\htm_custom_subsidy_projects\Form\SubsidyProjectEntityForm",
 *       "add" = "Drupal\htm_custom_subsidy_projects\Form\SubsidyProjectEntityForm",
 *       "edit" = "Drupal\htm_custom_subsidy_projects\Form\SubsidyProjectEntityForm",
 *       "delete" = "Drupal\htm_custom_subsidy_projects\Form\SubsidyProjectEntityDeleteForm",
 *     },
 *     "access" = "Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "subsidy_project_entity",
 *   data_table = "subsidy_project_entity_field_data",
 *   revision_table = "subsidy_project_entity_revision",
 *   revision_data_table = "subsidy_project_entity_field_revision",
 *   translatable = TRUE,
 *   admin_permission = "administer subsidy project entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "label" = "investment_project",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}",
 *     "add-form" = "/admin/structure/subsidy_project_entity/add",
 *     "edit-form" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/edit",
 *     "delete-form" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/delete",
 *     "version-history" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/revisions",
 *     "revision" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/revisions/{subsidy_project_entity_revision}/view",
 *     "revision_revert" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/revisions/{subsidy_project_entity_revision}/revert",
 *     "revision_delete" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/revisions/{subsidy_project_entity_revision}/delete",
 *     "translation_revert" = "/admin/structure/subsidy_project_entity/{subsidy_project_entity}/revisions/{subsidy_project_entity_revision}/revert/{langcode}",
 *     "collection" = "/admin/structure/subsidy_project_entity",
 *   },
 *   revision_metadata_keys = {
 *     "revision_user" = "revision_user",
 *     "revision_created" = "revision_created",
 *     "revision_log_message" = "revision_log"
 *   },
 *   field_ui_base_route = "subsidy_project_entity.settings"
 * )
 */
class SubsidyProjectEntity extends RevisionableContentEntityBase implements SubsidyProjectEntityInterface {

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
  protected function urlRouteParameters($rel): array
  {
    $uri_route_parameters = parent::urlRouteParameters($rel);

    if ($rel === 'revision_revert') {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }
    elseif ($rel === 'revision_delete') {
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

    // If no revision author has been set explicitly, make the subsidy_project_entity owner the
    // revision author.
    if (!$this->getRevisionUser()) {
      $this->setRevisionUserId($this->getOwnerId());
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return $this->get('investment_project')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setName($name) {
    $this->set('investment_project', $name);
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

    $fields['ehis_id'] = BaseFieldDefinition::create('integer')
			->setLabel(t('EHIS id'))
			->setDisplayOptions('form', [
				'type' => 'number',
				'weight' => -1,
			]);
		$fields['school_ref'] = BaseFieldDefinition::create('entity_reference')
				->setLabel('School entity reference')
				->setReadOnly(TRUE)
				->setSetting('target_type', 'node')
				->setSetting('handler_settings', ['target_bundles' => ['school' => 'school']])
				->setDisplayOptions('form', [
					'type' => 'entity_reference_autocomplete',
					'weight' => -1,
					'settings' => [
						'match_operator' => 'CONTAINS',
						'size' => '60',
						'autocomplete_type' => 'tags',
						'placeholder' => '',
					],
				]);


		$fields['investment_measure'] = BaseFieldDefinition::create('entity_reference')
			->setLabel('Investment measure')
			->setSettings([
				'target_type' => 'taxonomy_term',
				'handler' => 'default',
				'handler_settings' => [
					'target_bundles' => [
						'investmentmeasure' => 'investmentmeasure'
					]
				]
			])
			->setDisplayOptions('form', [
				'type' => 'options_select',
				'weight' => -1,
			]);

		$fields['investment_project'] = BaseFieldDefinition::create('string')
				->setLabel(t('Project'))
				->setDescription(t('Investment project name'))
				->setSettings([
					'text_processing' => 0,
				])
				->setDefaultValue('')
				->setDisplayOptions('form', [
					'type' => 'string_textfield',
					'weight' => -1,
				]);

		$fields['investment_amount'] = BaseFieldDefinition::create('integer')
			->setLabel(t('Investment amount'))
			->setDefaultValue(0)
			->setDisplayOptions('form', [
				'type' => 'number',
				'weight' => -1,
				'settings' => [
					'max_length' => 8,
					'max' => 99999999,
					'size' => 8
				]
			]);
		$fields['investment_deadline'] = BaseFieldDefinition::create('datetime')
			->setLabel('Investment deadline')
			->setSettings(['datetime_type' => 'date'])
			->setDisplayOptions('form', [
				'type' => 'datetime_default',
				'weight' => -1
			]);
		$fields['building_id'] = BaseFieldDefinition::create('string')
				->setLabel(t('Building id'))
				->setDescription(t('Building registration code'))
				->setSettings([
					'text_processing' => 0,
					'max_length' => 20,
				])
				->setDefaultValue('')
				->setDisplayOptions('form', [
					'type' => 'string_textfield',
					'weight' => -1,
				]);

    $fields['user_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Subsidy project entity.'))
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

    /*$fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Name'))
      ->setDescription(t('The name of the Subsidy project entity.'))
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
      ->setRequired(TRUE);*/

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Subsidy project is published.'))
      ->setRevisionable(TRUE)
      ->setDefaultValue(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'weight' => 0,
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
