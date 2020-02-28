<?php

namespace Drupal\smtp\ConnectionTester;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\smtp\PHPMailer\PHPMailer;
use Drupal\smtp\Exception\PHPMailerException;

/**
 * Allows testing the SMTP connection.
 */
class ConnectionTester {

  use StringTranslationTrait;

  /**
   * These constants de not seem to be available outside of the .install file
   * so we need to declare them here.
   */
  const REQUIREMENT_OK = 0;
  const REQUIREMENT_ERROR = 2;

  /**
   * The severity of the connection issue; set during class construction.
   *
   * @var int
   */
  protected $severity;

  /**
   * Description of the connection, set during construction..
   *
   * @var string
   */
  protected $value;

  /**
   * Constructor.
   *
   * The connection is tested, and the "severity" and "value" parameters are
   * set during construction.
   */
  public function __construct() {
    $this->testConnection();
  }

  public function testConnection() {
    $mailer = $this->phpMailer();

    if (!$this->configGet('smtp_on')) {
      $this->severity = self::REQUIREMENT_OK;
      $this->value = $this->t('SMTP module is enabled but turned off.');
      return;
    }

    try {
      if ($mailer->SmtpConnect()) {
        $this->severity = self::REQUIREMENT_OK;
        $this->value = $this->t('SMTP module is enabled, turned on, and connection is valid.');
        return;
      }
      else {
        $this->severity = self::REQUIREMENT_ERROR;
        $this->value = $this->t('SMTP module is enabled, turned on, but SmtpConnect() returned FALSE.');
        return;
      }
    }
    catch (PHPMailerException $e) {
      $this->value = $this->t('SMTP module is enabled, turned on, but SmtpConnect() threw exception @e', [
        '@e' => $e->getMessage(),
      ]);
      $this->severity = self::REQUIREMENT_ERROR;
    }
    catch (\Exception $e) {
      $this->value = $this->t('SMTP module is enabled, turned on, but SmtpConnect() threw an unexpected exception');
      $this->severity = self::REQUIREMENT_ERROR;
    }

  }

  /**
   * Get a string explaining the connection status.
   *
   * @return string
   *   String explaining the current status of SMTP.
   */
  public function getValue() {
    return $this->value;
  }

  /**
   * Get the severity of the connection message (OK or error).
   *
   * @return int
   *   REQUIREMENT_OK (0) or REQUIREMENT_ERROR (2)
   */
  public function getSeverity() {
    return $this->severity;
  }

  /**
   * Testable implementation of hook_requirements().
   */
  public function hookRequirements(string $phase) {
    $requirements = [];
    if ($phase == 'runtime') {
      $requirements['smtp_connection'] = array(
        'title' => $this->t('SMTP connection'),
        'value' => $this->getValue(),
        'severity' => $this->getSeverity(),
      );
    }
    return $requirements;
  }

  /**
   * Get a PHPMailer object ready to be tested.
   *
   * @return \Drupal\smtp\PHPMailer\PHPMailer
   *   A PHPMailer object using the current configuration.
   */
  public function phpMailer() {
    static $mailer;

    if (!$mailer) {
      $mailer = new PHPMailer();
      // Set debug to FALSE for the connection test; further debugging can be
      // used when sending actual mails.
      $mailer->SMTPDebug = FALSE;
      $mailer->Host = $this->configGet('smtp_host') . ';' . $this->configGet('smtp_hostbackup');
      $mailer->Port = $this->configGet('smtp_port');
      $mailer->SMTPSecure == in_array($this->configGet('smtp_protocol'), ['ssl', 'tls']) ? $this->configGet('smtp_protocol') : '';
      if ($helo = $this->configGet('smtp_client_helo')) {
        $mailer->Helo = $helo;
      }
      if ($username = $this->configGet('smtp_username') && $password = $this->configGet('smtp_password')) {
        $mailer->SMTPAuth = TRUE;
        $mailer->Username = $username;
        $mailer->Password = $password;
      }
    }

    return $mailer;
  }

  /**
   * Get smtp.settings configuration.
   *
   * @param string $var
   *   The configuration variable, for example "smtp_username".
   *
   * @return mixed
   *   The value of the configuration.
   */
  public function configGet(string $var) {
    return \Drupal::config('smtp.settings')->get($var);
  }

}
