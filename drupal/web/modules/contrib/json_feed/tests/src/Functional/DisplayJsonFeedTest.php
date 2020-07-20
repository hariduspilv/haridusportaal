<?php

namespace Drupal\Tests\json_feed\Functional;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Url;
use Drupal\Tests\views\Functional\ViewTestBase;
use Drupal\views\Tests\ViewTestData;

/**
 * Tests the json_feed display plugin.
 *
 * @group views
 * @see \Drupal\json_feed\Plugin\views\display\JsonFeed
 */
class DisplayJsonFeedTest extends ViewTestBase {

  const ADMIN_NAME = 'John Appleseed';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'block',
    'node',
    'views',
    'json_feed',
    'json_feed_test_views',
  ];


  /**
   * Set theme for testing.
   *
   * @var string
   */
  protected $defaultTheme = 'stark';

  /**
   * Views used by this test.
   *
   * @var array
   */
  public static $testViews = ['test_display_json_feed'];

  /**
   * Path to the JSON Feed feed.
   *
   * @var string
   */
  protected $feedPath = 'test-json-feed-display/json';

  /**
   * The JSON Feed attributes that allow HTML markup.
   *
   * @var array
   */
  protected $htmlAllowedAttributes = ['content_html'];

  /**
   * Expected number of items per page.
   *
   * @var int
   */
  protected $feedItemsPerPage = 10;

  /**
   * The number of test nodes to create.
   *
   * @var int
   */
  protected $nodesToCreate = 25;

  /**
   * {@inheritdoc}
   */
  protected function setUp($import_test_views = TRUE) {
    parent::setUp();

    ViewTestData::createTestViews(get_class($this), ['json_feed_test_views']);

    $admin_user = $this->drupalCreateUser(['administer site configuration'], self::ADMIN_NAME);
    $this->drupalLogin($admin_user);

    $this->drupalCreateContentType(['type' => 'page']);

    $node_data = [
      'title' => 'This "cool" & "neat" article\'s title',
      'body' => [
        0 => [
          // Verify content with HTML entities is properly escaped.
          'value' => '<p>A <em>paragraph</em>.</p>',
          'format' => filter_default_format(),
        ],
      ],
    ];

    for ($i = 0; $i < $this->nodesToCreate; $i++) {
      $this->drupalCreateNode($node_data);
    }
  }

  /**
   * Tests the rendered feed output.
   */
  public function testFeedOutput() {
    $json_response = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    $this->assertResponse(200);

    $this->assertTrue(array_key_exists('version', $json_response), 'JSON Feed version present.');
    $this->assertEqual('https://jsonfeed.org/version/1', $json_response['version'], 'JSON Feed version set correctly.');

    $this->assertTrue(array_key_exists('title', $json_response), 'JSON Feed title present.');
    $this->assertEqual('test_display_json_feed', $json_response['title'], 'JSON Feed title set correctly.');

    $this->assertTrue(array_key_exists('description', $json_response), 'JSON Feed description present.');
    $this->assertEqual('Test feed description.', $json_response['description'], 'JSON Feed description set correctly.');

    $this->assertTrue(array_key_exists('home_page_url', $json_response), 'JSON Feed home_page_url present.');
    // @TODO: Implement test for home_page_url attribute value.

    $this->assertTrue(array_key_exists('feed_url', $json_response), 'JSON Feed feed_url present.');
    $this->assertTrue(strpos($json_response['feed_url'], $this->feedPath) !== FALSE, 'JSON Feed feed_url set correctly.');

    $this->assertTrue(array_key_exists('favicon', $json_response), 'JSON Feed favicon present.');
    $favicon_path = Url::fromUserInput(theme_get_setting('favicon.url'))->setAbsolute()->toString();
    $this->assertEqual($favicon_path, $json_response['favicon'], 'JSON Feed favicon set correctly.');

    $this->assertTrue(array_key_exists('expired', $json_response), 'JSON Feed expired attribute present.');
    $this->assertEqual(FALSE, $json_response['expired'], 'JSON Feed expired attribute set to FALSE.');
  }

  /**
   * Tests the feed items.
   */
  public function testFeedItems() {
    $json_response = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    $this->assertEqual($this->expectedFirstPageItems(), count($json_response['items']), 'JSON Feed returned ' . $this->expectedFirstPageItems() . ' items.');
    $item = $json_response['items'][0];

    $this->assertTrue(array_key_exists('date_published', $item), 'JSON Feed item date_published attribute present.');
    $this->assertTrue(array_key_exists('date_modified', $item), 'JSON Feed item date_modified attribute present.');
    $this->assertTrue(array_key_exists('tags', $item), 'JSON Feed item tags attribute present.');

    // @TODO: Test remaining item attributes.
  }

  /**
   * Test the author feed items.
   */
  public function testFeedItemAuthor() {
    $json_response = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    $item = $json_response['items'][0];
    $this->assertTrue(array_key_exists('author', $item), 'JSON Feed item author attribute present.');
    $author_info = $item['author'];
    $this->assertTrue(array_key_exists('name', $author_info), 'JSON Feed item author name attribute present.');
    $this->assertEqual(self::ADMIN_NAME, $author_info['name'], 'JSON Feed item author name set correctly.');
  }

  /**
   * Test fields that should not include HTML.
   */
  public function testHtmlPresence() {
    $json_response = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    array_walk_recursive($json_response, function ($item, $key) {
      if (!is_array($item) && !in_array($key, $this->htmlAllowedAttributes)) {
        $this->assertEqual(strip_tags($item), $item, 'JSON Feed item: \'' . $key . '\' does not contain HTML.');
      }
    });
  }

  /**
   * Test feed item pagination.
   */
  public function testFeedPagnation() {
    $feed_content = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    if ($this->feedItemsPerPage < $this->nodesToCreate) {
      $this->assertTrue(array_key_exists('next_url', $feed_content), 'JSON Feed next_url attribute present.');
    }
    else {
      $this->assertFalse(array_key_exists('next_url', $feed_content), 'JSON Feed next_url attribute not present.');
    }
    $this->assertEqual($this->expectedFirstPageItems(), count($feed_content['items']), 'JSON Feed first page returned ' . $this->expectedFirstPageItems() . ' items.');
  }

  /**
   * Test last page of feed items.
   */
  public function testFeedLastPage() {
    $feed_content = $this->getFeedLastPage();

    $this->assertFalse(array_key_exists('next_url', $feed_content), 'JSON Feed next_url attribute not present on last page.');
    $expectedLastPageItemsCount = $this->nodesToCreate % $this->feedItemsPerPage;
    $this->assertEqual($expectedLastPageItemsCount, count($feed_content['items']), 'JSON Feed last page returned ' . $expectedLastPageItemsCount . ' items.');
  }

  /**
   * Retrieve subsequent page of feed items.
   *
   * @param array $feed_content
   *   An array of JSON feed attributes/items.
   *
   * @return array
   *   An array of JSON feed attributes/items.
   */
  protected function getFeedNextPage(array $feed_content) {
    if (empty($feed_content['next_url'])) {
      return NULL;
    }
    return Json::decode($this->drupalGet($feed_content['next_url'], ['query' => ['_format' => 'json']]));
  }

  /**
   * Retrieve last page of feed items.
   *
   * @return array
   *   An array of JSON feed attributes/items.
   */
  protected function getFeedLastPage() {
    $feed_content = Json::decode($this->drupalGet($this->feedPath, ['query' => ['_format' => 'json']]));
    if (empty($feed_content['next_url'])) {
      return $feed_content;
    }
    while (!empty($feed_content['next_url'])) {
      $feed_content = $this->getFeedNextPage($feed_content);
    }
    return $feed_content;
  }

  /**
   * Calculates the expected number of items on the feed's first page.
   *
   * @return int
   *   The expected number of items on the feed's first page.
   */
  protected function expectedFirstPageItems() {
    return min($this->feedItemsPerPage, $this->nodesToCreate);
  }

}
