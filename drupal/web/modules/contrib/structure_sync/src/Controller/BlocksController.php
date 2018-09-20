<?php

namespace Drupal\structure_sync\Controller;

use Drupal\block_content\Entity\BlockContent;
use Drupal\Core\Controller\ControllerBase;
use Drupal\structure_sync\StructureSyncHelper;
use Drupal\Core\Form\FormStateInterface;

/**
 * Controller for syncing custom blocks.
 */
class BlocksController extends ControllerBase {

  private $config;

  /**
   * Constructor for custom blocks controller.
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
   * Function to export custom blocks.
   */
  public function exportBlocks(array $form = NULL, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Custom blocks export started');

    if (is_object($form_state) && $form_state->hasValue('export_block_list')) {
      $blockList = $form_state->getValue('export_block_list');
      $blockList = array_filter($blockList, 'is_string');
    }

    $this->config->clear('blocks')->save();

    if (isset($blockList)) {
      $blocks = [];

      foreach ($blockList as $blockUuid) {
        $blocks = array_merge($this->entityTypeManager
          ->getStorage('block_content')
          ->loadByProperties(['uuid' => $blockUuid]), $blocks);
      }
    }
    else {
      $blocks = $this->entityTypeManager->getStorage('block_content')
        ->loadMultiple();
    }

    $customBlocks = [];
    foreach ($blocks as $block) {
      $customBlock = [
        'info' => $block->info->getValue()[0]['value'],
        'langcode' => $block->langcode->getValue()[0]['value'],
        'uuid' => $block->uuid(),
        'bundle' => $block->bundle(),
        'revision_id' => null,
        'rev_id_current' => null,
      ];

      $entityFieldManager = StructureSyncHelper::getEntityFieldManager();
      $fields = $entityFieldManager->getFieldDefinitions('block_content', $block->bundle());

      foreach ($fields as $key => $field) {
        if ($field->getFieldStorageDefinition()->isBaseField()) {
          unset($fields[$key]);
        }
      }

      foreach ($fields as $field) {
        $fieldName = $field->getName();
        $customBlock['fields'][$fieldName] = $block->$fieldName->getValue()[0];
      }

      $customBlocks[] = $customBlock;
    }

    $this->config->set('blocks', $customBlocks)->save();

    foreach ($customBlocks as $customBlock) {
      if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
        drush_log('Exported "' . $customBlock['info'] . '"', 'ok');
      }
      StructureSyncHelper::logMessage('Exported "' . $customBlock['info'] . '"');
    }

    drupal_set_message($this->t('The custom blocks have been successfully exported.'));
    StructureSyncHelper::logMessage('Custom blocks exported');
  }

  /**
   * Function to import custom blocks.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public function importBlocks(array $form, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Custom blocks import started');

    // Check if the import style has been defined in the form (state) and else
    // get it from the form array.
    if (is_object($form_state) && $form_state->hasValue('import_block_list')) {
      $blocksSelected = $form_state->getValue('import_block_list');
      $blocksSelected = array_filter($blocksSelected, 'is_string');
    }
    if (array_key_exists('style', $form)) {
      $style = $form['style'];
    }
    else {
      StructureSyncHelper::logMessage('No style defined on custom blocks import', 'error');
      return;
    }

    StructureSyncHelper::logMessage('Using "' . $style . '" style for custom blocks import');

    // Get custom blocks from config.
    $blocksConfig = $this->config->get('blocks');

    $blocks = [];

    if (isset($blocksSelected)) {
      foreach ($blocksConfig as $block) {
        if (in_array($block['uuid'], array_keys($blocksSelected))) {
          $blocks[] = $block;
        }
      }
    }
    else {
      $blocks = $blocksConfig;
    }

    if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
      $context = [];
      $context['drush'] = TRUE;

      switch ($style) {
        case 'full':
          self::deleteDeletedBlocks($blocks, $context);
          self::importBlocksFull($blocks, $context);
          self::blocksImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'safe':
          self::importBlocksSafe($blocks, $context);
          self::blocksImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'force':
          self::deleteBlocks($context);
          self::importBlocksForce($blocks, $context);
          self::blocksImportFinishedCallback(NULL, NULL, NULL);
          break;
      }

      return;
    }

    // Import the custom blocks with the chosen style of importing.
    switch ($style) {
      case 'full':
        $batch = [
          'title' => $this->t('Importing custom blocks...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\BlocksController::deleteDeletedBlocks',
              [$blocks],
            ],
            [
              '\Drupal\structure_sync\Controller\BlocksController::importBlocksFull',
              [$blocks],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\BlocksController::blocksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'safe':
        $batch = [
          'title' => $this->t('Importing custom blocks...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\BlocksController::importBlocksSafe',
              [$blocks],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\BlocksController::blocksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'force':
        $batch = [
          'title' => $this->t('Importing custom blocks...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\BlocksController::deleteBlocks',
              [],
            ],
            [
              '\Drupal\structure_sync\Controller\BlocksController::importBlocksForce',
              [$blocks],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\BlocksController::blocksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      default:
        StructureSyncHelper::logMessage('Style not recognized', 'error');
        break;
    }
  }

  /**
   * Function to delete the custom blocks that should be removed in this import.
   */
  public static function deleteDeletedBlocks($blocks, &$context) {
    $uuidsInConfig = [];
    foreach ($blocks as $block) {
      $uuidsInConfig[] = $block['uuid'];
    }

    if(!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('block_content');
        $query->condition('uuid', $uuidsInConfig, 'NOT IN');
        $ids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('block_content');
        $entities = $controller->loadMultiple($ids);
        $controller->delete($entities);
    }

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted custom blocks that were not in config', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted custom blocks that were not in config');
  }

  /**
   * Function to fully import the custom blocks.
   *
   * Basically a safe import with update actions for already existing custom
   * blocks.
   */
  public static function importBlocksFull($blocks, &$context) {
    $uuidsInConfig = [];
    foreach ($blocks as $block) {
      $uuidsInConfig[] = $block['uuid'];
    }

    $entities = [];
    if(!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('block_content');
        $query->condition('uuid', $uuidsInConfig, 'IN');
        $ids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('block_content');
        $entities = $controller->loadMultiple($ids);
    }

    $context['sandbox']['max'] = count($blocks);
    $context['sandbox']['progress'] = 0;
    foreach ($blocks as $block) {
      $query = StructureSyncHelper::getEntityQuery('block_content');
      $query->condition('uuid', $block['uuid']);
      $ids = $query->execute();

      if (count($ids) <= 0) {
        $blockContent = BlockContent::create([
          'info' => $block['info'],
          'langcode' => $block['langcode'],
          'uuid' => $block['uuid'],
          'type' => $block['bundle'],
        ]);

        if (array_key_exists('fields', $block)) {
          foreach ($block['fields'] as $fieldName => $fieldValue) {
            $blockContent->set($fieldName, $fieldValue);
          }
        }

        $blockContent->save();

        if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
          drush_log('Imported "' . $block['info'] . '"', 'ok');
        }
        StructureSyncHelper::logMessage('Imported "' . $block['info'] . '"');
      }
      else {
        foreach ($entities as $entity) {
          if ($block['uuid'] === $entity->uuid()) {
            $blockContent = BlockContent::load($entity->id());
            if (!empty($blockContent)) {
              $blockContent
                ->setInfo($block['info'])
                ->set('langcode', $block['langcode']);

              if (array_key_exists('fields', $block)) {
                foreach ($block['fields'] as $fieldName => $fieldValue) {
                  $blockContent->set($fieldName, $fieldValue);
                }
              }

              $blockContent->save();
            }

            if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
              drush_log('Updated "' . $block['info'] . '"', 'ok');
            }
            StructureSyncHelper::logMessage('Updated "' . $block['info'] . '"');

            break;
          }
        }
      }

      $context['sandbox']['progress']++;
      if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
        $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
      }
    }

    $context['finished'] = 1;
  }

  /**
   * Function to import blocks safely (only adding what isn't already there).
   */
  public static function importBlocksSafe($blocks, &$context) {
    $blocksFiltered = $blocks;

    $entities = StructureSyncHelper::getEntityManager()
      ->getStorage('block_content')
      ->loadMultiple();

    foreach ($entities as $entity) {
      for ($i = 0; $i < count($blocks); $i++) {
        if ($entity->uuid() === $blocks[$i]['uuid']) {
          unset($blocksFiltered[$i]);
        }
      }
    }

    foreach ($blocksFiltered as $block) {
      $blockContent = BlockContent::create([
        'info' => $block['info'],
        'langcode' => $block['langcode'],
        'uuid' => $block['uuid'],
        'type' => $block['bundle'],
      ]);

      if (array_key_exists('fields', $block)) {
        foreach ($block['fields'] as $fieldName => $fieldValue) {
          $blockContent->set($fieldName, $fieldValue);
        }
      }

      $blockContent->save();

      if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
        drush_log('Imported "' . $block['info'] . '"', 'ok');
      }
      StructureSyncHelper::logMessage('Imported "' . $block['info'] . '"');
    }
  }

  /**
   * Function to delete all custom blocks.
   */
  public static function deleteBlocks(&$context) {
    $entities = StructureSyncHelper::getEntityManager()
      ->getStorage('block_content')
      ->loadMultiple();
    StructureSyncHelper::getEntityManager()
      ->getStorage('block_content')
      ->delete($entities);

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted all custom blocks', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted all custom blocks');
  }

  /**
   * Function to import (create) all custom blocks that need to be imported.
   */
  public static function importBlocksForce($blocks, &$context) {
    foreach ($blocks as $block) {
      $blockContent = BlockContent::create([
        'info' => $block['info'],
        'langcode' => $block['langcode'],
        'uuid' => $block['uuid'],
        'type' => $block['bundle'],
      ]);

      if (array_key_exists('fields', $block)) {
        foreach ($block['fields'] as $fieldName => $fieldValue) {
          $blockContent->set($fieldName, $fieldValue);
        }
      }

      $blockContent->save();

      if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
        drush_log('Imported "' . $block['info'] . '"', 'ok');
      }
      StructureSyncHelper::logMessage('Imported "' . $block['info'] . '"');
    }
  }

  /**
   * Function that signals that the import of custom blocks has finished.
   */
  public static function blocksImportFinishedCallback($success, $results, $operations) {
    StructureSyncHelper::logMessage('Flushing all caches');

    drupal_flush_all_caches();

    StructureSyncHelper::logMessage('Successfully flushed caches');

    StructureSyncHelper::logMessage('Successfully imported custom blocks');

    drupal_set_message(t('Successfully imported custom blocks'));
  }

}
