<?php

namespace Drupal\config_distro\Form;

use Drupal\config\Form\ConfigSync;
use Drupal\config_distro\Event\ConfigDistroEvents;
use Drupal\Core\Config\NullStorage;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Construct the storage changes in a configuration synchronization form.
 */
class ConfigDistroImportForm extends ConfigSync {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $class = parent::create($container);
    // Substitute our storage for the default one.
    $class->syncStorage = $container->get('config_distro.storage.distro');
    // Prevent snapshot messages by using a storage that won't have core.extension.
    // @see ConfigSync::buildForm().
    $class->snapshotStorage = new NullStorage();
    return $class;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'config_distro_import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    // @todo: why is this empty?
    $storage_comparer = $form_state->get('storage_comparer');
    if (!isset($storage_comparer)) {
      $storage_comparer = new StorageComparer($this->syncStorage, $this->activeStorage, $this->configManager);
    }
    foreach ($storage_comparer->getAllCollectionNames() as $collection) {
      if (isset($form[$collection])) {
        foreach (array_keys($form[$collection]) as $config_change_type) {
          if (isset($form[$collection][$config_change_type]['list'])) {
            foreach ($form[$collection][$config_change_type]['list']['#rows'] as &$row) {
              $config_name = $row['name'];
              if ($config_change_type == 'rename') {
                $names = $storage_comparer->extractRenameNames($config_name);
                $route_options = [
                  'source_name' => $names['old_name'],
                  'target_name' => $names['new_name']
                ];
              }
              else {
                $route_options = ['source_name' => $config_name];
              }
              if ($collection != StorageInterface::DEFAULT_COLLECTION) {
                $route_name = 'config_distro.diff_collection';
                $route_options['collection'] = $collection;
              }
              else {
                $route_name = 'config_distro.diff';
              }
              // Set the diff url to our own.
              $row['operations']['data']['#links']['view_diff']['url'] = Url::fromRoute($route_name, $route_options);
            }
          }
        }
      }
    }

    return $form;
  }

  /**
   * Dispatches an event to notify modules about a successful import.
   *
   * This method was deprecated in Drupal 8.6.x and will be called only on
   * sites running an earlier version of Drupal core.
   *
   * @see config_distro_batch_alter()
   */
  public static function finishBatch($success, $results, $operations) {
    parent::finishBatch($success, $results, $operations);
    if ($success) {
      // Dispatch an event to notify modules about the successful import.
      \Drupal::service('event_dispatcher')->dispatch(ConfigDistroEvents::IMPORT);
    }
  }

}
