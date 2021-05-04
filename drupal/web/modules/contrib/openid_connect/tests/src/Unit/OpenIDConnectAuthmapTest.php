<?php

declare(strict_types = 1);

namespace Drupal\Tests\openid_connect\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Database\Query\Insert;
use Drupal\openid_connect\OpenIDConnectAuthmap;
use Drupal\Core\Database\Query\Delete;
use Drupal\Core\Database\Query\SelectInterface;
use Drupal\user\Entity\User;

/**
 * Test the OpenIdConnectAuthmap class.
 *
 * @coversDefaultClass \Drupal\openid_connect\OpenIDConnectAuthmap
 * @group openid_connect
 */
class OpenIDConnectAuthmapTest extends UnitTestCase {

  /**
   * The user_id to test.
   */
  const USER_ID = 1999;

  /**
   * Mock of the EntityStorageInterface for User objects.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $userStorage;

  /**
   * Mock the database connection service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $connection;

  /**
   * Mock of the current_user service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $account;

  /**
   * Mock of the entity_type.manager service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $entityTypeManager;

  /**
   * {@inheritDoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->account = $this
      ->createMock(AccountInterface::class);

    $this->connection = $this
      ->createMock(Connection::class);

    $this->userStorage = $this->createMock(EntityStorageInterface::class);

    $this->entityTypeManager = $this->createMock(EntityTypeManagerInterface::class);
    $this->entityTypeManager->expects($this->once())
      ->method('getStorage')
      ->willReturn($this->userStorage);
  }

  /**
   * Test the createAssociation method.
   */
  public function testCreateAssociationMethod(): void {
    $client_name = 'generic';
    $sub = 'subject';

    $this->account->expects($this->exactly(2))
      ->method('id')
      ->willReturn(self::USER_ID);

    $selectInterface = $this->createMock(SelectInterface::class);
    $selectInterface->expects($this->once())
      ->method('fields')
      ->with('a', ['client_name', 'sub'])
      ->willReturnSelf();

    $selectInterface->expects($this->at(1))
      ->method('condition')
      ->with('uid', self::USER_ID)
      ->willReturnSelf();

    $selectInterface->expects($this->at(2))
      ->method('condition')
      ->with('client_name', $client_name)
      ->willReturnSelf();

    $selectInterface->expects($this->once())
      ->method('execute')
      ->willReturn([]);

    $this->connection->expects($this->once())
      ->method('select')
      ->willReturn($selectInterface);

    $queryInsert = $this->createMock(Insert::class);
    $queryInsert->expects($this->once())
      ->method('fields')
      ->with([
        'uid' => self::USER_ID,
        'client_name' => $client_name,
        'sub' => $sub,
      ])
      ->willReturnSelf();

    $queryInsert->expects($this->once())
      ->method('execute')
      ->willReturn(1);

    $this->connection->expects($this->once())
      ->method('insert')
      ->with('openid_connect_authmap')
      ->willReturn($queryInsert);

    $authMapClass = new OpenIDConnectAuthmap(
      $this->connection,
      $this->entityTypeManager
    );

    $authMapClass->createAssociation(
      $this->account,
      'generic',
      'subject'
    );
  }

  /**
   * Test the deleteAssociationMethod.
   *
   * @param string|null $client
   *   The client name to test or an empty client.
   *
   * @dataProvider getDeleteAssociationParameters
   */
  public function testDeleteAssociationMethod(?string $client): void {
    $deleteQuery = $this->createMock(Delete::class);

    if (!empty($client)) {
      $deleteQuery->expects($this->exactly(2))
        ->method('condition')
        ->withConsecutive(
          ['uid', self::USER_ID, '='],
          ['client_name', $client, '=']
        )
        ->willReturnSelf();
    }
    else {
      $deleteQuery->expects($this->once())
        ->method('condition')
        ->with('uid', self::USER_ID, '=')
        ->willReturnSelf();
    }

    $deleteQuery->expects($this->once())
      ->method('execute')
      ->willReturn(1);

    $this->connection->expects($this->once())
      ->method('delete')
      ->with('openid_connect_authmap')
      ->willReturn($deleteQuery);

    $authMapClass = new OpenIDConnectAuthmap(
      $this->connection,
      $this->entityTypeManager
    );

    $authMapClass->deleteAssociation(
      self::USER_ID,
      $client
    );
  }

  /**
   * Provide data to the testDeleteAssociationMethod test.
   *
   * @return array
   *   Return the client names to test.
   */
  public function getDeleteAssociationParameters(): array {
    return [
      [''],
      ['test_client'],
    ];
  }

  /**
   * Test for the userLoadBySub method.
   *
   * @param string $sub
   *   The sub to test.
   * @param string $client
   *   The client to test.
   * @param array $results
   *   The results to return.
   *
   * @dataProvider getUserLoadBySubParameters
   */
  public function testUserLoadBySubMethod(string $sub, string $client, array $results): void {
    if (!empty($results)) {
      $account = $this->createMock(User::class);
      $this->userStorage->expects($this->once())
        ->method('load')
        ->willReturn($account);
    }

    $selectMock = $this
      ->createMock(SelectInterface::class);

    $selectMock->expects($this->once())
      ->method('fields')
      ->with('a', ['uid'])
      ->willReturnSelf();

    $selectMock->expects($this->exactly(2))
      ->method('condition')
      ->withConsecutive(
        ['client_name', $client, '='],
        ['sub', $sub, '=']
      )
      ->willReturnSelf();

    $selectMock->expects($this->once())
      ->method('execute')
      ->willReturn($results);

    $this->connection->expects($this->once())
      ->method('select')
      ->willReturn($selectMock);

    $authMapClass = new OpenIDConnectAuthmap(
      $this->connection,
      $this->entityTypeManager
    );

    $actualResult = $authMapClass->userLoadBySub(
      $sub,
      $client
    );

    if (empty($results)) {
      $this->assertEquals(FALSE, $actualResult);
    }
    else {
      $this->assertInstanceOf('\Drupal\Core\Entity\EntityInterface', $actualResult);
    }
  }

  /**
   * Data provider for the userLoadBySubMethod().
   *
   * @return array|array[]
   *   The parameters to pass to the userLoadBySubMethod.
   */
  public function getUserLoadBySubParameters(): array {
    $test = (object) [
      'uid' => self::USER_ID,
    ];
    $results = [
      $test,
    ];

    return [
      ['', '', []],
      ['sub', '', []],
      ['', 'client', []],
      ['sub', 'client', []],
      ['', '', $results],
      ['sub', '', $results],
      ['', 'client', $results],
      ['sub', 'client', $results],
    ];
  }

  /**
   * Test the getConnectedAccounts method.
   *
   * @param array $results
   *   The results returned from the database query.
   *
   * @dataProvider getConnectedAccountsParameters
   */
  public function testGetConnectedAccounts(array $results): void {
    $account = $this->createMock(User::class);
    $account->expects($this->once())
      ->method('id')
      ->willReturn(self::USER_ID);

    $selectInterface = $this->createMock(SelectInterface::class);
    $selectInterface->expects($this->once())
      ->method('fields')
      ->with('a', ['client_name', 'sub'])
      ->willReturnSelf();

    $selectInterface->expects($this->once())
      ->method('condition')
      ->with('uid', self::USER_ID)
      ->willReturnSelf();

    $selectInterface->expects($this->once())
      ->method('execute')
      ->willReturn($results);

    $this->connection->expects($this->once())
      ->method('select')
      ->willReturn($selectInterface);

    $authMapClass = new OpenIDConnectAuthmap(
      $this->connection,
      $this->entityTypeManager
    );

    $actualResult = $authMapClass->getConnectedAccounts(
      $account
    );

    if (!empty($results)) {
      $record = array_shift($results);
      $expected = [
        $record->client_name => $record->sub,
      ];

      $this->assertArrayEquals($expected, $actualResult);
    }
    else {
      $this->assertEmpty($actualResult);
    }
  }

  /**
   * Data provider for the getConnectedAccounts method.
   *
   * @return array
   *   Data to test the getConnectedAccounts method.
   */
  public function getConnectedAccountsParameters(): array {
    $record = (object) [
      'client_name' => $this->randomMachineName(),
      'sub' => $this->randomMachineName(),
    ];

    return [
      [[]],
      [[$record]],
    ];
  }

}
