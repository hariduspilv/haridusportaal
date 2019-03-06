<?php

namespace Drupal\Tests\filelog\Unit;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityTypeRepositoryInterface;
use Drupal\Core\Logger\LogMessageParser;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Utility\Token;
use Drupal\filelog\LogMessage;
use Drupal\Tests\UnitTestCase;
use Drupal\user\Entity\User;

/**
 * Test the filelog message token integration.
 *
 * @group filelog
 */
class FileLogTokenTest extends UnitTestCase {

  /**
   * @var \Drupal\Core\Logger\LogMessageParserInterface
   */
  protected $logMessageParser;

  /**
   * @var \PHPUnit_Framework_MockObject_MockObject
   */
  protected $token;

  /**
   * @var \PHPUnit_Framework_MockObject_MockObject
   */
  protected $dateFormatter;

  /**
   * @var \PHPUnit_Framework_MockObject_MockObject
   */
  protected $userStorage;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Get from filelog/tests/src/Unit to filelog/.
    $root = \dirname(__DIR__, 3);
    require_once $root . '/filelog.tokens.inc';

    $this->logMessageParser = new LogMessageParser();

    $this->token = $this->getMockBuilder(Token::class)
      ->disableOriginalConstructor()
      ->getMock();

    $this->dateFormatter = $this->createMock(DateFormatterInterface::class);
    $entityTypeManager = $this->createMock(EntityTypeManagerInterface::class);
    $entityTypeRepository = $this->createMock(EntityTypeRepositoryInterface::class);
    $this->userStorage = $this->createMock(EntityStorageInterface::class);

    // Mock the User entity type resolution.
    $entityTypeRepository->expects($this->any())
      ->method('getEntityTypeFromClass')
      ->with(User::class)
      ->willReturn('user');

    // Mock the user entity storage (actual user-loading mocked each test.
    $entityTypeManager->expects($this->any())
      ->method('getStorage')
      ->with('user')
      ->willReturn($this->userStorage);

    $this->token->expects($this->any())
      ->method('findWithPrefix')
      ->willReturnCallback([static::class, 'tokenFindWithPrefix']);

    // Set up the container with the required mocks.
    $container = new ContainerBuilder();
    $container->set('token', $this->token);
    $container->set('date.formatter', $this->dateFormatter);
    $container->set('entity_type.manager', $entityTypeManager);
    $container->set('entity_type.repository', $entityTypeRepository);
    \Drupal::setContainer($container);
  }

  /**
   * Test the tokens of the log message.
   *
   * @param int    $level
   * @param string $message
   * @param array  $context
   *
   * @dataProvider providerMessages
   */
  public function testTokens($level, $message, array $context): void {
    $variables = $this->logMessageParser->parseMessagePlaceholders(
      $message,
      $context
    );
    $logMessage = new LogMessage($level, $message, $variables, $context);
    $levels = LogMessage::getLevels();

    $expectedTokens = [
      'type'           => $context['channel'],
      'level'          => $levels[$level],
      'message'        => strtr($message, $variables),
      'location'       => $context['request_uri'],
      'referrer'       => $context['referer'] ?? NULL,
      'ip'             => $context['ip'] ?? '0.0.0.0',
      'created'        => 'date:default:' . $context['timestamp'],
      'created:format' => 'date:format:' . $context['timestamp'],
      'user'           => 'user:' . $context['uid'],
      'user:token'     => 'user:token:' . $context['uid'],
    ];

    foreach ($variables as $name => $value) {
      $expectedTokens['variable:' . substr($name, 1)] = $value;
    }
    foreach ($context as $name => $value) {
      $expectedTokens['context:' . $name] = $value;
    }

    $tokens = [];
    foreach ($expectedTokens as $name => $value) {
      $tokens[$name] = 'log:' . $name;
    }

    $user = $this->getMockBuilder(User::class)
      ->disableOriginalConstructor()
      ->getMock();

    $this->userStorage->expects($this->once())
      ->method('load')
      ->with($context['uid'])
      ->willReturn($user);
    $user->expects($this->once())
      ->method('label')
      ->willReturn('user:' . $context['uid']);

    $this->dateFormatter->expects($this->once())
      ->method('format')
      ->with($context['timestamp'])
      ->willReturn('date:default:' . $context['timestamp']);

    $options = [];

    /** @var \Drupal\Core\Render\BubbleableMetadata $metadata */
    $metadata = $this->createMock(BubbleableMetadata::class);

    // Mock the token service calls.
    $this->token->expects($this->exactly(2))
      ->method('generate')
      ->withConsecutive(
        [
          'user',
          ['token' => 'log:user:token'],
          ['user' => $user],
          $options,
          $metadata,
        ],
        [
          'date',
          ['format' => 'log:created:format'],
          ['date' => $context['timestamp']],
          $options,
          $metadata,
        ]
      )
      ->willReturnOnConsecutiveCalls(
        ['log:user:token' => 'user:token:' . $context['uid']],
        [
          'log:created:format' => 'date:format:' .
                                  $context['timestamp'],
        ]
      );

    $values = \filelog_tokens(
      'log',
      $tokens,
      ['log' => $logMessage],
      $options,
      $metadata
    );

    // Check that each token was replaced by the correct value.
    foreach ($tokens as $name => $original) {
      $this->assertEquals($expectedTokens[$name], $values[$original]);
    }

    // Make sure that nothing else was replaced.
    $this->assertCount(\count($expectedTokens), $values);
  }

  /**
   * Data provider for messages.
   *
   * @return array
   */
  public function providerMessages(): array {
    return [
      [
        'level'   => RfcLogLevel::EMERGENCY,
        'message' => 'This is a message.',
        'context' => [
          'uid'         => 7,
          'ip'          => '255.255.255.255',
          'timestamp'   => 123456789,
          'channel'     => 'channel1',
          'request_uri' => 'a/b/c',
        ],
      ],
      [
        'level'   => RfcLogLevel::WARNING,
        'message' => 'This is message (@abc, %def, :ghi).',
        'context' => [
          '@abc'        => '.LD5}5~\"8AiU*VH',
          '%def'        => '6(0XvYDAhZ9.Ecd ',
          ':ghi'        => '7bU3p6ap4:G_1.w"',
          'uid'         => -1,
          'channel'     => 'channel2',
          'request_uri' => 'd/e/f',
          'timestamp'   => 0,
        ],
      ],
      [
        'level'   => RfcLogLevel::DEBUG,
        'message' => 'This is message (@abc).',
        'context' => [
          '@abc'        => '7bU3p6ap4:G_1.w"',
          'uid'         => 42,
          'ip'          => '0.0.0.0',
          'timestamp'   => 987654321,
          'referer'     => 'https://localhost',
          'channel'     => 'channel3',
          'request_uri' => 'g/h/i',
        ],
      ],
    ];
  }

  /**
   * Duplicate \Drupal\Core\Utility\Token::findWithPrefix as static.
   *
   * @param array  $tokens
   * @param string $prefix
   * @param string $delimiter
   *
   * @return array
   *
   * @see \Drupal\Core\Utility\Token::findWithPrefix()
   */
  public static function tokenFindWithPrefix(array $tokens, $prefix, $delimiter = ':'): array {
    $results = [];
    foreach ($tokens as $token => $raw) {
      $parts = \explode($delimiter, $token, 2);
      if (\count($parts) === 2 && $parts[0] === $prefix) {
        $results[$parts[1]] = $raw;
      }
    }
    return $results;
  }

}
