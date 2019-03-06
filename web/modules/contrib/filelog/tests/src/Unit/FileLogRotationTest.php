<?php

namespace Drupal\Tests\filelog\Unit;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\File\FileSystem;
use Drupal\Core\Site\Settings;
use Drupal\Core\State\StateInterface;
use Drupal\Core\StreamWrapper\StreamWrapperManagerInterface;
use Drupal\Core\Utility\Token;
use Drupal\filelog\FileLogException;
use Drupal\filelog\Logger\FileLog;
use Drupal\filelog\LogRotator;
use Drupal\Tests\UnitTestCase;
use org\bovigo\vfs\vfsStream;
use Psr\Log\LoggerInterface;

/**
 * Tests the log rotation of the file logger.
 *
 * @group filelog
 */
class FileLogRotationTest extends UnitTestCase {

  /**
   * @var \org\bovigo\vfs\vfsStreamDirectory
   */
  protected $fileSystem;

  /**
   * @var \Drupal\filelog\Logger\FileLog
   */
  protected $fileLog;

  /**
   * @var \Drupal\Core\Utility\Token
   */
  protected $token;

  /**
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    require_once $this->root . '/core/includes/file.inc';

    $this->fileSystem = vfsStream::setup('filelog');

    // Force UTC time to avoid platform-specific effects.
    \date_default_timezone_set('UTC');

    $this->fileLog = $this->getMockBuilder(FileLog::class)
                          ->disableOriginalConstructor()
                          ->getMock();
    $this->fileLog->expects($this->any())
                  ->method('getFileName')
                  ->willReturn('vfs://filelog/drupal.log');

    $this->token = $this->getMockBuilder(Token::class)
                        ->disableOriginalConstructor()
                        ->getMock();
    $this->token->expects($this->any())
                ->method('replace')
                ->willReturnCallback([static::class, 'tokenReplace']);

    $this->time = $this->getMockBuilder(TimeInterface::class)
      ->getMock();
    $this->time->expects($this->any())
      ->method('getRequestTime')
      ->willReturn(86401);

    $container = new ContainerBuilder();
    /** @var \Drupal\Core\StreamWrapper\StreamWrapperManagerInterface $swManager */
    $swManager = $this->createMock(StreamWrapperManagerInterface::class);
    $settings = new Settings([]);
    /** @var \Psr\Log\LoggerInterface $logger */
    $logger = $this->createMock(LoggerInterface::class);
    $fileSystem = new FileSystem($swManager, $settings, $logger);
    $container->set('file_system', $fileSystem);
    \Drupal::setContainer($container);
  }

  /**
   * Test the log rotator with a variety of configurations and states.
   *
   * @param int   $timestamp
   * @param array $config
   * @param array $files
   *
   * @dataProvider provideRotationConfig
   */
  public function testRotation($timestamp, array $config, array $files): void {
    $root = 'vfs://filelog';

    $logFile = $root . '/' . FileLog::FILENAME;
    $data = "This is the log file content.\n";

    $configs = [
      'filelog.settings' => [
        'rotation' => $config,
        'location' => $root,
      ],
    ];
    /** @var \Drupal\Core\Config\ConfigFactoryInterface $configFactory */
    $configFactory = $this->getConfigFactoryStub($configs);

    /** @var StateInterface|\PHPUnit_Framework_MockObject_MockObject $state */
    $state = $this->createMock(StateInterface::class);
    $state->expects($this->any())
      ->method('get')
      ->with('filelog.rotation')
      ->willReturn($timestamp);

    \file_put_contents($logFile, $data);
    $rotator = new LogRotator($configFactory,
                              $state,
                              $this->token,
                              $this->time,
                              $this->fileLog);
    try {
      $rotator->run();
    }
    catch (FileLogException $exception) {
      $this->fail("Log rotation caused an exception: {$exception}");
    }

    // Check that all the expected files have the correct content.
    foreach ($files as $name) {
      $path = "$root/$name";
      $compressed = \preg_match('/\.gz$/', $name) === 1;
      $expected = $compressed ? \gzencode($data) : $data;
      $content = \file_get_contents($path);
      $this->assertEquals($expected, $content);

      // Delete the file after checking.
      \unlink($path);
    }

    // Check that no other files exist.
    foreach (\scandir('vfs://filelog', 0) as $name) {
      if ($name === '.htaccess') {
        continue;
      }

      $path = "$root/$name";
      // The log file itself may persist, but must be empty.
      if ($name === FileLog::FILENAME) {
        $this->assertStringEqualsFile($path, '');
      }
      // There may be subdirectories.
      else {
        $this->assertDirectoryExists($path);
      }
    }
  }

  /**
   * Provide configuration and state for the rotation test.
   *
   * @return array
   */
  public function provideRotationConfig(): array {
    $config = [
      'schedule'    => 'daily',
      'delete'      => FALSE,
      'destination' => 'archive/[date:custom:Y/m/d].log',
      'gzip'        => FALSE,
    ];
    $data[] = [
      'timestamp' => 86400,
      'config'    => $config,
      'files'     => [FileLog::FILENAME],
    ];
    $data[] = [
      'timestamp' => 86399,
      'config'    => $config,
      'files'     => ['archive/1970/01/01.log'],
    ];

    $config['schedule'] = 'weekly';
    // 70/1/1 was a Thursday. Go back three days to the beginning of the week.
    $data[] = [
      'timestamp' => -259200,
      'config'    => $config,
      'files'     => [FileLog::FILENAME],
    ];
    $data[] = [
      'timestamp' => -259201,
      'config'    => $config,
      'files'     => ['archive/1969/12/28.log'],
    ];

    $config['schedule'] = 'monthly';
    $data[] = [
      'timestamp' => 0,
      'config'    => $config,
      'files'     => [FileLog::FILENAME],
    ];
    $data[] = [
      'timestamp' => -1,
      'config'    => $config,
      'files'     => ['archive/1969/12/31.log'],
    ];

    $config['gzip'] = TRUE;
    $data[] = [
      'timestamp' => -1,
      'config'    => $config,
      'files'     => ['archive/1969/12/31.log.gz'],
    ];

    $config['delete'] = TRUE;
    $data[] = [
      'timestamp' => -1,
      'config'    => $config,
      'files'     => [],
    ];

    $config['schedule'] = 'never';
    $data[] = [
      'timestamp' => -100000000, // about three years.
      'config'    => $config,
      'files'     => [FileLog::FILENAME],
    ];

    return $data;
  }

  /**
   * Flatten nested arrays into the top level as dotted keys.
   *
   * Original keys remain intact.
   *
   * @param array  $config
   * @param string $prefix
   *
   * @return array
   */
  private static function flatten(array $config, $prefix = ''): array {
    $flat = [];
    foreach ($config as $name => $value) {
      $flat[$prefix . $name] = $value;
      if (\is_array($value)) {
        $flat += self::flatten($value, $prefix . $name . '.');
      }
    }
    return $flat;
  }

  /**
   * Mock Token::replace() only for [date:custom:...]
   *
   * @param string $text
   * @param array  $data
   *
   * @return string
   */
  public static function tokenReplace($text, array $data): string {
    \preg_match_all('/\[date:custom:(.*?)\]/', $text, $matches, PREG_SET_ORDER);
    $replace = [];
    foreach ((array) $matches as $match) {
      $replace[$match[0]] = \date($match[1], $data['date']);
    }
    return \strtr($text, $replace);
  }

}
