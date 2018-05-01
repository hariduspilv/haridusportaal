<?php

namespace Drupal\taxonomy_term_depth\Tests;
use Drupal\simpletest\WebTestBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\taxonomy\TermStorage;

/**
 * Getting calculating dynamically the depth of the term.
 *
 * @group taxonomy_term_depth
 */
class DynamicDepthCalculationTest extends WebTestBase {
  /**
   * Modules to install.
   *
   * @var array
   */
  public static $modules = ['taxonomy', 'taxonomy_term_depth'];

  protected function setUp() {
    parent::setUp();
  }

  /**
   * Creates and ensures that a feed is unique, checks source, and deletes feed.
   */
  public function testCalculateDepth() {
    $voc = Vocabulary::create([
      'vid' => 'testvoc',
      'name' => 'testvoc',
      'description' => 'testvoc'
    ]);

    $voc->save();

    $term1 = Term::create([
      'vid' => $voc->id(),
      'name' => 'Depth 1 term',
    ]);

    $term1->save();

    $term2 = Term::create([
      'vid' => $voc->id(),
      'name' => 'Depth 2 term',
    ]);

    $term2->parent->set(0, $term1->id());
    $term2->save();

    $term3 = Term::create([
      'vid' => $voc->id(),
      'name' => 'Depth 2 term',
    ]);

    $term3->parent->set(0, $term3->id());
    $term3->parent->set(1, $term2->id());
    $term3->save();

    $this->assertEqual(taxonomy_term_depth_get_by_tid($term1->id()), 1, 'Depth of first term');
    $this->assertEqual(taxonomy_term_depth_get_by_tid($term2->id()), 2, 'Depth of second term');
    $this->assertEqual(taxonomy_term_depth_get_by_tid($term3->id()), 3, 'Depth of third term');

    $this->assertEqual($term1->depth_level->first() ? $term1->depth_level->first()->value : NULL, 1, 'Saved depth of first term');
    $this->assertEqual($term2->depth_level->first() ? $term2->depth_level->first()->value : NULL, 2, 'Saved depth of second term');
    $this->assertEqual($term3->depth_level->first() ? $term3->depth_level->first()->value : NULL, 3, 'Saved depth of third term');

    $chain = taxonomy_term_depth_get_full_chain($term2->id());
    $compare = [
      $term1->id(),
      $term2->id(),
      $term3->id(),
    ];

    $this->assertTrue($chain === $compare, 'Testing fullchain for term2');

    $chain = taxonomy_term_depth_get_full_chain($term2->id(), TRUE);
    $this->assertTrue($chain === array_reverse($compare), 'Testing reversed fullchain for term2');

    $this->assertEqual(\Drupal::database()->query('SELECT depth_level FROM {taxonomy_term_field_data} WHERE tid=:tid', [':tid' => $term1->id()])->fetchField(), 1, 'DB depth_level field of first term');
    $this->assertEqual(\Drupal::database()->query('SELECT depth_level FROM {taxonomy_term_field_data} WHERE tid=:tid', [':tid' => $term2->id()])->fetchField(), 2, 'DB depth_level field of second term');
    $this->assertEqual(\Drupal::database()->query('SELECT depth_level FROM {taxonomy_term_field_data} WHERE tid=:tid', [':tid' => $term3->id()])->fetchField(), 3, 'DB depth_level field of third term');
  }

  public function testCronQueue() {
    $this->assertTrue(TRUE, 'Clearing all depths and running cron to update, then checking again');
    taxonomy_term_depth_queue_manager()->clearDepths();
    $this->cronRun();
    $this->testCalculateDepth();
  }
}
