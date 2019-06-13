<?php

namespace Drupal\Tests\entity_embed\FunctionalJavascript;

use Drupal\entity_embed\Plugin\entity_embed\EntityEmbedDisplay\MediaImageDecorator;
use Drupal\field\Entity\FieldConfig;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;

/**
 * Test Media Image specific functionality.
 *
 * @group entity_embed
 */
class MediaImageTest extends EntityEmbedTestBase {

  /**
   * The user to use during testing.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  public static $modules = ['entity_embed_test'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->adminUser = $this->drupalCreateUser([
      'use text format full_html',
      'administer nodes',
      'edit any article content',
    ]);
  }

  /**
   * Tests alt and title overriding for embedded images.
   */
  public function testAltAndTitle() {
    \Drupal::service('file_system')->copy($this->root . '/core/misc/druplicon.png', 'public://example.jpg');
    /** @var \Drupal\file\FileInterface $file */
    $file = File::create([
      'uri' => 'public://example.jpg',
      'uid' => $this->adminUser->id(),
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

    $host = $this->createNode([
      'type' => 'article',
      'title' => 'Animals with strange names',
      'body' => [
        'value' => '',
        'format' => 'full_html',
      ],
    ]);

    $this->drupalLogin($this->adminUser);
    $this->drupalGet('node/' . $host->id() . '/edit');
    $this->waitForEditor();

    $this->assignNameToCkeditorIframe();

    $this->assertSession()
      ->waitForElementVisible('css', 'a.cke_button__test_node')
      ->click();
    $this->assertSession()->waitForId('drupal-modal');

    // Test that node embed doesn't display alt and title fields.
    $this->assertSession()
      ->fieldExists('entity_id')
      ->setValue('Red-lipped batfish (1)');
    $this->assertSession()->elementExists('css', 'button.js-button-next')->click();
    $form = $this->assertSession()->waitForElementVisible('css', 'form.entity-embed-dialog-step--embed');

    // Assert that the review step displays the selected entity with the label.
    $text = $form->getText();
    $this->assertContains('Red-lipped batfish', $text);

    $select = $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]');

    $select->setValue('view_mode:node.full');
    $this->assertSession()->assertWaitOnAjaxRequest();

    // The view_mode:node.full display shouldn't have alt and title fields.
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    $select = $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]');

    $select->setValue('view_mode:node.teaser');
    $this->assertSession()->assertWaitOnAjaxRequest();

    // The view_mode:node.teaser display shouldn't have alt and title fields.
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    // Close the dialog.
    $this->assertSession()->elementExists('css', '.ui-dialog-titlebar-close')->press();

    // Now test with media.
    $this->assertSession()
      ->waitForElementVisible('css', 'a.cke_button__test_media_entity_embed')
      ->click();
    $this->assertSession()->waitForId('drupal-modal');

    $this->assertSession()
      ->fieldExists('entity_id')
      ->setValue('Screaming hairy armadillo (1)');
    $this->assertSession()->elementExists('css', 'button.js-button-next')->click();
    $form = $this->assertSession()->waitForElementVisible('css', 'form.entity-embed-dialog-step--embed');

    // Assert that the review step displays the selected entity with the label.
    $text = $form->getText();
    $this->assertContains('Screaming hairy armadillo', $text);

    $select = $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]');

    $select->setValue('entity_reference:entity_reference_entity_id');
    $this->assertSession()->assertWaitOnAjaxRequest();

    // The entity_reference:entity_reference_entity_id display shouldn't have
    // alt and title fields.
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    $select->setValue('entity_reference:entity_reference_label');
    $this->assertSession()->assertWaitOnAjaxRequest();

    // The entity_reference:entity_reference_label display shouldn't have alt
    // and title fields.
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    // Test the entity embed display that ships with core media.
    $select->setValue('entity_reference:media_thumbnail');
    $this->assertSession()->assertWaitOnAjaxRequest();

    $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]')
      ->setValue('view_mode:media.embed');
    $this->assertSession()->assertWaitOnAjaxRequest();
    $alt = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertEquals($media->field_media_image->alt, $alt->getValue());
    $title = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]');
    $this->assertEquals($media->field_media_image->title, $title->getValue());

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals("default alt", $img->getAttribute('alt'));
    $this->assertEquals("default title", $img->getAttribute('title'));

    $this->reopenDialog();

    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]')
      ->setValue('Satanic leaf-tailed gecko alt');
    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]')
      ->setValue('Satanic leaf-tailed gecko title');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals("Satanic leaf-tailed gecko alt", $img->getAttribute('alt'));
    $this->assertEquals("Satanic leaf-tailed gecko title", $img->getAttribute('title'));

    $this->reopenDialog();

    // Test a view mode that displays thumbnail field.
    $select->setValue('view_mode:media.thumb');
    $this->assertSession()->assertWaitOnAjaxRequest();

    $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]')
      ->setValue('view_mode:media.embed');
    $this->assertSession()->assertWaitOnAjaxRequest();
    $alt = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertEquals('Satanic leaf-tailed gecko alt', $alt->getValue());
    $title = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]');
    $this->assertEquals('Satanic leaf-tailed gecko title', $title->getValue());

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals('Satanic leaf-tailed gecko alt', $img->getAttribute('alt'));
    $this->assertEquals('Satanic leaf-tailed gecko title', $img->getAttribute('title'));

    $this->reopenDialog();

    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]')
      ->setValue('Goblin shark alt');
    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]')
      ->setValue('Goblin shark title');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals("Goblin shark alt", $img->getAttribute('alt'));
    $this->assertEquals("Goblin shark title", $img->getAttribute('title'));

    $this->reopenDialog();

    // Test a view mode that displays the media's image field.
    $select->setValue('view_mode:media.embed');
    $this->assertSession()->assertWaitOnAjaxRequest();

    // Test that the view_mode:media.embed display has alt and title fields,
    // and that the default values match the values on the media's
    // source image field.
    $this->assertSession()
      ->selectExists('attributes[data-entity-embed-display]')
      ->setValue('view_mode:media.embed');
    $this->assertSession()->assertWaitOnAjaxRequest();
    $alt = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertEquals("Goblin shark alt", $alt->getValue());
    $title = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]');
    $this->assertEquals("Goblin shark title", $title->getValue());

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals("Goblin shark alt", $img->getAttribute('alt'));
    $this->assertEquals("Goblin shark title", $img->getAttribute('title'));

    $this->reopenDialog();

    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]')
      ->setValue('Satanic leaf-tailed gecko alt');
    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]')
      ->setValue('Satanic leaf-tailed gecko title');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals('Satanic leaf-tailed gecko alt', $img->getAttribute('alt'));
    $this->assertEquals('Satanic leaf-tailed gecko title', $img->getAttribute('title'));

    $this->config('field.field.media.image.field_media_image')
      ->set('settings.alt_field', FALSE)
      ->set('settings.title_field', FALSE)
      ->save();

    $field = FieldConfig::load('media.image.field_media_image');
    $settings = $field->getSettings();
    $settings['alt_field'] = FALSE;
    $settings['title_field'] = FALSE;
    $field->set('settings', $settings);
    $field->save();

    drupal_flush_all_caches();

    $this->reopenDialog();

    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals('default alt', $img->getAttribute('alt'));
    $this->assertEquals('default title', $img->getAttribute('title'));

    $field = FieldConfig::load('media.image.field_media_image');
    $settings = $field->getSettings();
    $settings['alt_field'] = TRUE;
    $field->set('settings', $settings);
    $field->save();

    drupal_flush_all_caches();

    $this->reopenDialog();

    // Test that when only the alt field is enabled, only alt field should
    // display.
    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]')->setValue('Satanic leaf-tailed gecko alt');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][title]');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals('Satanic leaf-tailed gecko alt', $img->getAttribute('alt'));
    $this->assertEquals('default title', $img->getAttribute('title'));

    $field = FieldConfig::load('media.image.field_media_image');
    $settings = $field->getSettings();
    $settings['alt_field'] = FALSE;
    $settings['title_field'] = TRUE;
    $field->set('settings', $settings);
    $field->save();

    drupal_flush_all_caches();

    $this->reopenDialog();

    // With only title field enabled, only title field should display.
    $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]')->setValue('Satanic leaf-tailed gecko title');
    $this->assertSession()
      ->fieldNotExists('attributes[data-entity-embed-display-settings][alt]');

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEquals('Satanic leaf-tailed gecko title', $img->getAttribute('title'));
    $this->assertEquals('default alt', $img->getAttribute('alt'));

    $field = FieldConfig::load('media.image.field_media_image');
    $settings = $field->getSettings();
    $settings['alt_field'] = TRUE;
    $settings['title_field'] = TRUE;
    $settings['alt_field_required'] = FALSE;
    $settings['title_field_required'] = TRUE;
    $field->set('settings', $settings);
    $field->save();

    drupal_flush_all_caches();

    $this->reopenDialog();

    $alt = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertFalse($alt->hasAttribute('required'));
    $title = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]');
    $this->assertTrue($title->hasAttribute('required'));

    $this->submitDialog();

    $field = FieldConfig::load('media.image.field_media_image');
    $settings = $field->getSettings();
    $settings['alt_field_required'] = TRUE;
    $settings['title_field_required'] = FALSE;
    $field->set('settings', $settings);
    $field->save();

    drupal_flush_all_caches();

    $this->reopenDialog();

    $alt = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][alt]');
    $this->assertTrue($alt->hasAttribute('required'));
    $title = $this->assertSession()
      ->fieldExists('attributes[data-entity-embed-display-settings][title]');
    $this->assertFalse($title->hasAttribute('required'));

    // Test that setting value to double quote will allow setting the alt
    // and title to empty.
    $alt->setValue(MediaImageDecorator::EMPTY_STRING);
    $title->setValue(MediaImageDecorator::EMPTY_STRING);

    $this->submitDialog();

    $img = $this->assertSession()->elementExists('css', 'img');
    $this->assertEmpty($img->getAttribute('alt'));
    $this->assertEmpty($img->getAttribute('title'));
  }

  /**
   * Helper function to reopen EntityEmbedDialog for first embed.
   */
  protected function reopenDialog() {
    $this->getSession()->switchToIFrame();
    $select_and_edit_embed = <<<JS
var editor = CKEDITOR.instances['edit-body-0-value'];
var entityEmbed = editor.widgets.getByElement(editor.editable().findOne('div'));
entityEmbed.focus();
editor.execCommand('editdrupalentity');
JS;
    $this->getSession()->executeScript($select_and_edit_embed);
    $this->assertSession()->assertWaitOnAjaxRequest();
    $this->assertSession()->waitForElementVisible('css', 'form.entity-embed-dialog-step--embed');
  }

  /**
   * Helper function to submit dialog and focus on ckeditor frame.
   */
  protected function submitDialog() {
    $this->assertSession()->elementExists('css', 'button.button--primary')->press();
    $this->assertSession()->assertWaitOnAjaxRequest();

    // Verify that the embedded entity preview in CKEditor displays the image
    // with the default alt and title.
    $this->getSession()->switchToIFrame('ckeditor');
  }

}
