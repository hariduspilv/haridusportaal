<?php

namespace Drupal\sitemap\Tests;

use \Drupal\node\NodeInterface;

/**
 * Test the display of books based on sitemap settings.
 *
 * @group sitemap
 */
class SitemapBookTest extends SitemapBrowserTestBase {

  use SitemapTestTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = ['sitemap', 'book'];

  /**
   * The parent book node.
   *
   * @var NodeInterface
   */
  protected $book;

  /**
   * Nodes that make up the content of the book.
   *
   * @var NodeInterface[]
   */
  protected $nodes;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Create user then login.
    $this->user = $this->drupalCreateUser([
      'administer sitemap',
      'access sitemap',
      'create book content',
      'create new books',
      'administer book outlines',
    ]);
    $this->drupalLogin($this->user);

    $this->nodes = $this->createBook();
  }

  /**
   * Tests books.
   */
  public function testBooks() {
    // Assert that books are not included in the sitemap by default.
    $this->drupalGet('/sitemap');
    $elements = $this->cssSelect(".sitemap-plugin--book");
    $this->assertEquals(count($elements), 0, 'Books are not included.');

    // Configure sitemap to show the test book.
    $bid = $this->book->id();
    $nodes = $this->nodes;
    $edit = [
      'plugins[book:' . $bid . '][enabled]' => TRUE,
    ];
    $this->saveSitemapForm($edit);

    // Assert that all book links are displayed by default.
    $this->drupalGet('/sitemap');
    $this->assertSession()->linkExists($this->book->getTitle());
    foreach ($nodes as $node) {
      $this->assertSession()->linkExists($node->getTitle());
    }

    // Configure sitemap to not expand books.
    $edit = [
      'plugins[book:' . $bid . '][settings][show_expanded]' => FALSE,
    ];
    $this->saveSitemapForm($edit);

    // Assert that the top-level book link is displayed, but that the others are
    // not.
    $this->drupalGet('/sitemap');
    $this->assertSession()->linkExists($this->book->getTitle());
    foreach ($nodes as $node) {
      $this->assertSession()->linkNotExists($node->getTitle());
    }

  }

  /**
   * Tests a custom title setting for books.
   */
  public function testBooksCustomTitle() {
    $bid = $this->book->id();

    // Configure sitemap to show the test book.
    $this->saveSitemapForm(['plugins[book:' . $bid . '][enabled]' => TRUE]);

    $this->titleTest($this->book->label(), 'book', $bid,  TRUE);
  }

  // @TODO: test book crud
  // @TODO: test multiple books

  /**
   * Creates a new book with a page hierarchy. Adapted from BookTest.
   */
  protected function createBook() {
    $this->book = $this->createBookNode('new');
    $book = $this->book;

    /*
     * Add page hierarchy to book.
     * Node 00 (top level), created above
     *  |- Node 01
     *   |- Node 02
     *   |- Node 03
     *  |- Node 04
     *  |- Node 05
     */
    $nodes = [];
    $nodes[] = $this->createBookNode($book->id());
    $nodes[] = $this->createBookNode($book->id(), $nodes[0]->book['nid']);
    $nodes[] = $this->createBookNode($book->id(), $nodes[0]->book['nid']);
    $nodes[] = $this->createBookNode($book->id());
    $nodes[] = $this->createBookNode($book->id());

    return $nodes;
  }

  /**
   * Creates a book node. From BookTest.
   *
   * @param int|string $book_nid
   *   A book node ID or set to 'new' to create a new book.
   * @param int|null $parent
   *   (optional) Parent book reference ID. Defaults to NULL.
   *
   * @return NodeInterface
   *   Returns object
   *
   * @throws \Exception
   */
  protected function createBookNode($bid, $parent = NULL) {
    $edit = [
      'title[0][value]' => $this->randomMachineName(10),
      'book[bid]' => $bid
    ];

    if ($parent !== NULL) {
      $this->drupalPostForm('node/add/book', $edit, t('Change book (update list of parents)'));

      $edit['book[pid]'] = $parent;
      $this->drupalPostForm(NULL, $edit, t('Save'));
    }
    else {
      $this->drupalPostForm('node/add/book', $edit, t('Save'));
    }

    return $this->drupalGetNodeByTitle($edit['title[0][value]']);
  }

}
