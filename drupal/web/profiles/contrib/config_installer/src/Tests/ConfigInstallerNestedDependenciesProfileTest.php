<?php

namespace Drupal\config_installer\Tests;

use Drupal\Component\Serialization\Yaml;
use Drupal\Core\Archiver\ArchiveTar;
use Drupal\Core\Config\FileStorage;

/**
 * Tests the config installer profile with a profile with nested dependencies.
 *
 * @group ConfigInstaller
 */
class ConfigInstallerNestedDependenciesProfileTest extends ConfigInstallerTestBase {

  protected function setUp() {
    $this->info = [
      'type' => 'profile',
      'core' => \Drupal::CORE_COMPATIBILITY,
      'name' => 'Profile with nested dependencies',
      'dependencies' => ['nested']
    ];
    // File API functions are not available yet.
    $path = $this->siteDirectory . '/profiles/nested_dependencies_profile';
    mkdir($path, 0777, TRUE);
    file_put_contents("$path/nested_dependencies_profile.info.yml", Yaml::encode($this->info));

    // Add a required nested module to the profile.
    $this->nested = [
      'type' => 'module',
      'core' => \Drupal::CORE_COMPATIBILITY,
      'name' => 'Nested module',
    ];
    $nested_path = $path . '/modules/nested';
    mkdir($nested_path, 0777, TRUE);
    file_put_contents("$nested_path/nested.info.yml", Yaml::encode($this->nested));

    parent::setUp();
  }

  /**
   * {@inheritdoc}
   */
  protected function setUpSyncForm() {
    $this->drupalPostForm(NULL, ['files[import_tarball]' => $this->versionTarball('nested_dependencies_profile.tar.gz')], 'Save and continue');
  }

  /**
   * Ensures that the user page is available after installation.
   */
  public function testInstaller() {
    parent::testInstaller();
    $this->assertTrue($this->container->get('module_handler')->moduleExists('nested'), 'A module provided by the profile is installed.');
  }

}
