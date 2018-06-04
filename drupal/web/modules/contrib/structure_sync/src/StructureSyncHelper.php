<?php

namespace Drupal\structure_sync;

use Drupal\Core\Form\FormStateInterface;
use Drupal\structure_sync\Controller\BlocksController;
use Drupal\structure_sync\Controller\MenuLinksController;
use Drupal\structure_sync\Controller\TaxonomiesController;

/**
 * Container of functions for importing and exporting content in structure.
 */
class StructureSyncHelper {

  /**
   * Function to export taxonomy terms.
   */
  public static function exportTaxonomies(array $form = NULL, FormStateInterface $form_state = NULL) {
    $taxonomiesController = new TaxonomiesController();
    $taxonomiesController->exportTaxonomies($form, $form_state);
  }

  /**
   * Function to export custom blocks.
   */
  public static function exportCustomBlocks(array $form = NULL, FormStateInterface $form_state = NULL) {
    $blocksController = new BlocksController();
    $blocksController->exportBlocks($form, $form_state);
  }

  /**
   * Function to export menu links.
   */
  public static function exportMenuLinks(array $form = NULL, FormStateInterface $form_state = NULL) {
    $menuLinksController = new MenuLinksController();
    $menuLinksController->exportMenuLinks($form, $form_state);
  }

  /**
   * Function to import taxonomy terms.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public static function importTaxonomies(array $form, FormStateInterface $form_state = NULL) {
    $taxonomiesController = new TaxonomiesController();
    $taxonomiesController->importTaxonomies($form, $form_state);
  }

  /**
   * Function to import custom blocks.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public static function importCustomBlocks(array $form, FormStateInterface $form_state = NULL) {
    $customBlocksController = new BlocksController();
    $customBlocksController->importBlocks($form, $form_state);
  }

  /**
   * Function to import menu links.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public static function importMenuLinks(array $form, FormStateInterface $form_state = NULL) {
    $menuLinksController = new MenuLinksController();
    $menuLinksController->importMenuLinks($form, $form_state);
  }

  /**
   * General function for logging messages.
   */
  public static function logMessage($message, $type = NULL, $context = []) {
    $log = \Drupal::config('structure_sync.data')->get('log');

    if (isset($log) && ($log === FALSE)) {
      return;
    }

    switch ($type) {
      case 'error':
        \Drupal::logger('structure_sync')->error($message, $context);
        break;

      case 'warning':
        \Drupal::logger('structure_sync')->warning($message, $context);
        break;

      default:
        \Drupal::logger('structure_sync')->notice($message, $context);
        break;
    }
  }

  /**
   * Function to start importing taxonomies with the 'full' style.
   */
  public static function importTaxonomiesFull(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'full';

    StructureSyncHelper::importTaxonomies($form, $form_state);
  }

  /**
   * Function to start importing taxonomies with the 'safe' style.
   */
  public static function importTaxonomiesSafe(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'safe';

    StructureSyncHelper::importTaxonomies($form, $form_state);
  }

  /**
   * Function to start importing taxonomies with the 'force' style.
   */
  public static function importTaxonomiesForce(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'force';

    StructureSyncHelper::importTaxonomies($form, $form_state);
  }

  /**
   * Function to start importing custom blocks with the 'full' style.
   */
  public static function importCustomBlocksFull(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'full';

    StructureSyncHelper::importCustomBlocks($form, $form_state);
  }

  /**
   * Function to start importing custom blocks with the 'safe' style.
   */
  public static function importCustomBlocksSafe(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'safe';

    StructureSyncHelper::importCustomBlocks($form, $form_state);
  }

  /**
   * Function to start importing custom blocks with the 'force' style.
   */
  public static function importCustomBlocksForce(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'force';

    StructureSyncHelper::importCustomBlocks($form, $form_state);
  }

  /**
   * Function to start importing menu links with the 'full' style.
   */
  public static function importMenuLinksFull(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'full';

    StructureSyncHelper::importMenuLinks($form, $form_state);
  }

  /**
   * Function to start importing menu links with the 'safe' style.
   */
  public static function importMenuLinksSafe(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'safe';

    StructureSyncHelper::importMenuLinks($form, $form_state);
  }

  /**
   * Function to start importing menu links with the 'force' style.
   */
  public static function importMenuLinksForce(array &$form, FormStateInterface $form_state = NULL) {
    $form['style'] = 'force';

    StructureSyncHelper::importMenuLinks($form, $form_state);
  }

  /**
   * Function to get an entity query.
   *
   * @param string $entityType
   *   The entity type (for example, node) for which the query object should be
   *   returned.
   *
   * @return \Drupal\Core\Entity\Query\QueryInterface
   *   Entity query.
   */
  public static function getEntityQuery($entityType) {
    return \Drupal::entityQuery($entityType);
  }

  /**
   * Function to get an entity type manager.
   *
   * @return \Drupal\Core\Entity\EntityTypeManagerInterface
   *   Entity type manager.
   */
  public static function getEntityManager() {
    return \Drupal::entityTypeManager();
  }

  /**
   * Function to get an entity field manager.
   *
   * @return \Drupal\Core\Entity\EntityFieldManagerInterface
   *   Entity field manager.
   */
  public static function getEntityFieldManager() {
    return \Drupal::service('entity_field.manager');
  }

}
