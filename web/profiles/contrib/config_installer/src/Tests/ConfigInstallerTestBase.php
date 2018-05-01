<?php

namespace Drupal\config_installer\Tests;

use Drupal\config\Controller\ConfigController;
use Drupal\Core\Archiver\ArchiveTar;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\DrupalKernel;
use Drupal\Core\Extension\ExtensionDiscovery;
use Drupal\Core\Site\Settings;
use Drupal\simpletest\InstallerTestBase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides functionality for testing the config_installer profile.
 */
abstract class ConfigInstallerTestBase extends InstallerTestBase {

  /**
   * The installation profile to install.
   *
   * @var string
   */
  protected $profile = 'config_installer';

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Drupal is installed perform some basic assertions that all
    // config_installer tests need.
    if ($this->isInstalled) {
      // Ensure the test environment has the latest container.
      $this->rebuildAll();

      $sync = \Drupal::service('config.storage.sync');
      $sync_core_extension = $sync->read('core.extension');
      // Ensure that the correct install profile is active.
      if (version_compare(\Drupal::VERSION, '8.3', '>=')) {
        $this->assertEqual($sync_core_extension['profile'], \Drupal::installProfile());
      }
      else {
        $listing = new ExtensionDiscovery(\Drupal::root());
        $listing->setProfileDirectories([]);
        $profiles = array_intersect_key($listing->scan('profile'), $sync_core_extension['module']);
        $current_profile = Settings::get('install_profile');
        $this->assertFalse(empty($current_profile), 'The $install_profile setting exists');
        $this->assertEqual($current_profile, key($profiles));
      }

      // Ensure that the configuration has been completely synced.
      $this->assertNoSynDifferences();
    }
  }


  /**
   * Ensures that the user page is available after installation.
   */
  public function testInstaller() {
    $this->assertUrl('user/1');
    $this->assertResponse(200);
    // Confirm that we are logged-in after installation.
    $this->assertText($this->rootUser->getUsername());

    // @todo hmmm this message is wrong!
    // Verify that the confirmation message appears.
    require_once \Drupal::root() . '/core/includes/install.inc';
    $this->assertRaw(t('Congratulations, you installed @drupal!', [
      '@drupal' => drupal_install_profile_distribution_name(),
    ]));
  }

  /**
   * Overrides method.
   *
   * We have several forms to navigate through.
   */
  protected function setUpSite() {
    // Recreate the container so that we can simulate the submission of the
    // SyncConfigureForm after the full bootstrap has occurred. Without out this
    // drupal_realpath() does not work so uploading files through
    // WebTestBase::postForm() is impossible.
    $request = Request::createFromGlobals();
    $class_loader = require $this->container->get('app.root') . '/vendor/autoload.php';
    Settings::initialize($this->container->get('app.root'), DrupalKernel::findSitePath($request), $class_loader);
    foreach ($GLOBALS['config_directories'] as $type => $path) {
      $this->configDirectories[$type] = $path;
    }
    $this->kernel = DrupalKernel::createFromRequest($request, $class_loader, 'prod', FALSE);
    $this->kernel->prepareLegacyRequest($request);
    $this->container = $this->kernel->getContainer();

    $this->setUpSyncForm();
    $this->setUpInstallConfigureForm();
    // If we've got to this point the site is installed using the regular
    // installation workflow.
    $this->isInstalled = TRUE;
  }

  /**
   * Submit the config_installer_sync_configure_form.
   *
   * @see \Drupal\config_installer\Form\SyncConfigureForm
   */
  abstract protected function setUpSyncForm();

  /**
   * Submit the config_installer_site_configure_form.
   *
   * @see \Drupal\config_installer\Form\SiteConfigureForm
   */
  protected function setUpInstallConfigureForm() {
    $params = $this->parameters['forms']['install_configure_form'];
    unset($params['site_name']);
    unset($params['site_mail']);
    unset($params['update_status_module']);
    $edit = $this->translatePostValues($params);
    $this->drupalPostForm(NULL, $edit, $this->translations['Save and continue']);
  }

  /**
   * Gets the tarball for testing.
   *
   * @var string
   */
  protected function getTarball() {
    // Exported configuration after a minimal profile install.
    return $this->versionTarball('minimal.tar.gz');
  }

  /**
   * Gets a tarball for the right version of Drupal.
   *
   * @param $tarball
   *   The tarball filename.
   *
   * @return string
   *   The fullpath to the tarball.
   */
  protected function versionTarball($tarball) {
    include_once \Drupal::root() . '/core/includes/install.core.inc';
    $version = _install_get_version_info(\Drupal::VERSION);
    $versioned_file = __DIR__ . '/Fixtures/' . $version['major'] . '.' . $version['minor'] . '/' . $tarball;
    if (file_exists($versioned_file)) {
      return $versioned_file;
    }
    return __DIR__ . '/Fixtures/' . $tarball;
  }

  /**
   * Extracts a tarball to a directory.
   *
   * @param string $tarball_path
   *   The path to a tarball to extract.
   * @param string $directory
   *   The directory to extract to.
   *
   * @return string[]
   *   The list files extracted.
   */
  protected function extractTarball($tarball_path, $directory) {
    $archiver = new ArchiveTar($tarball_path, 'gz');
    $files = [];
    $list = $archiver->listContent();
    if (is_array($list)) {
      /** @var array $list */
      foreach ($list as $file) {
        $files[] = $file['filename'];
      }
    }
    $archiver->extractList($files, $directory);
    return $files;
  }

  /**
   * Ensures that the sync and active configuration match.
   *
   * @return bool
   *   TRUE if sync and active configuration match, FALSE if not.
   */
  protected function assertNoSynDifferences() {
    $sync = $this->container->get('config.storage.sync');
    $active = $this->container->get('config.storage');
    // Ensure that we have no configuration changes to import.
    $storage_comparer = new StorageComparer(
      $sync,
      $active,
      $this->container->get('config.manager')
    );
    $changelist = $storage_comparer->createChangelist()->getChangelist();
    // system.mail is changed by \Drupal\simpletest\InstallerTestBase::setUp()
    // this is a good idea because it prevents tests emailling.
    $key = array_search('system.mail', $changelist['update'], TRUE);
    if ($key !== FALSE) {
      unset($changelist['update'][$key]);
    }
    $return = $this->assertIdentical($changelist, $storage_comparer->getEmptyChangelist());
    // Output proper diffs.
    $controller = ConfigController::create($this->container);
    foreach ($changelist['update'] as $config_name) {
      $diff = $controller->diff($config_name);
      $this->verbose(\Drupal::service('renderer')->renderPlain($diff));
    }
    return $return;
  }

}
