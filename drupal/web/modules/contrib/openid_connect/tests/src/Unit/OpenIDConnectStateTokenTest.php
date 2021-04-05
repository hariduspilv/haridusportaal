<?php

declare(strict_types = 1);

namespace Drupal\Tests\openid_connect\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\openid_connect\OpenIDConnectStateToken;

/**
 * Test the OpenIDConnectStateToken class.
 *
 * @coversDefaultClass \Drupal\openid_connect\OpenIDConnectStateToken
 * @group openid_connect
 */
class OpenIDConnectStateTokenTest extends UnitTestCase {

  /**
   * Mock of the openid_connect.state_token service.
   *
   * @var \Drupal\openid_connect\OpenIDConnectStateToken
   */
  protected $stateTokenService;

  /**
   * The state token created for these tests.
   *
   * @var string
   */
  protected $stateToken;

  /**
   * {@inheritDoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->stateTokenService = new OpenIDConnectStateToken();

    // Set the state token and save the results.
    $this->stateToken = $this->stateTokenService->create();
  }

  /**
   * Test the state tokens.
   *
   * @runInSeparateProcess
   */
  public function testConfirm(): void {
    // Confirm the session matches the state token variable.
    $confirmResultTrue = $this->stateTokenService->confirm($this->stateToken);
    $this->assertEquals(TRUE, $confirmResultTrue);

    // Assert the state token key in the session global.
    $this->assertArrayHasKey('openid_connect_state', $_SESSION);

    // Change the session variable.
    $_SESSION['openid_connect_state'] = $this->randomMachineName();
    $confirmResultFalse = $this->stateTokenService->confirm($this->stateToken);

    // Assert the expected value no longer matches the session.
    $this->assertEquals(FALSE, $confirmResultFalse);

    // Remove the session variable altogether.
    unset($_SESSION['openid_connect_state']);

    // Check the state token.
    $confirmResultEmpty = $this->stateTokenService->confirm($this->stateToken);

    // Assert the session global does not contain the state token.
    $this->assertEquals(FALSE, $confirmResultEmpty);
  }

}
