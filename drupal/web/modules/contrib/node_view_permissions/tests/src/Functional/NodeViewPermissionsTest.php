<?php

namespace Drupal\Tests\node_view_permissions\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tests for Node View Permissions.
 *
 * @group node_view_permissions
 */
class NodeViewPermissionsTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['node_view_permissions'];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    $this->drupalCreateContentType(['type' => 'article']);

    node_access_rebuild();
  }

  /**
   * Test users with a "view own content" permission.
   *
   * Ensure that these users can view nodes of this type that they created.
   *
   * @throws \Behat\Mink\Exception\ExpectationException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function testViewOwn() {
    $user1 = $this->drupalCreateUser(['view own article content']);
    $user2 = $this->drupalCreateUser(['view own article content']);

    $node = $this->drupalCreateNode([
      'type' => 'article',
      'uid' => $user1->id(),
    ]);

    $lookup = [
      [$user1, Response::HTTP_OK],
      [$user2, Response::HTTP_FORBIDDEN],
    ];

    foreach ($lookup as $i) {
      list($user, $expected) = $i;

      $this->drupalLogin($user);

      $this->drupalGet(Url::fromRoute('entity.node.canonical', [
        'node' => $node->id(),
      ]));

      $this->assertSession()->statusCodeEquals($expected);
    }
  }

  /**
   * Test users with a "view any content" permission.
   *
   * Ensure that these users can view any node of this type, including ones
   * that they did not create.
   *
   * @throws \Behat\Mink\Exception\ExpectationException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function testViewAny() {
    $user1 = $this->drupalCreateUser(['view any article content']);
    $user2 = $this->drupalCreateUser(['view any article content']);

    $node = $this->drupalCreateNode([
      'type' => 'article',
      'uid' => $user1->id(),
    ]);

    foreach ([$user1, $user2] as $user) {
      $this->drupalLogin($user);

      $this->drupalGet(Url::fromRoute('entity.node.canonical', [
        'node' => $node->id(),
      ]));

      $this->assertSession()->statusCodeEquals(Response::HTTP_OK);
    }
  }

}
