<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge\Tests\WebTestBase;

/**
 * Tests \Drupal\purge_ui\Form\QueueBrowserForm.
 *
 * @group purge_ui
 */
class QueueBrowserFormTest extends WebTestBase {

  /**
   * The Drupal user entity.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * The route that renders the form.
   *
   * @var string
   */
  protected $route = 'purge_ui.queue_browser_form';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'purge_ui',
    'purge_queuer_test',
    'purge_purger_test',
  ];

  /**
   * The queuer plugin.
   *
   * @var \Drupal\purge\Plugin\Purge\Queuer\QueuerInterface
   */
  protected $queuer;

  /**
   * Setup the test.
   */
  public function setUp($switch_to_memory_queue = TRUE) {
    parent::setUp($switch_to_memory_queue);
    $this->initializeQueuersService();
    $this->queuer = $this->purgeQueuers->get('a');
    $this->adminUser = $this->drupalCreateUser(['administer site configuration']);
  }

  /**
   * Tests access to the form and empty conditions.
   */
  public function testAccess() {
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertResponse(403);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertResponse(200);
    $this->assertTitle("Purge queue browser | Drupal");
    $this->assertText("Your queue is empty.");
    $this->assertNoField('edit-1');
  }

  /**
   * Tests that the close button closes the dialog.
   *
   * @see \Drupal\purge_ui\Form\QueueBrowserForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testClose() {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertText("Close");
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route)->toString(), [], ['op' => 'Close']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
  }

  /**
   * Tests that data is shown accordingly.
   *
   * @see \Drupal\purge_ui\Form\QueueBrowserForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testData() {
    $this->initializeInvalidationFactoryService();
    $this->initializePurgersService(['id' => 'good']);
    $this->initializeQueueService('file');
    // Add 30 tags to the queue and collect the strings we're adding.
    $tags = $needles = [];
    for ($i = 1; $i <= 30; $i++) {
      $needles[$i] = "node:$i";
      $tags[] = $this->purgeInvalidationFactory->get('tag', $needles[$i]);
    }
    $this->purgeQueue->add($this->queuer, $tags);
    // Assert that the pager works and returns our objects.
    $this->assertEqual(15, count($this->purgeQueue->selectPage()));
    $this->assertEqual(50, $this->purgeQueue->selectPageLimit(50));
    $this->assertEqual(30, count($this->purgeQueue->selectPage()));
    $this->purgeQueue->reload();
    // Render the interface and find the first 15 tags, the is on page 2.
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertText("Type");
    $this->assertText("State");
    $this->assertText("Expression");
    $this->assertText("New");
    $this->assertField('edit-1');
    $this->assertField('edit-2');
    $this->assertNoField('edit-3');
    foreach ($needles as $i => $needle) {
      // @see \Drupal\purge_ui\Form\QueueBrowserForm::$numberOfItems.
      if ($i <= 15) {
        $this->assertRaw($needle);
      }
      else {
        $this->assertNoRaw($needle);
      }
    }
  }

}
