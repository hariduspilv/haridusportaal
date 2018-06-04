<?php

namespace Drupal\structure_sync\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\structure_sync\StructureSyncHelper;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Controller for syncing taxonomy terms.
 */
class TaxonomiesController extends ControllerBase {

  private $config;

  /**
   * Constructor for taxonomies controller.
   */
  public function __construct() {
    $this->config = $this->getEditableConfig();
    $this->entityTypeManager();
  }

  /**
   * Gets the editable version of the config.
   */
  private function getEditableConfig() {
    $this->config('structure_sync.data');

    return $this->configFactory->getEditable('structure_sync.data');
  }

  /**
   * Function to export taxonomy terms.
   */
  public function exportTaxonomies(array $form = NULL, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Taxonomies export started');

    if (is_object($form_state) && $form_state->hasValue('export_voc_list')) {
      $vocabulary_list = $form_state->getValue('export_voc_list');
      $vocabulary_list = array_filter($vocabulary_list, 'is_string');
    }

    // Get a list of all vocabularies (their machine names).
    if (!isset($vocabulary_list)) {
      $vocabulary_list = [];
      $vocabularies = $this->entityTypeManager
        ->getStorage('taxonomy_vocabulary')->loadMultiple();
      foreach ($vocabularies as $vocabulary) {
        $vocabulary_list[] = $vocabulary->id();
      }
    }
    if (!count($vocabulary_list)) {
      StructureSyncHelper::logMessage('No vocabularies available', 'warning');

      drupal_set_message($this->t('No vocabularies selected/available'), 'warning');
      return;
    }

    // Clear the (previous) taxonomies data in the config.
    $this->config->clear('taxonomies')->save();

    // Get all taxonomies from each (previously retrieved) vocabulary.
    foreach ($vocabulary_list as $vocabulary) {
      $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
      $query->condition('vid', $vocabulary);
      $tids = $query->execute();
      $controller = $this->entityTypeManager
        ->getStorage('taxonomy_term');
      $entities = $controller->loadMultiple($tids);

      $parents = [];
      foreach ($tids as $tid) {
        $parent = $this->entityTypeManager
          ->getStorage('taxonomy_term')->loadParents($tid);
        $parent = reset($parent);

        if (is_object($parent)) {
          $parents[$tid] = $parent->id();
        }
      }

      $taxonomies = [];
      foreach ($entities as $entity) {
        $taxonomies[] = [
          'vid' => $vocabulary,
          'tid' => $entity->id(),
          'langcode' => $entity->langcode->getValue()[0]['value'],
          'name' => $entity->name->getValue()[0]['value'],
          'description__value' => $entity->get('description')->getValue()[0]['value'],
          'description__format' => $entity->get('description')->getValue()[0]['format'],
          'weight' => $entity->weight->getValue()[0]['value'],
          'parent' => isset($parents[$entity->id()]) ? $parents[$entity->id()] : '0',
          'uuid' => $entity->uuid(),
        ];
      }

      // Save the retrieved taxonomies to the config.
      $this->config->set('taxonomies.' . $vocabulary, $taxonomies)->save();

      if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
        drush_log('Exported ' . $vocabulary, 'ok');
      }
      StructureSyncHelper::logMessage('Exported ' . $vocabulary);
    }

    drupal_set_message($this->t('The taxonomies have been successfully exported.'));
    StructureSyncHelper::logMessage('Taxonomies exported');
  }

  /**
   * Function to import taxonomy terms.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public function importTaxonomies(array $form, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Taxonomy import started');

    // Check if the import style has been defined in the form (state) and else
    // get it from the form array.
    if (is_object($form_state) && $form_state->hasValue('import_voc_list')) {
      $taxonomiesSelected = $form_state->getValue('import_voc_list');
      $taxonomiesSelected = array_filter($taxonomiesSelected, 'is_string');
    }
    if (array_key_exists('style', $form)) {
      $style = $form['style'];
    }
    else {
      StructureSyncHelper::logMessage('No style defined on taxonomy import', 'error');
      return;
    }

    StructureSyncHelper::logMessage('Using "' . $style . '" style for taxonomy import');

    // Get taxonomies from config.
    $taxonomiesConfig = $this->config->get('taxonomies');

    $taxonomies = [];

    if (isset($taxonomiesSelected)) {
      foreach ($taxonomiesConfig as $taxKey => $taxValue) {
        if (in_array($taxKey, $taxonomiesSelected)) {
          $taxonomies[$taxKey] = $taxValue;
        }
      }
    }
    else {
      $taxonomies = $taxonomiesConfig;
    }

    if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
      $context = [];
      $context['drush'] = TRUE;

      switch ($style) {
        case 'full':
          self::deleteDeletedTaxonomies($taxonomies, $context);
          self::importTaxonomiesFull($taxonomies, $context);
          self::taxonomiesImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'safe':
          self::importTaxonomiesSafe($taxonomies, $context);
          self::taxonomiesImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'force':
          self::deleteTaxonomies($context);
          self::importTaxonomiesForce($taxonomies, $context);
          self::taxonomiesImportFinishedCallback(NULL, NULL, NULL);
          break;
      }

      return;
    }

    // Import the taxonomies with the chosen style of importing.
    switch ($style) {
      case 'full':
        $batch = [
          'title' => $this->t('Importing taxonomies...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\TaxonomiesController::deleteDeletedTaxonomies',
              [$taxonomies],
            ],
            [
              '\Drupal\structure_sync\Controller\TaxonomiesController::importTaxonomiesFull',
              [$taxonomies],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\TaxonomiesController::taxonomiesImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'safe':
        $batch = [
          'title' => $this->t('Importing taxonomies...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\TaxonomiesController::importTaxonomiesSafe',
              [$taxonomies],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\TaxonomiesController::taxonomiesImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'force':
        $batch = [
          'title' => $this->t('Importing taxonomies...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\TaxonomiesController::deleteTaxonomies',
              [],
            ],
            [
              '\Drupal\structure_sync\Controller\TaxonomiesController::importTaxonomiesForce',
              [$taxonomies],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\TaxonomiesController::taxonomiesImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      default:
        StructureSyncHelper::logMessage('Style not recognized', 'error');
        break;
    }
  }

  /**
   * Function to delete the taxonomies that should be removed in this import.
   */
  public static function deleteDeletedTaxonomies($taxonomies, &$context) {
    $uuidsInConfig = [];
    foreach ($taxonomies as $voc) {
      foreach ($voc as $taxonomy) {
        $uuidsInConfig[] = $taxonomy['uuid'];
      }
    }

    if(!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
        $query->condition('uuid', $uuidsInConfig, 'NOT IN');
        $tids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('taxonomy_term');
        $entities = $controller->loadMultiple($tids);
        $controller->delete($entities);
    }

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted taxonomies that were not in config', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted taxonomies that were not in config');
  }

  /**
   * Function to fully import the taxonomies.
   *
   * Basically a safe import with update actions for already existing taxonomy
   * terms.
   */
  public static function importTaxonomiesFull($taxonomies, &$context) {
    $uuidsInConfig = [];
    foreach ($taxonomies as $voc) {
      foreach ($voc as $taxonomy) {
        $uuidsInConfig[] = $taxonomy['uuid'];
      }
    }
    $entities = [];
    if(!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
        $query->condition('uuid', $uuidsInConfig, 'IN');
        $tids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('taxonomy_term');
        $entities = $controller->loadMultiple($tids);
    }

    $tidsDone = [];
    $tidsLeft = [];
    $newTids = [];
    $firstRun = TRUE;
    $context['sandbox']['max'] = count($taxonomies);
    $context['sandbox']['progress'] = 0;
    while ($firstRun || count($tidsLeft) > 0) {
      foreach ($taxonomies as $vid => $vocabulary) {
        foreach ($vocabulary as $taxonomy) {
          $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
          $query->condition('uuid', $taxonomy['uuid']);
          $tids = $query->execute();

          if (!in_array($taxonomy['tid'], $tidsDone) && ($taxonomy['parent'] === '0' || in_array($taxonomy['parent'], $tidsDone))) {
            $parent = $taxonomy['parent'];
            if (isset($newTids[$taxonomy['parent']])) {
              $parent = $newTids[$taxonomy['parent']];
            }

            if (count($tids) <= 0) {
              Term::create([
                'vid' => $vid,
                'langcode' => $taxonomy['langcode'],
                'name' => $taxonomy['name'],
                'description' => [
                  'value' => $taxonomy['description__value'],
                  'format' => $taxonomy['description__format'],
                ],
                'weight' => $taxonomy['weight'],
                'parent' => [$parent],
              ])->save();
            }
            else {
              foreach ($entities as $entity) {
                if ($taxonomy['uuid'] === $entity->uuid()) {
                  $term = Term::load($entity->id());
                  if (!empty($term)) {
                    $term->parent = [$parent];

                    $term
                      ->setName($taxonomy['name'])
                      ->setDescription($taxonomy['description__value'])
                      ->setFormat($taxonomy['description__format'])
                      ->setWeight($taxonomy['weight'])
                      ->save();
                  }
                }
              }
            }

            $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
            $query->condition('vid', $vid);
            $query->condition('name', $taxonomy['name']);
            $tids = $query->execute();
            if (count($tids) > 0) {
              $terms = Term::loadMultiple($tids);
            }

            if (isset($terms) && count($terms) > 0) {
              reset($terms);
              $newTid = key($terms);
              $newTids[$taxonomy['tid']] = $newTid;
            }

            $tidsDone[] = $taxonomy['tid'];

            if (in_array($taxonomy['tid'], $tidsLeft)) {
              unset($tidsLeft[array_search($taxonomy['tid'], $tidsLeft)]);
            }

            if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
              drush_log('Imported "' . $taxonomy['name'] . '" into ' . $vid, 'ok');
            }
            StructureSyncHelper::logMessage('Imported "' . $taxonomy['name'] . '" into ' . $vid);

            $context['sandbox']['progress']++;
            if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
              $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
            }
          }
          else {
            if (!in_array($taxonomy['tid'], $tidsLeft)) {
              $tidsLeft[] = $taxonomy['tid'];
            }
          }
        }
      }

      $firstRun = FALSE;
    }

    StructureSyncHelper::logMessage('Flushing all caches');
    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Flushing all caches', 'ok');
    }

    drupal_flush_all_caches();

    StructureSyncHelper::logMessage('Succesfully flushed caches');

    $context['finished'] = 1;
  }

  /**
   * Function to safely import taxonomies.
   *
   * Safely meaning that it should only add what isn't already there and not
   * delete and/or update any terms.
   */
  public static function importTaxonomiesSafe($taxonomies, &$context) {
    $tidsDone = [];
    $tidsLeft = [];
    $newTids = [];
    $firstRun = TRUE;
    $context['sandbox']['max'] = count($taxonomies);
    $context['sandbox']['progress'] = 0;
    while ($firstRun || count($tidsLeft) > 0) {
      foreach ($taxonomies as $vid => $vocabulary) {
        foreach ($vocabulary as $taxonomy) {
          $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
          $query->condition('vid', $vid);
          $query->condition('name', $taxonomy['name']);
          $tids = $query->execute();

          if (count($tids) <= 0) {
            if (!in_array($taxonomy['tid'], $tidsDone) && ($taxonomy['parent'] === '0' || in_array($taxonomy['parent'], $tidsDone))) {
              if (!in_array($taxonomy['tid'], $tidsDone)) {
                $parent = $taxonomy['parent'];
                if (isset($newTids[$taxonomy['parent']])) {
                  $parent = $newTids[$taxonomy['parent']];
                }

                $context['message'] = t('Importing @taxonomy', ['@taxonomy' => $taxonomy['name']]);

                Term::create([
                  'vid' => $vid,
                  'langcode' => $taxonomy['langcode'],
                  'name' => $taxonomy['name'],
                  'description' => [
                    'value' => $taxonomy['description__value'],
                    'format' => $taxonomy['description__format'],
                  ],
                  'weight' => $taxonomy['weight'],
                  'parent' => [$parent],
                  'uuid' => $taxonomy['uuid'],
                ])->save();

                $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
                $query->condition('vid', $vid);
                $query->condition('name', $taxonomy['name']);
                $tids = $query->execute();
                if (count($tids) > 0) {
                  $terms = Term::loadMultiple($tids);
                }

                if (isset($terms) && count($terms) > 0) {
                  reset($terms);
                  $newTid = key($terms);
                  $newTids[$taxonomy['tid']] = $newTid;
                }

                $tidsDone[] = $taxonomy['tid'];

                if (in_array($taxonomy['tid'], $tidsLeft)) {
                  unset($tidsLeft[array_search($taxonomy['tid'], $tidsLeft)]);
                }

                if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
                  drush_log('Imported "' . $taxonomy['name'] . '" into ' . $vid, 'ok');
                }
                StructureSyncHelper::logMessage('Imported "' . $taxonomy['name'] . '" into ' . $vid);

                $context['sandbox']['progress']++;
                if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
                  $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
                }
              }
            }
            else {
              if (!in_array($taxonomy['tid'], $tidsLeft)) {
                $tidsLeft[] = $taxonomy['tid'];
              }
            }
          }
          elseif (!in_array($taxonomy['tid'], $tidsDone)) {
            $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
            $query->condition('vid', $vid);
            $query->condition('name', $taxonomy['name']);
            $tids = $query->execute();
            if (count($tids) > 0) {
              $terms = Term::loadMultiple($tids);
            }

            if (isset($terms) && count($terms) > 0) {
              reset($terms);
              $newTid = key($terms);
              $newTids[$taxonomy['tid']] = $newTid;
              $tidsDone[] = $taxonomy['tid'];
            }
          }
        }
      }

      $firstRun = FALSE;
    }

    $context['finished'] = 1;
  }

  /**
   * Function to delete all taxonomy terms.
   */
  public static function deleteTaxonomies(&$context) {
    $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
    $tids = $query->execute();
    $controller = StructureSyncHelper::getEntityManager()
      ->getStorage('taxonomy_term');
    $entities = $controller->loadMultiple($tids);
    $controller->delete($entities);

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted all taxonomies', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted all taxonomies');
  }

  /**
   * Function to import (create) all taxonomies that need to be imported.
   */
  public static function importTaxonomiesForce($taxonomies, &$context) {
    $tidsDone = [];
    $tidsLeft = [];
    $newTids = [];
    $firstRun = TRUE;
    $context['sandbox']['max'] = count($taxonomies);
    $context['sandbox']['progress'] = 0;
    while ($firstRun || count($tidsLeft) > 0) {
      foreach ($taxonomies as $vid => $vocabulary) {
        foreach ($vocabulary as $taxonomy) {
          if (!in_array($taxonomy['tid'], $tidsDone) && ($taxonomy['parent'] === '0' || in_array($taxonomy['parent'], $tidsDone))) {
            if (!in_array($taxonomy['tid'], $tidsDone)) {
              $parent = $taxonomy['parent'];
              if (isset($newTids[$taxonomy['parent']])) {
                $parent = $newTids[$taxonomy['parent']];
              }

              $context['message'] = t('Importing @taxonomy', ['@taxonomy' => $taxonomy['name']]);

              Term::create([
                'vid' => $vid,
                'langcode' => $taxonomy['langcode'],
                'name' => $taxonomy['name'],
                'description' => [
                  'value' => $taxonomy['description__value'],
                  'format' => $taxonomy['description__format'],
                ],
                'weight' => $taxonomy['weight'],
                'parent' => [$parent],
                'uuid' => $taxonomy['uuid'],
              ])->save();

              $query = StructureSyncHelper::getEntityQuery('taxonomy_term');
              $query->condition('vid', $vid);
              $query->condition('name', $taxonomy['name']);
              $tids = $query->execute();
              if (count($tids) > 0) {
                $terms = Term::loadMultiple($tids);
              }

              if (isset($terms) && count($terms) > 0) {
                reset($terms);
                $newTid = key($terms);
                $newTids[$taxonomy['tid']] = $newTid;
              }

              $tidsDone[] = $taxonomy['tid'];

              if (in_array($taxonomy['tid'], $tidsLeft)) {
                unset($tidsLeft[array_search($taxonomy['tid'], $tidsLeft)]);
              }

              if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
                drush_log('Imported "' . $taxonomy['name'] . '" into ' . $vid, 'ok');
              }
              StructureSyncHelper::logMessage('Imported "' . $taxonomy['name'] . '" into ' . $vid);

              $context['sandbox']['progress']++;
              if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
                $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
              }
            }
          }
          else {
            if (!in_array($taxonomy['tid'], $tidsLeft)) {
              $tidsLeft[] = $taxonomy['tid'];
            }
          }
        }
      }

      $firstRun = FALSE;
    }

    $context['finished'] = 1;
  }

  /**
   * Function that signals that the import of taxonomies has finished.
   */
  public static function taxonomiesImportFinishedCallback($success, $results, $operations) {
    StructureSyncHelper::logMessage('Successfully imported taxonomies');

    drupal_set_message(t('Successfully imported taxonomies'));
  }

}
