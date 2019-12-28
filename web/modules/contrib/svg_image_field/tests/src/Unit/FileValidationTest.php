<?php

namespace Drupal\Tests\svg_image_field\Unit;

use Drupal\Tests\field\Kernel\FieldKernelTestBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\file\Entity\File;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

/**
 * Svg Image Field module unit tests.
 *
 * @group svg_image_field
 */
class FileValidationTest extends FieldKernelTestBase {
  /**
   * Test files directory path.
   *
   * @var string
   */
  public $testDataDirPath;
  /**
   * Directory where the sample files are stored.
   *
   * @var string
   */
  protected $directory;
  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['file', 'svg_image_field'];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    $this->testDataDirPath = dirname(__FILE__) . '/test_data';
    parent::setUp();
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);

    FieldStorageConfig::create([
      'field_name' => 'file_test',
      'entity_type' => 'entity_test',
      'type' => 'file',
      'cardinality' => FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED,
    ])->save();
    FieldConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'file_test',
      'bundle' => 'entity_test',
      'settings' => ['file_directory' => $this->testDataDirPath],
    ])->save();
  }

  /**
   * Checks that the list of files is being checked as expected.
   */
  public function testFileValidation() {
    $files = scandir($this->testDataDirPath);
    foreach ($files as $file_name) {
      if (strpos($file_name, 'valid_svg') === 0) {
        $file_path = realpath($this->testDataDirPath . '/' . $file_name);
        $file = File::create([
          'uri' => $file_path,
          'uid' => 1,
          'status' => 1,
        ]);
        $file->setFilename($file_name);
        $this->assertEquals(TRUE, count(svg_image_field_validate_mime_type($file)) === 0,
        t("Check that %file_name is valid", ['%file_name' => $file_name]));
      }
      elseif (strpos($file_name, 'invalid_svg') === 0) {
        $file_path = realpath($this->testDataDirPath . '/' . $file_name);
        $file = File::create([
          'uri' => $file_path,
          'uid' => 1,
          'status' => 1,
        ]);
        $file->setFilename($file_name);
        $this->assertEquals(TRUE, count(svg_image_field_validate_mime_type($file)) > 0,
        t("Check that %file_name is invalid", ['%file_name' => $file_name]));
      }
    }
  }

}
