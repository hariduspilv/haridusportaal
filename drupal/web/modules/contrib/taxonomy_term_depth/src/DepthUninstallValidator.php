<?php

namespace Drupal\taxonomy_term_depth;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Entity\FieldableEntityStorageInterface;
use Drupal\Core\Extension\ModuleUninstallValidatorInterface;
use Drupal\Core\Url;

/**
 * Prevents uninstallation of modules providing active field storage.
 */
class DepthUninstallValidator implements ModuleUninstallValidatorInterface {
  use StringTranslationTrait;


  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;


  /**
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;


  /**
   * DepthUninstallValidator constructor.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_manager
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   * @param \Drupal\Core\StringTranslation\TranslationInterface $string_translation
   */
  public function __construct(EntityTypeManagerInterface $entity_manager, EntityFieldManagerInterface $entity_field_manager, TranslationInterface $string_translation) {
    $this->entityTypeManager = $entity_manager;
    $this->entityFieldManager = $entity_field_manager;
    $this->stringTranslation = $string_translation;
  }


  /**
   * {@inheritdoc}
   */
  public function validate($module_name) {
    $reasons = array();

    // We skip fields provided by the Field module as it implements field
    // purging.
    if ($module_name != 'field') {
      foreach ($this->entityTypeManager->getDefinitions() as $entity_type_id => $entity_type) {
        // We skip entity types defined by the module as there must be no
        // content to be able to uninstall them anyway.
        // See \Drupal\Core\Entity\ContentUninstallValidator.
        if ($entity_type->getProvider() != $module_name && $entity_type->isSubclassOf('\Drupal\Core\Entity\FieldableEntityInterface')) {
          foreach ($this->entityFieldManager->getFieldStorageDefinitions($entity_type_id) as $storage_definition) {
            if ($storage_definition->getProvider() == $module_name) {
              $storage = $this->entityTypeManager->getStorage($entity_type_id);
              if ($storage instanceof FieldableEntityStorageInterface && $storage->countFieldData($storage_definition, TRUE)) {
                $reasons[] = $this->t('There is data for the field @field-name on entity type @entity_type. <a href=":url">Delete depth fields data.</a>.', array(
                  '@field-name' => $storage_definition->getName(),
                  '@entity_type' => $entity_type->getLabel(),
                  ':url' => Url::fromRoute('taxonomy_term_depth.prepare_modules_uninstall')->toString(),
                ));
              }
            }
          }
        }
      }
    }

    return $reasons;
  }

}
