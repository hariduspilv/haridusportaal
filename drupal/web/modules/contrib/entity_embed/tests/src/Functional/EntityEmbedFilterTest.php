<?php

namespace Drupal\Tests\entity_embed\Functional;

use Drupal\Component\Utility\Html;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\filter\FilterPluginCollection;

/**
 * Tests the entity_embed filter.
 *
 * @group entity_embed
 */
class EntityEmbedFilterTest extends EntityEmbedTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'content_translation',
    'file',
    'image',
    'entity_embed',
    'entity_embed_test',
    'node',
    'ckeditor',
  ];

  /**
   * The entity embed filter.
   *
   * @var \Drupal\entity_embed\Plugin\Filter\EntityEmbedFilter
   */
  protected $filter;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $manager = $this->container->get('plugin.manager.filter');
    $bag = new FilterPluginCollection($manager, []);
    $this->filter = $bag->get('entity_embed');
  }

  /**
   * Tests the entity_embed filter.
   *
   * Ensures that entities are getting rendered when correct data attributes
   * are passed. Also tests situations when embed fails.
   */
  public function testFilter() {
    $assert_session = $this->assertSession();

    // Tests entity embed using entity ID and view mode.
    $content = '<drupal-entity data-entity-type="node" data-entity-id="' . $this->node->id() . '" data-view-mode="teaser">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with entity-id and view-mode';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-id="1" data-view-mode="teaser" data-entity-uuid="' . $this->node->uuid() . '" data-langcode="en" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" class="embedded-entity">');

    // Tests that embedded entity is not rendered if not accessible.
    $this->node->setPublished(FALSE)->save();
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test un-accessible entity embed with entity-id and view-mode';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseNotContains($this->node->body->value);
    // Verify placeholder does not appear in the output when embed is
    // successful.
    $this->assertSession()->responseNotContains(strip_tags($content));
    // Tests that embedded entity is displayed to the user who has
    // the view unpublished content permission.
    $this->createRole(['view own unpublished content'], 'access_unpublished');
    $this->webUser->addRole('access_unpublished');
    $this->webUser->save();
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-id="1" data-view-mode="teaser" data-entity-uuid="' . $this->node->uuid() . '" data-langcode="en" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" class="embedded-entity">');
    $this->webUser->removeRole('access_unpublished');
    $this->webUser->save();
    $this->node->setPublished(TRUE)->save();

    // Tests entity embed using entity UUID and view mode.
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with entity-uuid and view-mode';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser" data-langcode="en" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" class="embedded-entity">');
    $this->assertSession()->responseHeaderContains('X-Drupal-Cache-Tags', 'foo:' . $this->node->id());

    // Ensure that placeholder is not replaced when embed is unsuccessful.
    $content = '<drupal-entity data-entity-type="node" data-entity-id="InvalidID" data-view-mode="teaser">This placeholder should be rendered since specified entity does not exists.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test that placeholder is retained when specified entity does not exists';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');

    // Ensure that UUID is preferred over ID when both attributes are present.
    $sample_node = $this->drupalCreateNode();
    $content = '<drupal-entity data-entity-type="node" data-entity-id="' . $sample_node->id() . '" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test that entity-uuid is preferred over entity-id when both attributes are present';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseNotContains('<drupal-entity data-entity-type="node" data-entity');
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains($sample_node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-id="' . $sample_node->id() . '" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser" data-langcode="en" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" class="embedded-entity">');

    // Test deprecated 'default' Entity Embed Display plugin.
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="default" data-entity-embed-display-settings=\'{"view_mode":"teaser"}\'>This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with entity-embed-display and data-entity-embed-display-settings';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    // Verify that the embedded node exists in page.
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" data-langcode="en" class="embedded-entity">');

    // Ensure that Entity Embed Display plugin is preferred over view mode when
    // both attributes are present.
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="default" data-entity-embed-display-settings=\'{"view_mode":"full"}\' data-view-mode="some-invalid-view-mode" data-align="left" data-caption="test caption">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with entity-embed-display and data-entity-embed-display-settings';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    // Verify embedded node exists in page with the view mode specified
    // by entity-embed-settings.
    $this->assertSession()->responseContains($this->node->body->value);
    $this->assertSession()->responseNotContains('This placeholder should not be rendered.');
    $this->assertSession()->elementExists('css', 'figure.caption-drupal-entity.align-left div.embedded-entity[data-entity-embed-display="entity_reference:entity_reference_entity_view"][data-entity-embed-display-settings="full"][data-entity-type="node"][data-entity-uuid="' . $this->node->uuid() . '"][data-view-mode="some-invalid-view-mode"][data-langcode="en"]');
    $this->assertSession()->elementTextContains('css', 'figure.caption-drupal-entity.align-left figcaption', 'test caption');

    // Ensure the embedded node doesn't contain data tags on the full page.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->responseNotContains('data-align="left"');
    $this->assertSession()->responseNotContains('data-caption="test caption"');

    // Test that tag of container element is not replaced when it's not
    // <drupal-entity>.
    $content = '<not-drupal-entity data-entity-type="node" data-entity-id="' . $this->node->id() . '" data-view-mode="teaser">this placeholder should not be rendered.</not-drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'test entity embed with entity-id and view-mode';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalget('node/' . $node->id());
    $this->assertSession()->responseNotContains($this->node->body->value);
    $this->assertSession()->responseContains('</not-drupal-entity>');
    $content = '<div data-entity-type="node" data-entity-id="' . $this->node->id() . '" data-view-mode="teaser">this placeholder should not be rendered.</div>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'test entity embed with entity-id and view-mode';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalget('node/' . $node->id());
    $this->assertSession()->responseNotContains($this->node->body->value);
    $this->assertSession()->responseContains('<div data-entity-type="node" data-entity-id');

    // Test that attributes are correctly added when image formatter is used.
    /** @var \Drupal\file\FileInterface $image */
    $image = $this->getTestFile('image');
    $image->setPermanent();
    $image->save();
    $content = '<drupal-entity data-entity-type="file" data-entity-uuid="' . $image->uuid() . '" data-entity-embed-display="image:image" data-entity-embed-display-settings=\'{"image_style":"","image_link":""}\' data-align="left" data-caption="test caption" alt="This is alt text" title="This is title text">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'test entity image formatter';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalget('node/' . $node->id());
    $this->assertSession()->elementExists('css', 'figure.caption-drupal-entity.align-left div.embedded-entity[alt="This is alt text"][data-entity-embed-display="image:image"][data-entity-type="file"][data-entity-uuid="' . $image->uuid() . '"][title="This is title text"][data-langcode="en"] img[src][alt="This is alt text"][title="This is title text"]');
    $this->assertSession()->elementTextContains('css', 'figure.caption-drupal-entity.align-left figcaption', 'test caption');

    // data-entity-embed-settings is replaced with
    // data-entity-embed-display-settings. Check to see if
    // data-entity-embed-settings is still working.
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with data-entity-embed-settings';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->elementExists('css', 'figure.caption-drupal-entity.align-left div.embedded-entity[data-entity-embed-display="entity_reference:entity_reference_label"][data-entity-type="node"][data-entity-uuid="' . $this->node->uuid() . '"][data-langcode="en"]');
    $this->assertSession()->elementTextContains('css', 'figure.caption-drupal-entity.align-left div.embedded-entity', 'Embed Test Node');
    $this->assertSession()->elementTextContains('css', 'figure.caption-drupal-entity.align-left figcaption', 'test caption');

    // Tests entity embed using custom attribute and custom data- attribute.
    $content = '<drupal-entity data-foo="bar" foo="bar" data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser">This placeholder should not be rendered.</drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Test entity embed with custom attributes';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $this->assertSession()->responseContains('<div data-foo="bar" foo="bar" data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-view-mode="teaser" data-langcode="en" data-entity-embed-display="entity_reference:entity_reference_entity_view" data-entity-embed-display-settings="teaser" class="embedded-entity">');

    // Tests the placeholder for missing entities.
    $embedded_node = $this->drupalCreateNode([
      'type' => 'page',
      'title' => 'Embedded node',
      'body' => [['value' => 'Embedded text content', 'format' => 'custom_format']],
    ]);
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $embedded_node->uuid() . '" data-view-mode="default"></drupal-entity>';
    $settings = [];
    $settings['type'] = 'page';
    $settings['title'] = 'Host node';
    $settings['body'] = [['value' => $content, 'format' => 'custom_format']];
    $node = $this->drupalCreateNode($settings);
    $this->drupalGet('node/' . $node->id());
    $assert_session->pageTextContains('Embedded text content');
    $assert_session->elementNotExists('css', 'img[alt^="Deleted content encountered, site owner alerted"]');
    $embedded_node->delete();
    $this->drupalGet('node/' . $node->id());
    $assert_session->pageTextNotContains('Embedded text content');
    $placeholder = $assert_session->elementExists('css', 'img[alt^="Deleted content encountered, site owner alerted"]');
    $this->assertTrue(strpos($placeholder->getAttribute('src'), 'core/modules/media/images/icons/no-thumbnail.png') > 0);
  }

  /**
   * Tests the filter in different translation contexts.
   */
  public function testTranslation() {
    $content = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption">This placeholder should not be rendered.</drupal-entity>';

    ConfigurableLanguage::createFromLangcode('pt-br')->save();
    $host_entity = $this->drupalCreateNode([
      'type' => 'page',
      'body' => [
        'value' => $content,
        'format' => 'custom_format',
      ],
    ]);
    $this->drupalGet($host_entity->toUrl());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($host_entity->getTitle());
    $this->assertSession()->pageTextContains($this->node->getTitle());

    // Translate the host entity, but keep the same body; only change the title.
    $translated_host_entity = $host_entity->addTranslation('pt-br')
      ->getTranslation('pt-br')
      ->setTitle('Em portugues')
      ->set('body', $host_entity->get('body')->getValue());
    $translated_host_entity->save();
    $this->drupalGet('/pt-br/node/' . $host_entity->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($translated_host_entity->getTitle());
    // The embedded node does not have a Portuguese translation, so it should
    // display in English.
    $this->assertSession()->pageTextContains($this->node->getTitle());

    // Translate the embedded entity to the same language as the host entity.
    $this->node = Node::load($this->node->id());
    $this->node->addTranslation('pt-br')
      ->getTranslation('pt-br')
      ->setTitle('Embed em portugues')
      ->save();
    $this->getSession()->reload();
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($translated_host_entity->getTitle());
    // The translated host entity now should show the matching translation of
    // the embedded entity.
    $this->assertSession()->pageTextContains($this->node->getTranslation('pt-br')->getTitle());

    // Change the translated host entity to explicitly embed the untranslated
    // entity.
    $translated_host_entity->body->value = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption" data-langcode="' . $host_entity->language()->getId() . '">This placeholder should not be rendered.</drupal-entity>';
    $translated_host_entity->save();
    $this->getSession()->reload();
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($translated_host_entity->getTitle());
    $this->assertSession()->pageTextContains($this->node->getTitle());

    // Change the untranslated host entity to explicitly embed the Portuguese
    // translation of the embedded entity.
    $host_entity->body->value = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption" data-langcode="pt-br">This placeholder should not be rendered.</drupal-entity>';
    $host_entity->save();
    $this->drupalGet('/node/' . $host_entity->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($host_entity->getTitle());
    $this->assertSession()->pageTextContains($this->node->getTranslation('pt-br')->getTitle());

    // Change the untranslated host entity to explicitly embed a non-existing
    // translation of the embedded entity; this should fall back to the default
    // translation.
    $host_entity->body->value = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption" data-langcode="nl">This placeholder should not be rendered.</drupal-entity>';
    $host_entity->save();
    $this->getSession()->reload();
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($host_entity->getTitle());
    $this->assertSession()->pageTextContains($this->node->getTitle());

    // Change the translated host entity to explicitly embed a non-existing
    // translation of the embedded entity; this should fall back to the default
    // translation.
    $translated_host_entity->body->value = '<drupal-entity data-entity-type="node" data-entity-uuid="' . $this->node->uuid() . '" data-entity-embed-display="entity_reference:entity_reference_label" data-entity-embed-settings=\'{"link":"0"}\' data-align="left" data-caption="test caption" data-langcode="nl">This placeholder should not be rendered.</drupal-entity>';
    $translated_host_entity->save();
    $this->drupalGet('/pt-br/node/' . $host_entity->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains($translated_host_entity->getTitle());
    $this->assertSession()->pageTextContains($this->node->getTitle());
  }

  /**
   * Tests that embeds are not render cached, and can have per-embed overrides.
   */
  public function testOverridesAndRenderCaching() {
    \Drupal::service('file_system')->copy(\Drupal::root() . '/core/misc/druplicon.png', 'public://batfish.jpg');
    /** @var \Drupal\file\FileInterface $file */
    $file = File::create([
      'uri' => 'public://batfish.jpg',
      'uid' => $this->webUser->id(),
    ]);
    $file->save();

    $this->createNode([
      'type' => 'article',
      'title' => 'Red-lipped batfish',
    ]);

    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Screaming hairy armadillo',
      'field_media_image' => [
        [
          'target_id' => $file->id(),
          'alt' => 'default alt',
          'title' => 'default title',
        ],
      ],
    ]);
    $media->save();

    // Test the same embed with different alt and title text.
    $input = $this->createEmbedCode([
      'alt' => 'alt 1',
      'title' => 'title 1',
      'data-embed-button' => 'test_media_entity_embed',
      'data-entity-embed-display' => 'view_mode:media.embed',
      'data-entity-embed-display-settings' => '',
      'data-entity-type' => 'media',
      'data-entity-uuid' => $media->uuid(),
      'data-langcode' => 'en',
    ]);
    $input .= $this->createEmbedCode([
      'alt' => 'alt 2',
      'title' => 'title 2',
      'data-embed-button' => 'test_media_entity_embed',
      'data-entity-embed-display' => 'view_mode:media.embed',
      'data-entity-embed-display-settings' => '',
      'data-entity-type' => 'media',
      'data-entity-uuid' => $media->uuid(),
      'data-langcode' => 'en',
    ]);
    $input .= $this->createEmbedCode([
      'alt' => 'alt 3',
      'title' => 'title 3',
      'data-embed-button' => 'test_media_entity_embed',
      'data-entity-embed-display' => 'view_mode:media.embed',
      'data-entity-embed-display-settings' => '',
      'data-entity-type' => 'media',
      'data-entity-uuid' => $media->uuid(),
      'data-langcode' => 'en',
    ]);

    /** @var \Drupal\filter\FilterProcessResult $filter_result */
    $filter_result = $this->filter->process($input, 'en');
    $output = $filter_result->getProcessedText();
    $this->assertNotContains('drupal-entity data-entity-type="media" data-entity', $output);
    $this->assertNotContains('This placeholder should not be rendered.', $output);
    $dom = Html::load($output);
    $xpath = new \DOMXPath($dom);

    $img1 = $xpath->query("//img[contains(@alt, 'alt 1')]")[0];
    $this->assertNotEmpty($img1);
    $this->assertHasAttributes($img1, [
      'alt' => 'alt 1',
      'title' => 'title 1',
    ]);

    $img2 = $xpath->query("//img[contains(@alt, 'alt 2')]")[0];
    $this->assertNotEmpty($img2);
    $this->assertHasAttributes($img2, [
      'alt' => 'alt 2',
      'title' => 'title 2',
    ]);

    $img3 = $xpath->query("//img[contains(@alt, 'alt 3')]")[0];
    $this->assertNotEmpty($img3);
    $this->assertHasAttributes($img3, [
      'alt' => 'alt 3',
      'title' => 'title 3',
    ]);
  }

  /**
   * Creates an embed code with the given attributes.
   *
   * @param array $attributes
   *   The attributes to set.
   *
   * @return string
   *   A HTML string containing a <drupal-entity> tag with the given attributes.
   */
  protected function createEmbedCode(array $attributes) {
    $dom = Html::load('<drupal-entity>This placeholder should not be rendered.</drupal-entity>');
    $xpath = new \DOMXPath($dom);
    $drupal_entity = $xpath->query('//drupal-entity')[0];
    foreach ($attributes as $attribute => $value) {
      $drupal_entity->setAttribute($attribute, $value);
    }
    return Html::serialize($dom);
  }

  /**
   * Asserts that the DOMNode object has the given attributes.
   *
   * @param \DOMNode $node
   *   The DOMNode object to check.
   * @param array $attributes
   *   An array with attribute names as keys and expected attribute values as
   *   values.
   */
  protected function assertHasAttributes(\DOMNode $node, array $attributes) {
    foreach ($attributes as $attribute => $value) {
      $this->assertEquals($value, $node->getAttribute($attribute));
    }
  }

}
