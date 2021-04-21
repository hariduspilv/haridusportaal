<?php

namespace Drupal\Tests\sitemap\Functional\Update;

use Drupal\FunctionalTests\Update\UpdatePathTestBase;
use Drupal\sitemap\Plugin\Sitemap\Vocabulary;
use Drupal\views\Views;

/**
 * Tests the 1.x to 2.x upgrade path for Sitemap configuration.
 *
 * @group Update
 */
class SitemapVersionUpdateTest extends UpdatePathTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setDatabaseDumpFiles() {
    $this->databaseDumpFiles = [
      __DIR__ . '/../../../fixtures/update/sitemap-config-update-3140108.php.gz',
    ];
  }

  /**
   * Tests that field plugins are updated properly.
   */
  public function testUpdateHookN() {
    $this->runUpdates();

    $configFactory = \Drupal::configFactory();
    $config = $configFactory->get('sitemap.settings');

    // Verify config that should not have been changed.
    $this->assertEquals($config->get('page_title'), 'Custom page title', 'page_title is unchanged');
    $this->assertEquals($config->get('message')['value'], 'Custom sitemap message!', 'message value is unchanged');
    $this->assertEquals($config->get('message')['format'], 'restricted_html', 'message format is unchanged');

    // Verify config key renaming.
    $this->assertTrue($config->get('include_css'), 'include_css updated successfully');

    // Verify the removal of old config keys.
    $removed = [
      'css',
      'show_rss_links',
      'show_titles',
      'order',
      'show_front',
      'rss_front',
      'show_books',
      'books_expanded',
      'show_menus',
      'show_menus_hidden',
      'show_vocabularies',
      'show_description',
      'show_count',
      'vocabulary_depth',
      'vocabulary_show_links',
      'term_threshold',
      'rss_taxonomy',
    ];
    foreach ($removed as $key) {
      $this->assertNull($config->get($key), "$key was removed");
    }

    $this->assertNotNull($config->get('plugins'));
    $plugins = $config->get('plugins');

    // Verify frontpage configuration update.
    $this->assertNotEmpty($plugins['frontpage']);
    $frontpage = $plugins['frontpage'];
    $this->assertEquals($frontpage['enabled'], FALSE);
    $this->assertEquals($frontpage['weight'], -48);
    $this->assertEquals($frontpage['settings']['title'], 'Front page');
    $this->assertEquals($frontpage['settings']['rss'], '/custom-rss.xml');

    // Verify book configuration update.
    $this->assertNotEmpty($plugins['book:1']);
    $book1 = $plugins['book:1'];
    $this->assertEquals($book1['enabled'], TRUE);
    $this->assertEquals($book1['weight'], -41);
    $this->assertEquals($book1['settings']['title'], 'Book 1');

    $this->assertNotEmpty($plugins['book:2']);
    $book2 = $plugins['book:2'];
    $this->assertEquals($book2['enabled'], FALSE);
    $this->assertEquals($book2['weight'], -47);
    $this->assertEquals($book2['settings']['title'], 'Book 2');

    foreach ([$book1, $book2] as $book) {
      $settings = $book['settings'];
      $this->assertEquals($settings['show_expanded'], TRUE);
    }

    // Verify menu configuration update.
    $this->assertNotEmpty($plugins['menu:main']);
    $main = $plugins['menu:main'];
    $this->assertEquals($main['enabled'], TRUE);
    $this->assertEquals($main['weight'], -50);
    $this->assertEquals($main['settings']['title'], 'Custom menu title');

    $this->assertNotEmpty($plugins['menu:tools']);
    $tools = $plugins['menu:tools'];
    $this->assertEquals($tools['enabled'], FALSE);
    $this->assertEquals($tools['weight'], -43);
    $this->assertEquals($tools['settings']['title'], 'Tools');

    foreach ([$main, $tools] as $menu) {
      $settings = $menu['settings'];
      $this->assertEquals($settings['show_disabled'], FALSE);
    }

    // Verify vocabulary configuration update.
    $this->assertNotEmpty($plugins['vocabulary:tags']);
    $tags = $plugins['vocabulary:tags'];
    $this->assertEquals($tags['enabled'], TRUE);
    $this->assertEquals($tags['weight'], -42);
    $this->assertEquals($tags['settings']['title'], 'Tags');

    $this->assertNotEmpty($plugins['vocabulary:forums']);
    $forum = $plugins['vocabulary:forums'];
    $this->assertEquals($forum['enabled'], TRUE);
    $this->assertEquals($forum['weight'], -49);
    $this->assertEquals($forum['settings']['title'], 'Forums');

    $this->assertNotEmpty($plugins['vocabulary:test']);
    $test = $plugins['vocabulary:test'];
    $this->assertEquals($test['enabled'], FALSE);
    $this->assertEquals($test['weight'], -40);
    $this->assertEquals($test['settings']['title'], 'Test');

    foreach ([$tags, $forum, $test] as $vocab) {
      $settings = $vocab['settings'];
      $this->assertEquals($settings['show_description'], TRUE);
      $this->assertEquals($settings['show_count'], TRUE);
      $this->assertEquals($settings['term_depth'], Vocabulary::DEPTH_MAX);
      $this->assertEquals($settings['term_count_threshold'], Vocabulary::THRESHOLD_DISABLED);
      $this->assertEquals($settings['customize_link'], FALSE);
      $this->assertEquals($settings['term_link'], Vocabulary::DEFAULT_TERM_LINK);
      $this->assertEquals($settings['always_link'], FALSE);
      $this->assertEquals($settings['enable_rss'], TRUE);
      $this->assertEquals($settings['rss_link'], Vocabulary::DEFAULT_TERM_RSS_LINK);
      $this->assertEquals($settings['rss_depth'], Vocabulary::DEPTH_MAX);
    }

    // Tests that the third-party settings were removed from system.menu.main.
    $menuConfig = $configFactory->get('system.menu.main');
    $this->assertEmpty($menuConfig->get('third_party_settings.sitemap'));
  }

}
