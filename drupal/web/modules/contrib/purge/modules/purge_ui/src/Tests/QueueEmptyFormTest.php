<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Form\FormState;
use Drupal\Core\Url;
use Drupal\purge\Tests\WebTestBase;
use Drupal\purge_ui\Form\QueueEmptyForm;

/**
 * Tests \Drupal\purge_ui\Form\QueueEmptyForm.
 *
 * @group purge_ui
 */
class QueueEmptyFormTest extends WebTestBase {

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
  protected $route = 'purge_ui.queue_empty_form';

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
   * Tests permissions, the form controller and general form returning.
   */
  public function testAccess() {
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertResponse(403);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertResponse(200);
    $this->assertTitle("Are you sure you want to empty the queue? | Drupal");
    $this->assertText("This action cannot be undone.");
    $this->assertText('Yes, throw everything away!');
  }

  /**
   * Tests that the "No" cancel button closes the dialog.
   *
   * @see \Drupal\purge_ui\Form\QueuerDeleteForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testNo() {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $this->assertRaw('No');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route)->toString(), [], ['op' => 'No']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
  }

  /**
   * Tests that the confirm button clears the queue.
   *
   * @see \Drupal\purge_ui\Form\QueuerDeleteForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testConfirm() {
    // Add seven objects to the queue and assert that these get deleted.
    $this->initializeQueueService('file');
    $this->purgeQueue->add($this->queuer, $this->getInvalidations(7, 'tag', 'test'));
    // Assert that - after reloading/committing the queue - we still have these.
    $this->purgeQueue->reload();
    $this->assertEqual(7, $this->purgeQueue->numberOfItems());
    // Call the confirm form and assert the AJAX responses.
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route));
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route)->toString(), [], ['op' => 'Yes, throw everything away!']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
    // Directly call ::emptyQueue() on a form object and assert the empty queue.
    $this->assertEqual(7, $this->purgeQueue->numberOfItems());
    $form = [];
    $form_instance = new QueueEmptyForm($this->purgeQueue);
    $form_instance->emptyQueue($form, new FormState());
    // $this->assertEqual(0, $this->purgeQueue->numberOfItems());
    // $this->purgeQueue->reload();
    $this->assertEqual(0, $this->purgeQueue->numberOfItems());
  }

}
