<?php

declare(strict_types = 1);

namespace Drupal\Tests\openid_connect\Unit;

use Drupal\Core\Path\CurrentPathStack;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\Tests\UnitTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @coversDefaultClass \Drupal\openid_connect\OpenIDConnectSession
 * @group openid_connect
 */
class OpenIdConnectSessionTest extends UnitTestCase {

  /**
   * Create a test path for testing.
   */
  const TEST_PATH = '/test/path/1';

  /**
   * The user login path for testing.
   */
  const TEST_USER_PATH = '/user/login';

  /**
   * A query string to test with.
   */
  const TEST_QUERY = 'sport=baseball&team=reds';

  /**
   * A mock of the current_path service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $currentPath;

  /**
   * A mock of the requestStack method for testing.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $requestStack;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Mock the currentPath service.
    $this->currentPath = $this->createMock(CurrentPathStack::class);

    // Mock the Request class that is returned by RequestStack class.
    $request = $this->createMock(Request::class);
    $request->expects($this->once())
      ->method('getQueryString')
      ->willReturn('sport=baseball&team=reds');

    // Mock the requestStack service.
    $this->requestStack = $this->createMock(RequestStack::class);
    $this->requestStack->expects($this->once())
      ->method('getCurrentRequest')
      ->willReturn($request);
  }

  /**
   * Test the save destination method.
   */
  public function testSaveDestination(): void {
    // Get the expected session array.
    $expectedSession = $this->getExpectedSessionArray(
      self::TEST_PATH,
      self::TEST_QUERY
    );

    // Mock the getPath method for the current path service.
    $this->currentPath->expects($this->once())
      ->method('getPath')
      ->willReturn(self::TEST_PATH);

    // Create a new OpenIDConnectSession class.
    $session = new OpenIDConnectSession($this->currentPath, $this->requestStack);

    // Call the saveDestination() method.
    $session->saveDestination();

    // Assert the $_SESSOIN global matches our expectation.
    $this->assertArrayEquals($expectedSession, $_SESSION);
  }

  /**
   * Test the saveDestination() method with the /user/login path.
   */
  public function testSaveDestinationUserPath(): void {
    // Setup our expected results.
    $expectedSession = $this->getExpectedSessionArray(
      '/user',
      self::TEST_QUERY
    );

    // Mock the getPath method with the user path.
    $this->currentPath->expects($this->once())
      ->method('getPath')
      ->willReturn(self::TEST_USER_PATH);

    // Create a class to test with.
    $session = new OpenIDConnectSession($this->currentPath, $this->requestStack);

    // Call the saveDestination method.
    $session->saveDestination();

    // Assert the $_SESSION matches our expectations.
    $this->assertArrayEquals($expectedSession, $_SESSION);
  }

  /**
   * Get the expected session array to compare.
   *
   * @param string $path
   *   The path that is expected in the session global.
   * @param string $queryString
   *   The query string that is expected in the session global.
   *
   * @return array
   *   The expected session array.
   */
  private function getExpectedSessionArray(string $path, string $queryString): array {
    return [
      'openid_connect_destination' => [
        $path,
        [
          'query' => $queryString,
        ],
      ],
    ];
  }

}
