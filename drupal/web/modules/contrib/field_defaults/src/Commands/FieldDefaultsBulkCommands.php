<?php

namespace Drupal\field_defaults\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drush\Commands\DrushCommands;
use Drush\Exceptions\UserAbortException;

/**
 * Defines Drush commands for the module.
 */
class FieldDefaultsBulkCommands extends DrushCommands {

  /**
   * Entity type service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  private $entityTypeManager;

  /**
   * Logger service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  private $loggerChannelFactory;

  /**
   * Construct for field defaults drush commands.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type service.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerChannelFactory
   *   Logger service.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager, LoggerChannelFactoryInterface $loggerChannelFactory) {
    $this->entityTypeManager = $entityTypeManager;
    $this->loggerChannelFactory = $loggerChannelFactory;
  }

  /**
   * Bulk update defaults.
   *
   * @command field_defaults:bulk-update
   * @aliases fdbu,field_defaults-bulk-update
   *
   * @param string $entity_type
   *   The entity type to process.
   * @param string $entity_bundle
   *   The entity bundle to process.
   * @param string $field_name
   *   The field name to process.
   * @param string $lang
   *   A comma-separated list of languages to process.
   * @param bool $no_overwrite
   *   Whether to overwrite existing data.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drush\Exceptions\UserAbortException
   */
  public function fieldDefaultsBulkUpdate($entity_type, $entity_bundle, $field_name, $lang = '', $no_overwrite = TRUE) {
    $no_overwrite = filter_var($no_overwrite, FILTER_VALIDATE_BOOLEAN);

    $entity = \Drupal::entityTypeManager()
      ->getStorage('field_config')
      ->load("{$entity_type}.{$entity_bundle}.{$field_name}");

    if (empty($entity)) {
      $this->output()->writeln("Field {$entity_type}.{$entity_bundle}.{$field_name} not found.");
      return;
    }

    if (empty($entity->get('default_value')[0])) {
      $this->output()->writeln("Default value not set for field {$entity_type}.{$entity_bundle}.{$field_name}.");
      return;
    }

    $field_language = $entity->language();

    // Check that both field and bundle are translateable.
    $bundle_is_translatable = FALSE;
    if (\Drupal::hasService("content_translation.manager")) {
      $bundle_is_translatable = \Drupal::service('content_translation.manager')
        ->isEnabled($entity->getTargetEntityTypeId(), $entity->getTargetBundle());
    }

    $languages = [];
    if ($bundle_is_translatable && $entity->isTranslatable()) {
      $field_language_id = $field_language->getId();
      $this->output()->writeln($field_language_id);

      $system_languages = \Drupal::languageManager()->getLanguages();

      // Remove default language from the list.
      $system_languages = array_filter($system_languages, function ($system_language) use ($field_language_id) {
        return $system_language->getId() != $field_language_id;
      });

      // Parse languages from the arguments.
      $languages = array_map('trim', array_filter(explode(',', $lang)));

      // Check that these specific languages available in the system.
      $languages = array_filter($languages, function ($lang) use ($system_languages) {
        return in_array($lang, array_map(function ($system_language) {
          return $system_language->getId();
        }, $system_languages));
      });
    }

    // Only go ahead if default value field actually has value.
    $field_value = $entity->get('default_value')[0];
    // Fix odd term structure.
    if (isset($field_value['target_id']) && is_array($field_value['target_id'])) {
      $field_value = $field_value['target_id'];
    }

    // Get all entities of type/bundle to process.
    $query = \Drupal::entityQuery($entity_type);
    $bundle_key = $this->entityTypeManager
      ->getDefinition($entity_type)
      ->getKey('bundle');

    // Some entities don't have bundle (i.e. user)
    if (!empty($bundle_key)) {
      $bundle = $entity->getTargetBundle();
      $query->condition($bundle_key, $bundle);
    }
    $ids = $query->execute();

    $this->output()->writeln(dt('Existing @lang content will be overwritten with the selected default value(s).', [
      '@lang' => $field_language->getName(),
    ]));

    if (!empty($languages)) {
      $this->output()->writeln(dt('Additionally Update entities of the following languages:'));
      foreach ($languages as $language) {
        $this->output()->writeln($language->getName());
      }
    }

    $confirm = $this->io()->confirm(dt('Do you wish to process @count entities?', ['@count' => count($ids)]));
    if (!$confirm) {
      throw new UserAbortException();
    }

    $operations = [];
    foreach ($ids as $id) {
      $operations[] = [
        'field_defaults_update_default',
        [
          $entity_type,
          $id,
          $field_name,
          $field_value,
          $languages,
          $no_overwrite,
        ],
      ];
    }

    $batch = [
      'title' => dt('Processing default values'),
      'operations' => $operations,
      'finished' => 'field_defaults_batch_finished',
      'file' => drupal_get_path('module', 'field_defaults') . '/field_defaults.module',
    ];

    batch_set($batch);
    drush_backend_batch_process();
  }

}
