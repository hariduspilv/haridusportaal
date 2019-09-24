<?php

namespace Drupal\Tests\config_sync\Functional;

use Drupal\config_snapshot\Entity\ConfigSnapshot;
use Drupal\config_sync\ConfigSyncSnapshotterInterface;
use Drupal\node\Entity\NodeType;
use Drupal\Core\Config\StorageComparer;
use Drupal\Tests\BrowserTestBase;

/**
 * Test importing configuration changes in the UI.
 *
 * @group config_sync
 */
class ImportTest extends BrowserTestBase {

  /**
   * Modules to install.
   *
   * @var array
   */
  public static $modules = ['config_sync', 'config_sync_test'];

  /**
   * Tests that resetting the config by importing through the UI works.
   */
  public function testImportAfterChange() {
    $admin_account = $this->createUser(['synchronize distro configuration']);
    $this->drupalLogin($admin_account);

    // We should not see changes for import.
    $this->drupalGet('/admin/config/development/configuration/distro');
    $this->assertSession()->pageTextContains('There are no configuration changes to import.');
    $this->assertSession()->pageTextNotContains('Config sync tests');

    // Load the config snapshot of the test module.
    $test_module_config = ConfigSnapshot::load(ConfigSyncSnapshotterInterface::CONFIG_SNAPSHOT_SET . '.module.config_sync_test');
    $items = $test_module_config->getItems();
    // Load the node type provided by config_sync_test module.
    $node_type = NodeType::load('config_sync_test_1');

    // Change both the snapshot and the active storage value for a given
    // property (name). This will simulate a config change in the module's
    // install folder after the module with its provided configuration was
    // originally installed.
    $provided_name = $items[0]['data']['name'];
    $prior_name = 'Prior name';
    $items[0]['data']['name'] = $prior_name;
    $test_module_config
      ->setItems($items)
      ->save();
    $node_type
      ->set('name', $prior_name)
      ->save();

    // We should see config changes for import in the UI now.
    $this->drupalGet('/admin/config/development/configuration/distro');
    $this->assertSession()->pageTextContains('Config sync tests');
    $this->assertSession()->pageTextContains('View differences');
    $this->assertSession()->pageTextContains('Import');
    $this->assertSession()->pageTextNotContains('There are no configuration changes to import.');

    // Import the configuration.
    $this->drupalPostForm('admin/config/development/configuration/distro', [], t('Import'));

    // Check that there are no errors.
    $this->assertIdentical($this->configImporter()->getErrors(), []);

    // Ensure that we have no configuration changes to import.
    $storage_comparer = new StorageComparer(
      $this->container->get('config_distro.storage.distro'),
      $this->container->get('config.storage'),
      $this->container->get('config.manager')
    );
    $this->assertIdentical($storage_comparer->createChangelist()->getChangelist(), $storage_comparer->getEmptyChangelist());

    // We should not see changes for import.
    $this->drupalGet('/admin/config/development/configuration/distro');
    $this->assertSession()->pageTextContains('There are no configuration changes to import.');
    $this->assertSession()->pageTextNotContains('Config sync tests');

    // Check that the node type name was updated.
    $node_type = NodeType::load('config_sync_test_1');
    $this->assertIdentical($node_type->get('name'), $provided_name);

    // Check that the snapshot was updated.
    $test_module_config = ConfigSnapshot::load(ConfigSyncSnapshotterInterface::CONFIG_SNAPSHOT_SET . '.module.config_sync_test');
    $items = $test_module_config->getItems();
    $this->assertIdentical($items[0]['data']['name'], $provided_name);
  }

}
