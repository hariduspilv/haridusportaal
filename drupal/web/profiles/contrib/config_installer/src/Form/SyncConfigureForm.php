<?php

namespace Drupal\config_installer\Form;

use Drupal\Core\Archiver\ArchiveTar;
use Drupal\Core\Config\ConfigImporter;
use Drupal\Core\Config\ConfigImporterException;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\Extension\ExtensionDiscovery;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\config_installer\Storage\SourceStorage;

/**
 * Inline include as this install profile code cannot be autoloaded.
 */
include_once __DIR__ . '/../Storage/SourceStorage.php';

/**
 * Installation step to configure sync directory or upload a tarball.
 */
class SyncConfigureForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'config_installer_sync_configure_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#title'] = $this->t('Configure configuration import location');

    $form['sync_directory'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Synchronisation directory'),
      '#default_value' => config_get_config_directory(CONFIG_SYNC_DIRECTORY),
      '#maxlength' => 255,
      '#description' => $this->t('Path to the config directory you wish to import, can be relative to document root or an absolute path.'),
      '#required' => TRUE,
      // This value can only be changed if settngs.php is writable.
      '#disabled' => !is_writable(\Drupal::service('site.path') . '/settings.php')
    ];

    $form['import_tarball'] = [
      '#type' => 'file',
      '#title' => $this->t('Select your configuration export file'),
      '#description' => $this->t('If the sync directory is empty you can upload a configuration export file.'),
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save and continue'),
      '#weight' => 15,
      '#button_type' => 'primary',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    global $config_directories;
    global $install_state;

    $file_upload = $this->getRequest()->files->get('files', NULL, TRUE);
    $has_upload = FALSE;
    if (!empty($file_upload['import_tarball']) && $file_upload['import_tarball']->isValid()) {
      // The sync directory must be empty if we are doing an upload.
      $form_state->setValue('import_tarball', $file_upload['import_tarball']->getRealPath());
      $has_upload = TRUE;
    }
    $sync_directory = $form_state->getValue('sync_directory');
    // If we've customised the sync directory ensure its good to go.
    if ($sync_directory !== config_get_config_directory(CONFIG_SYNC_DIRECTORY)) {
      // We have to create the directory if it does not exist. If it exists we
      // need to ensure it is writeable is we are processing an upload.
      $create_directory = !is_dir($sync_directory) || $has_upload;
      if ($create_directory && !file_prepare_directory($sync_directory, FILE_CREATE_DIRECTORY | FILE_MODIFY_PERMISSIONS)) {
        $form_state->setErrorByName('sync_directory', t('The directory %directory could not be created or could not be made writable. To proceed with the installation, either create the directory and modify its permissions manually or ensure that the installer has the permissions to create it automatically. For more information, see the <a href="@handbook_url">online handbook</a>.', [
          '%directory' => $sync_directory,
          '@handbook_url' => 'http://drupal.org/server-permissions',
        ]));
      }
    }

    // If no tarball ensure we have files.
    if (!$has_upload && !$form_state->hasAnyErrors()) {
      $sync = new FileStorage($sync_directory);
      if (count($sync->listAll()) === 0) {
        $form_state->setErrorByName('sync_directory', $this->t('No file upload provided and the sync directory is empty'));
      }
    }

    // Early exit if we have errors.
    if ($form_state->hasAnyErrors()) {
      return;
    }

    // Update the sync directory setting if required.
    if ($sync_directory !== config_get_config_directory(CONFIG_SYNC_DIRECTORY)) {
      $settings['config_directories'][CONFIG_SYNC_DIRECTORY] = (object) [
        'value' => $sync_directory,
        'required' => TRUE,
      ];
      drupal_rewrite_settings($settings);
      $config_directories[CONFIG_SYNC_DIRECTORY] = $sync_directory;
    }

    // Upload tarball if provided so we can validate the files.
    if ($tarball_path = $form_state->getValue('import_tarball')) {
      // Ensure that we have an empty directory if we're going.
      $sync = new FileStorage($sync_directory);
      $sync->deleteAll();
      try {
        $archiver = new ArchiveTar($tarball_path, 'gz');
        $files = [];
        $list = $archiver->listContent();
        if (is_array($list)) {
          /** @var array $list */
          foreach ($list as $file) {
            $files[] = $file['filename'];
          }
          $archiver->extractList($files, config_get_config_directory(CONFIG_SYNC_DIRECTORY));
        }
      }
      catch (\Exception $e) {
        $form_state->setErrorByName('import_tarball', $this->t('Could not extract the contents of the tar file. The error message is <em>@message</em>', ['@message' => $e->getMessage()]));
      }
      drupal_unlink($tarball_path);
      if (empty($files)) {
        $form_state->setErrorByName('import_tarball', $this->t('The tar file contoins no files.'));
      }
    }

    // Early exit if we have errors.
    if ($form_state->hasAnyErrors()) {
      return;
    }

    // Create a source storage that reads from sync.
    $listing = new ExtensionDiscovery(\Drupal::root());
    $listing->setProfileDirectories([]);
    $sync = new SourceStorage(\Drupal::service('config.storage.sync'), $listing->scan('profile'));

    // Match up the site uuids, the install_base_system install task will have
    // installed the system module and created a new UUID.
    $system_site = $sync->read('system.site');
    \Drupal::configFactory()->getEditable('system.site')->set('uuid', $system_site['uuid'])->save();

    if (version_compare(\Drupal::VERSION, '8.3', '>=')){
      // In Drupal 8.3.x the install profile has moved to configuration.
      // @see https://www.drupal.org/node/2156401
      \Drupal::configFactory()
        ->getEditable('core.extension')
        ->set('profile', _config_installer_get_original_install_profile())
        ->save();
    }

    // Create the storage comparer and the config importer.
    $config_manager = \Drupal::service('config.manager');
    $storage_comparer = new StorageComparer($sync, \Drupal::service('config.storage'), $config_manager);
    $storage_comparer->createChangelist();
    $config_importer = new ConfigImporter(
      $storage_comparer,
      \Drupal::service('event_dispatcher'),
      $config_manager,
      \Drupal::service('lock.persistent'),
      \Drupal::service('config.typed'),
      \Drupal::service('module_handler'),
      \Drupal::service('module_installer'),
      \Drupal::service('theme_handler'),
      \Drupal::service('string_translation')
    );

    // Change $install_state profile to find profile modules during validation.
    $install_state['parameters']['profile'] = _config_installer_get_original_install_profile();

    try {
      $config_importer->validate();
    }
    catch (ConfigImporterException $e) {
      $error_message = [
        '#type' => 'inline_template',
        '#template' => '{% trans %}The configuration cannot be imported because it failed validation for the following reasons:{% endtrans%}{{ errors }}',
        '#context' => [
          'errors' => [
            '#theme' => 'item_list',
            '#items' => $config_importer->getErrors(),
          ],
        ],
      ];

      $field_name = $has_upload ? 'import_tarball' : 'sync_directory';
      $form_state->setErrorByName($field_name, \Drupal::service('renderer')->renderPlain($error_message));
    }

    // Revert $install_state profie to continue with the regular process.
    $install_state['parameters']['profile'] = 'config_installer';
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    global $install_state;
    // Change the langcode to the site default langcode provided by the
    // configuration.
    $config_storage = new FileStorage(config_get_config_directory(CONFIG_SYNC_DIRECTORY));
    $install_state['parameters']['langcode'] = $config_storage->read('system.site')['langcode'];
  }

}
