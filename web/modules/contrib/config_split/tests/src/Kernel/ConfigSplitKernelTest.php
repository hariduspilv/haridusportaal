<?php

namespace Drupal\Tests\config_split\Kernel;

use Drupal\config_filter\Config\FilteredStorage;
use Drupal\config_split\Form\ConfigSplitEntityForm;
use Drupal\config_split\Plugin\ConfigFilter\SplitFilter;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\FileStorage;
use Drupal\KernelTests\KernelTestBase;
use org\bovigo\vfs\vfsStream;

/**
 * Class ConfigSplitKernelTest.
 *
 * @group config_split
 */
class ConfigSplitKernelTest extends KernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'system',
    'config_test',
    'config_filter',
    'config_split',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installConfig(['config_test']);
  }

  /**
   * Test that splits can be serialized.
   */
  public function testSerialisation() {

    $vfs = vfsStream::setup('split');
    $primary = new FileStorage($vfs->url() . '/sync');

    $folder_config = new Config('config_split.config_split.folder_split', $this->container->get('config.storage'), $this->container->get('event_dispatcher'), $this->container->get('config.typed'));
    $folder_config->initWithData([
      'id' => 'folder_split',
      'folder' => $vfs->url() . '/split',
      'module' => [],
      'theme' => [],
      'blacklist' => ['config_test.system'],
      'graylist' => [],
    ])->save();
    $folder_split = SplitFilter::create($this->container, ['config_name' => 'config_split.config_split.folder_split'], 'config_split:folder_split', []);

    $db_config = new Config('config_split.config_split.db_split', $this->container->get('config.storage'), $this->container->get('event_dispatcher'), $this->container->get('config.typed'));
    $db_config->initWithData([
      'id' => 'db_split',
      'folder' => '',
      'module' => [],
      'theme' => [],
      'blacklist' => ['config_test.types'],
      'graylist' => [],
    ])->save();
    $db_split = SplitFilter::create($this->container, ['config_name' => 'config_split.config_split.db_split'], 'config_split:db_split', []);

    // Create the filtered storage with a folder split and a database split.
    $filtered = new FilteredStorage($primary, [$folder_split, $db_split]);

    // Export the configuration.
    $this->copyConfig($this->container->get('config.storage'), $filtered);

    // Read from the split folder, the database and the sync directory.
    $test_system = $filtered->read('config_test.system');
    $test_types = $filtered->read('config_test.types');
    $test_validation = $filtered->read('config_test.validation');
    $this->assertEquals($this->container->get('config.storage')->read('config_test.system'), $test_system);
    $this->assertEquals($this->container->get('config.storage')->read('config_test.types'), $test_types);
    $this->assertEquals($this->container->get('config.storage')->read('config_test.validation'), $test_validation);

    // Serialize and unserialize to make sure everything works.
    $serialized = serialize($filtered);
    $filtered = unserialize($serialized);

    // Assert reading the same values returns the same things afterwards.
    $this->assertEquals($test_system, $filtered->read('config_test.system'));
    $this->assertEquals($test_types, $filtered->read('config_test.types'));
    $this->assertEquals($test_validation, $filtered->read('config_test.validation'));
  }

  /**
   * Test that the form checks the sync folder.
   *
   * @param string $split
   *   The split folder.
   * @param string $sync
   *   The sync folder.
   * @param bool $expected
   *   The expected result.
   *
   * @dataProvider syncFolderIsConflictingProvider
   */
  public function testSyncFolderIsConflicting($split, $sync, $expected) {
    global $config_directories;
    $config_directories[CONFIG_SYNC_DIRECTORY] = $sync;

    // Access the protected static function to test it.
    $reflection = new \ReflectionClass(ConfigSplitEntityForm::class);
    $method = $reflection->getMethod('isConflicting');
    $method->setAccessible(TRUE);

    $this->assertEquals($expected, $method->invoke(NULL, $split));
  }

  /**
   * Provide the split and sync directories to compare.
   *
   * @return array
   *   The data.
   */
  public function syncFolderIsConflictingProvider() {
    return [
      ['../config/split', '../config/sync', FALSE],
      ['../config/config_split', '../config/config', FALSE],
      ['../config/sync/split', '../config/sync', TRUE],
      // We do not actually resolve the folder hierarchy.
      ['config/other/../sync', 'config/sync', FALSE],
    ];
  }

}
