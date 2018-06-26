<?php

namespace Drupal\Tests\filelog\Unit;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\File\FileSystem;
use Drupal\Core\Logger\LogMessageParser;
use Drupal\Core\Site\Settings;
use Drupal\Core\State\StateInterface;
use Drupal\Core\StreamWrapper\StreamWrapperManagerInterface;
use Drupal\Core\Utility\Token;
use Drupal\filelog\Logger\FileLog;
use Drupal\filelog\LogMessage;
use Drupal\Tests\UnitTestCase;
use org\bovigo\vfs\vfsStream;
use Psr\Log\LoggerInterface;

/**
 * Test the file logger.
 *
 * @group filelog
 */
class FileLogTest extends UnitTestCase {

  /**
   * @var \Drupal\Core\Utility\Token
   */
  protected $token;

  /**
   * @var \Drupal\Core\Logger\LogMessageParserInterface
   */
  protected $logMessageParser;

  /**
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * @var \org\bovigo\vfs\vfsStreamDirectory
   */
  protected $fileSystem;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    require_once $this->root . '/core/includes/file.inc';

    $this->token = $this->getMockBuilder(Token::class)
      ->disableOriginalConstructor()
      ->getMock();

    $this->token->expects($this->any())
      ->method('replace')
      ->willReturnCallback([static::class, 'tokenReplace']);

    $this->time = $this->createMock(TimeInterface::class);
    $this->time->expects($this->any())
      ->method('getRequestTime')
      ->willReturn($_SERVER['REQUEST_TIME']);

    $this->logMessageParser = new LogMessageParser();
    $this->fileSystem = vfsStream::setup('filelog');

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
   * Test a particular configuration, and ensure that it logs the correct
   * events.
   *
   * @param array  $config
   * @param array  $events
   * @param string $expected
   *
   * @dataProvider providerFileLog
   */
  public function testFileLog(array $config, array $events, $expected = ''): void {
    /** @var \Drupal\Core\Config\ConfigFactoryInterface $configFactory */
    $configFactory = $this->getConfigFactoryStub(
      ['filelog.settings' => $config]
    );

    /** @var StateInterface|\PHPUnit_Framework_MockObject_MockObject $state */
    $state_data = ['filelog.rotation' => 0];
    $state = $this->createMock(StateInterface::class);
    $state->expects($this->any())
      ->method('get')
      ->willReturnCallback(
        function ($key) use (&$state_data) {
          return $state_data[$key];
        }
      );
    $state->expects($this->any())
      ->method('set')
      ->willReturnCallback(
        function ($key, $value) use (&$state_data) {
          $state_data[$key] = $value;
        }
      );

    $logger = new FileLog(
      $configFactory,
      $state,
      $this->token,
      $this->time,
      $this->logMessageParser
    );

    foreach ($events as $event) {
      $logger->log($event['level'], $event['message'], $event['context']);
    }

    // Read log output and remove file for the next test.
    $content = '';
    if ($this->fileSystem->hasChild(FileLog::FILENAME)) {
      $content = \file_get_contents(
        $this->fileSystem->getChild(FileLog::FILENAME)->url()
      );
      $this->fileSystem->removeChild(FileLog::FILENAME);
    }

    $this->assertEquals($expected, $content);

    // Check that the timestamp was saved if and only if a log was created.
    $timestamp = $state->get('filelog.rotation');
    $this->assertEquals(
      $content ? (int) $_SERVER['REQUEST_TIME'] : 0,
      $timestamp
    );
  }

  /**
   * Provide data for the level-checking test.
   *
   * @return array
   */
  public function providerFileLog(): array {
    $events = [];
    $config = [
      'enabled'  => TRUE,
      'location' => 'vfs://filelog',
      'level'    => 7,
      'format'   => '[log:level] [log:message]',
    ];

    for ($i = 0; $i <= 7; $i++) {
      $events[] = [
        'level'   => $i,
        'message' => "This is message @i.\n LD5}5>~\\8AiU * VH",
        'context' => [
          '@i'        => $i,
          'timestamp' => 0,
        ],
      ];
    }

    $expected = '';
    $data = [];

    $levels = LogMessage::getLevels();

    for ($i = 0; $i <= 7; $i++) {
      $expected .= $levels[$i] . " This is message $i.\\n LD5}5>~\\8AiU * VH\n";
      $data[$i] = [
        'config'   => ['level' => $i] + $config,
        'events'   => $events,
        'expected' => $expected,
      ];
    }

    $data[] = [
      'config'   => ['enabled' => FALSE] + $config,
      'events'   => $events,
      'expected' => '',
    ];

    return $data;
  }

  /**
   * A very primitive mock for the token service.
   *
   * The full token integration is tested separately.
   *
   * @param string $text
   * @param array  $data
   *
   * @return string
   */
  public static function tokenReplace($text, array $data): string {
    /** @var \Drupal\filelog\LogMessage $message */
    $message = $data['log'];
    return \strtr(
      $text,
      [
        '[log:message]' => $message->getText(),
        '[log:level]'   => $message->getLevel(),
      ]
    );
  }

}
