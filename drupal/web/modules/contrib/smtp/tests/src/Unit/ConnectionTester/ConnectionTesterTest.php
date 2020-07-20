<?php

namespace Drupal\Tests\smtp\Unit\ConnectionTester;

use Drupal\smtp\ConnectionTester\ConnectionTester;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Drupal\Tests\UnitTestCase;

/**
 * Validate requirements for ConnectionTester.
 *
 * @group SMTP
 */
class ConnectionTesterTest extends UnitTestCase {

  /**
   * Test for hookRequirements().
   *
   * @param string $message
   *   The test message.
   * @param bool $smtp_on
   *   Mock value of whether SMTP is on or not.
   * @param bool $result
   *   Mock result of ::SmtpConnect().
   * @param string $exception
   *   The exception, if any, that the mock SmtpConnect() should throw.
   * @param array $expected
   *   The expected result; ignored if an exception is expected.
   *
   * @cover ::hookRequirements
   * @dataProvider providerHookRequirements
   */
  public function testHookRequirements(string $message, bool $smtp_on, bool $result, string $exception, array $expected) {
    $object = $this->getMockBuilder(ConnectionTester::class)
      // NULL = no methods are mocked; otherwise list the methods here.
      ->setMethods([
        'phpMailer',
        'configGet',
        't',
      ])
      ->getMock();

    $object->method('phpMailer')
      ->willReturn(new class($exception, $result) {

        /**
         * Class Constructor.
         */
        function __construct($exception, $result) {
          $this->exception = $exception;
          $this->result = $result;
        }

        /**
         * Mock function for connection.
         */
        function smtpConnect() {
          if ($this->exception) {
            $class = $this->exception;
            throw new $class('EXCEPTION MESSAGE');
          }
          return $this->result;
        }

      });
    $object->method('configGet')
      ->will($this->returnCallback(function ($param) use ($smtp_on) {
        if ($param == 'smtp_on') {
          return $smtp_on;
        }
      }));
    $object->method('t')
      ->will($this->returnCallback(function ($x, $y = []) {
        return serialize([$x, $y]);
      }));

    $object->testConnection();
    $output = $object->hookRequirements('runtime');

    if ($output != $expected) {
      print_r([
        'message' => $message,
        'output' => $output,
        'expected' => $expected,
      ]);
    }

    $this->assertTrue($output == $expected, $message);
  }

  /**
   * Provider for testHookRequirements().
   */
  public function providerHookRequirements() {
    return [
      [
        'message' => 'SMTP on, working.',
        '$smtp_on' => TRUE,
        'result' => TRUE,
        'exception' => '',
        'expected' => [
          'smtp_connection' => [
            'title' => serialize(['SMTP connection', []]),
            'value' => serialize(['SMTP module is enabled, turned on, and connection is valid.', []]),
            'severity' => ConnectionTester::REQUIREMENT_OK,
          ],
        ],
      ],
      [
        'message' => 'SMTP on, result FALSE.',
        '$smtp_on' => TRUE,
        'result' => FALSE,
        'exception' => '',
        'expected' => [
          'smtp_connection' => [
            'title' => serialize(['SMTP connection', []]),
            'value' => serialize(['SMTP module is enabled, turned on, but SmtpConnect() threw an unexpected exception', []]),
            'severity' => ConnectionTester::REQUIREMENT_ERROR,
          ],
        ],
      ],
      [
        'message' => 'SMTP on, PHPMailerException.',
        '$smtp_on' => TRUE,
        'result' => FALSE,
        'exception' => PHPMailerException::class,
        'expected' => [
          'smtp_connection' => [
            'title' => serialize(['SMTP connection', []]),
            'value' => serialize(['SMTP module is enabled, turned on, but SmtpConnect() threw exception @e', [
              '@e' => 'EXCEPTION MESSAGE',
            ],
            ]),
            'severity' => ConnectionTester::REQUIREMENT_ERROR,
          ],
        ],
      ],
      [
        'message' => 'SMTP on, Exception.',
        '$smtp_on' => TRUE,
        'result' => FALSE,
        'exception' => \Exception::class,
        'expected' => [
          'smtp_connection' => [
            'title' => serialize(['SMTP connection', []]),
            'value' => serialize(['SMTP module is enabled, turned on, but SmtpConnect() threw an unexpected exception', []]),
            'severity' => ConnectionTester::REQUIREMENT_ERROR,
          ],
        ],
      ],
      [
        'message' => 'SMTP off.',
        '$smtp_on' => FALSE,
        'result' => FALSE,
        'exception' => '',
        'expected' => [
          'smtp_connection' => [
            'title' => serialize(['SMTP connection', []]),
            'value' => serialize(['SMTP module is enabled but turned off.', []]),
            'severity' => ConnectionTester::REQUIREMENT_OK,
          ],
        ],
      ],
    ];
  }

}
