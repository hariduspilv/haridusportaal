<?php

namespace Drupal\content_sync\Form;

use Drupal\content_sync\ContentSyncManagerInterface;
use Drupal\Core\Config\TypedConfigManagerInterface;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Lock\LockBackendInterface;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Construct the storage changes in a content synchronization form.
 */
class ContentSync extends FormBase {

  /**
   * The database lock object.
   *
   * @var \Drupal\Core\Lock\LockBackendInterface
   */
  protected $lock;

  /**
   * The sync content object.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $syncStorage;

  /**
   * The active content object.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;

  /**
   * The snapshot content object.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $snapshotStorage;

  /**
   * Event dispatcher.
   *
   * @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
   */
  protected $eventDispatcher;

  /**
   * The configuration manager.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface;
   */
  protected $configManager;

  /**
   * The typed config manager.
   *
   * @var \Drupal\Core\Config\TypedConfigManagerInterface
   */
  protected $typedConfigManager;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The theme handler.
   *
   * @var \Drupal\Core\Extension\ThemeHandlerInterface
   */
  protected $themeHandler;

  /**
   * The module installer.
   *
   * @var \Drupal\Core\Extension\ModuleInstallerInterface
   */
  protected $moduleInstaller;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * @var \Drupal\content_sync\ContentSyncManagerInterface
   */
  protected $contentSyncManager;

  /**
   * Constructs the object.
   *
   * @param \Drupal\Core\Config\StorageInterface $sync_storage
   *   The source storage.
   * @param \Drupal\Core\Config\StorageInterface $active_storage
   *   The target storage.
   * @param \Drupal\Core\Config\StorageInterface $snapshot_storage
   *   The snapshot storage.
   * @param \Drupal\Core\Lock\LockBackendInterface $lock
   *   The lock object.
   * @param \Symfony\Component\EventDispatcher\EventDispatcherInterface $event_dispatcher
   *   Event dispatcher.
   * @param \Drupal\Core\Config\ConfigManagerInterface $config_manager
   *   Configuration manager.
   * @param \Drupal\Core\Config\TypedConfigManagerInterface $typed_config
   *   The typed configuration manager.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Extension\ModuleInstallerInterface $module_installer
   *   The module installer.
   * @param \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler
   *   The theme handler.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   * @param \Drupal\content_sync\ContentSyncManagerInterface $content_sync_manager
   *   The content sync manager.
   */
  public function __construct(StorageInterface $sync_storage, StorageInterface $active_storage, StorageInterface $snapshot_storage, LockBackendInterface $lock, EventDispatcherInterface $event_dispatcher, ConfigManagerInterface $config_manager, TypedConfigManagerInterface $typed_config, ModuleHandlerInterface $module_handler, ModuleInstallerInterface $module_installer, ThemeHandlerInterface $theme_handler, RendererInterface $renderer, ContentSyncManagerInterface $content_sync_manager) {
    $this->syncStorage = $sync_storage;
    $this->activeStorage = $active_storage;
    $this->snapshotStorage = $snapshot_storage;
    $this->lock = $lock;
    $this->eventDispatcher = $event_dispatcher;
    $this->configManager = $config_manager;
    $this->typedConfigManager = $typed_config;
    $this->moduleHandler = $module_handler;
    $this->moduleInstaller = $module_installer;
    $this->themeHandler = $theme_handler;
    $this->contentSyncManager = $content_sync_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('content.storage.sync'),
      $container->get('content.storage'),
      $container->get('config.storage.snapshot'),
      $container->get('lock.persistent'),
      $container->get('event_dispatcher'),
      $container->get('config.manager'),
      $container->get('config.typed'),
      $container->get('module_handler'),
      $container->get('module_installer'),
      $container->get('theme_handler'),
      $container->get('renderer'),
      $container->get('content_sync.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'content_admin_import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import all'),
    ];

    $source_list = $this->syncStorage->listAll();
    $storage_comparer = new StorageComparer($this->syncStorage, $this->activeStorage, $this->configManager);
    if (empty($source_list) || !$storage_comparer->createChangelist()
                                                 ->hasChanges()
    ) {
      $form['no_changes'] = [
        '#type' => 'table',
        '#header' => [$this->t('Name'), $this->t('Operations')],
        '#rows' => [],
        '#empty' => $this->t('There are no content changes to import.'),
      ];
      $form['actions']['#access'] = FALSE;
      return $form;
    }
    else {
      // Validate site uuid unless bypass the validation is selected
      $config = \Drupal::config('content_sync.settings');
      if ($config->get('content_sync.site_uuid_override') == FALSE) {
        // Get site uuid from site settings configuration.
        $site_config = $this->config('system.site');
        $target = $site_config->get('uuid');
        // Get site uuid from content sync folder
        $source = $this->syncStorage->read('site.uuid');

        if ($source['site_uuid'] !== $target) {
          drupal_set_message($this->t('The staged content cannot be imported, because it originates from a different site than this site. You can only synchronize content between cloned instances of this site.'), 'error');
          $form['actions']['#access'] = FALSE;
          return $form;
        }
      }
    }

    // Store the comparer for use in the submit.
    $form_state->set('storage_comparer', $storage_comparer);

    // Add the AJAX library to the form for dialog support.
    $form['#attached']['library'][] = 'core/drupal.dialog.ajax';

    foreach ($storage_comparer->getAllCollectionNames() as $collection) {
      if ($collection != StorageInterface::DEFAULT_COLLECTION) {
        $form[$collection]['collection_heading'] = [
          '#type' => 'html_tag',
          '#tag' => 'h2',
          '#value' => $this->t('@collection configuration collection', ['@collection' => $collection]),
        ];
      }

      foreach ($storage_comparer->getChangelist(NULL, $collection) as $config_change_type => $config_names) {
        if (empty($config_names)) {
          continue;
        }
        // @todo A table caption would be more appropriate, but does not have the
        //   visual importance of a heading.
        $form[$collection][$config_change_type]['heading'] = [
          '#type' => 'html_tag',
          '#tag' => 'h3',
        ];
        switch ($config_change_type) {
          case 'create':
            $form[$collection][$config_change_type]['heading']['#value'] = $this->formatPlural(count($config_names), '@count new', '@count new');
            break;

          case 'update':
            $form[$collection][$config_change_type]['heading']['#value'] = $this->formatPlural(count($config_names), '@count changed', '@count changed');
            break;

          case 'delete':
            $form[$collection][$config_change_type]['heading']['#value'] = $this->formatPlural(count($config_names), '@count removed', '@count removed');
            break;

          case 'rename':
            $form[$collection][$config_change_type]['heading']['#value'] = $this->formatPlural(count($config_names), '@count renamed', '@count renamed');
            break;
        }
        $form[$collection][$config_change_type]['list'] = [
          '#type' => 'table',
          '#header' => [$this->t('Name'), $this->t('Operations')],
        ];
        foreach ($config_names as $config_name) {
          if ($config_change_type == 'rename') {
            $names = $storage_comparer->extractRenameNames($config_name);
            $route_options = [
              'source_name' => $names['old_name'],
              'target_name' => $names['new_name'],
            ];
            $config_name = $this->t('@source_name to @target_name', [
              '@source_name' => $names['old_name'],
              '@target_name' => $names['new_name'],
            ]);
          }
          else {
            $route_options = ['source_name' => $config_name];
          }
          if ($collection != StorageInterface::DEFAULT_COLLECTION) {
            $route_name = 'content.diff_collection';
            $route_options['collection'] = $collection;
          }
          else {
            $route_name = 'content.diff';
          }
          $links['view_diff'] = [
            'title' => $this->t('View differences'),
            'url' => Url::fromRoute($route_name, $route_options),
            'attributes' => [
              'class' => ['use-ajax'],
              'data-dialog-type' => 'modal',
              'data-dialog-options' => json_encode([
                'width' => 700,
              ]),
            ],
          ];
          $form[$collection][$config_change_type]['list']['#rows'][] = [
            'name' => $config_name,
            'operations' => [
              'data' => [
                '#type' => 'operations',
                '#links' => $links,
              ],
            ],
          ];
        }
      }
    }
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    $comparer = $form_state->get('storage_comparer');
    $collections = $comparer->getAllCollectionNames();

    //Set Batch to process the files from the content directory.
    //Get the files to be processed
    $content_to_sync = [];
    $content_to_delete = [];
    foreach ($collections as $collection => $collection_name) {
      $actions = $comparer->getChangeList("", $collection_name);
      if (!empty($actions['create'])) {
        $content_to_sync = array_merge($content_to_sync, $actions['create']);
      }
      if (!empty($actions['update'])) {
        $content_to_sync = array_merge($content_to_sync, $actions['update']);
      }
      if (!empty($actions['delete'])) {
        $content_to_delete = $actions['delete'];
      }
    }
    $batch = [
      'title' => $this->t('Synchronizing Content...'),
      'message' => $this->t('Synchronizing Content...'),
      'operations' => [
        [
          [$this, 'syncContent'],
          [$content_to_sync],
          [$this, 'deleteContent'],
          [$content_to_delete],
        ],
      ],
      'finished' => [$this, 'finishBatch'],
    ];

    batch_set($batch);
  }

  /**
   * Processes the content import batch and persists the importer.
   *
   * @param \Drupal\Core\Config\ConfigImporter $config_importer
   *   The batch config importer object to persist.
   * @param string $sync_step
   *   The synchronization step to do.
   * @param array $context
   *   The batch context.
   */
  public function syncContent(array $content_to_sync, &$context) {
    if (empty($context['sandbox'])) {
      $directory = content_sync_get_content_directory('sync');
      $queue = $this->contentSyncManager->generateImportQueue($content_to_sync, $directory);
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['queue'] = $queue;
      $context['sandbox']['directory'] = $directory;
      $context['sandbox']['max'] = count($queue);
    }
    if (!empty($context['sandbox']['queue'])) {
      $error = FALSE;
      $item = array_pop($context['sandbox']['queue']);
      $decoded_entity = $item['decoded_entity'];
      $entity_type_id = $item['entity_type_id'];
      $cs_context = [
        'content_sync_directory' => $context['sandbox']['directory'],
      ];
      $entity = $this->contentSyncManager->getContentImporter()
                                         ->importEntity($decoded_entity, $cs_context);
      if($entity) {
        $context['results'][] = TRUE;
        $context['message'] = $this->t('Imported content @label (@entity_type: @id).', [
          '@label' => $entity->label(),
          '@id' => $entity->id(),
          '@entity_type' => $entity->getEntityTypeId(),
        ]);
        unset($entity);
      }
      else {
        $error = TRUE;
      }
      if ($error) {
        $context['message'] = $this->t('Error exporting content of type @entity_type.', [
          '@entity_type' => $entity_type_id,
        ]);
        if (!isset($context['results']['errors'])) {
          $context['results']['errors'] = [];
        }
        $context['results']['errors'][] = $context['message'];
      }
      if ($error) {
        drupal_set_message($context['message'], 'error');
      }
      // We need to count the progress anyway even if an error has occured.
      $context['sandbox']['progress']++;
    }
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
    if ($context['sandbox']['progress'] >= $context['sandbox']['max']) {
      $context['finished'] = 1;
    }
  }


  public function deleteContent(array $content_to_sync, &$context) {
    if (empty($context['sandbox'])) {
      $directory = content_sync_get_content_directory('sync');
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['queue'] = $content_to_sync;
      $context['sandbox']['directory'] = $directory;
      $context['sandbox']['max'] = count($content_to_sync);
    }
    if (!empty($context['sandbox']['queue'])) {
      $error = TRUE;
      $item = array_pop($context['sandbox']['queue']);
      $decoded_entity = $item['decoded_entity'];
      $entity_type_id = $item['entity_type_id'];
      $cs_context = [
        'content_sync_directory' => $context['sandbox']['directory'],
      ];
      $entity_type = $this->contentSyncManager->getEntityTypeManager()
                                              ->getDefinition($entity_type_id);
      /** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
      $entity = $this->contentSyncManager->getSerializer()
                                         ->denormalize($decoded_entity, $entity_type->getClass(), 'yaml', $cs_context);

      if (!empty($entity)) {
        try {
          $message = $this->t('Deleted content @label (@entity_type: @id).', [
            '@label' => $entity->label(),
            '@id' => $entity->id(),
            '@entity_type' => $entity->getEntityTypeId(),
          ]);
          $entity->delete();
          $error = FALSE;
        } catch (EntityStorageException $e) {
          $message = $e->getMessage();
          drupal_set_message($message, 'error');
        }
      }
      else {
        $message = $this->t('Error exporting content of type @entity_type.', [
          '@entity_type' => $entity_type_id,
        ]);
      }
    }
    $context['results'][] = TRUE;
    $context['sandbox']['progress']++;
    $context['message'] = $message;

    if ($error) {
      if (!isset($context['results']['errors'])) {
        $context['results']['errors'] = [];
      }
      $context['results']['errors'][] = $context['message'];
    }

    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
    if ($context['sandbox']['progress'] >= $context['sandbox']['max']) {
      $context['finished'] = 1;
    }
  }

  /**
   * Finish batch.
   *
   * This function is a static function to avoid serializing the ConfigSync
   * object unnecessarily.
   */
  public static function finishBatch($success, $results, $operations) {
    if ($success) {
      if (!empty($results['errors'])) {
        foreach ($results['errors'] as $error) {
          drupal_set_message($error, 'error');
          \Drupal::logger('config_sync')->error($error);
        }
        drupal_set_message(\Drupal::translation()
                                  ->translate('The content was imported with errors.'), 'warning');
      }
      else {
        drupal_set_message(\Drupal::translation()
                                  ->translate('The content was imported successfully.'));
      }
    }
    else {
      // An error occurred.
      // $operations contains the operations that remained unprocessed.
      $error_operation = reset($operations);
      $message = \Drupal::translation()
                        ->translate('An error occurred while processing %error_operation with arguments: @arguments', [
                          '%error_operation' => $error_operation[0],
                          '@arguments' => print_r($error_operation[1], TRUE),
                        ]);
      drupal_set_message($message, 'error');
    }
  }

}
