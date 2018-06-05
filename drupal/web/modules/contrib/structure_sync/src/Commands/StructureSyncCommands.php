<?php

namespace Drupal\structure_sync\Commands;

use Drush\Commands\DrushCommands;
use Drupal\structure_sync\StructureSyncHelper;

/**
 * A Drush commandfile.
 *
 * In addition to this file, you need a drush.services.yml
 * in root of your module, and a composer.json file that provides the name
 * of the services file to use.
 *
 * See these files for an example of injecting Drupal services:
 *   - http://cgit.drupalcode.org/devel/tree/src/Commands/DevelCommands.php
 *   - http://cgit.drupalcode.org/devel/tree/drush.services.yml
 */
class StructureSyncCommands extends DrushCommands {

  /**
   * Export the taxonomies
   *
   * @validate-module-enabled structure_sync
   *
   * @command export:taxonomies
   *
   * @aliases et,export-taxonomies
   */
  public function exportTaxonomies() {
    $this->output()->writeln('Exporting taxonomies...');

    StructureSyncHelper::exportTaxonomies(['drush' => TRUE]);

    $this->logger()->info('Successfully exported taxonomies');
  }

  /**
   * Import the taxonomies
   *
   * @validate-module-enabled structure_sync
   *
   * @command import:taxonomies
   *
   * @option choice Import style choice.
   * @aliases it,import-taxonomies
   */
  public function importTaxonomies($options = ['choice' => NULL]) {
    $this->output()->writeln('Importing taxonomies...');

   $choices = [
      'full' => 'Full',
      'safe' => 'Safe',
      'force' => 'Force',
    ];

    if (!$options['choice']) {
      $options['choice'] = $this->io()->choice(dt("What import style would you like?"), $choices);
    }

    if ($options['choice'] && array_key_exists($options['choice'], $choices)) {
      $this->output()->writeln('Using "' . $choices[$options['choice']] . '" import style');

      StructureSyncHelper::importTaxonomies([
        'style' => $options['choice'],
        'drush' => TRUE,
      ]);

      $this->logger()->info('Successfully imported taxonomies');
    }
    else {
      $this->logger()->warning('No choice made for import style on importing taxonomies');
    }
  }

  /**
   * Export blocks
   *
   * @validate-module-enabled structure_sync
   *
   * @command export:blocks
   * @aliases eb,export-blocks
   */
  public function exportBlocks() {
    $this->output()->writeln('Exporting blocks...');

    StructureSyncHelper::exportCustomBlocks(['drush' => TRUE]);

    $this->logger()->info('Successfully exported blocks');
  }

  /**
   * Import blocks
   *
   * @validate-module-enabled structure_sync
   *
   * @command import:blocks
   *
   * @option choice Import style choice.
   * @aliases ib,import-blocks
   */
  public function importBlocks($options = ['choice' => NULL]) {
    $this->output()->writeln('Importing blocks...');

   $choices = [
      'full' => 'Full',
      'safe' => 'Safe',
      'force' => 'Force',
    ];

    if (!$options['choice']) {
      $options['choice'] = $this->io()->choice(dt("What import style would you like?"), $choices);
    }

    if ($options['choice'] && array_key_exists($options['choice'], $choices)) {
      $this->output()->writeln('Using "' . $choices[$options['choice']] . '" import style');

      StructureSyncHelper::importCustomBlocks([
        'style' => $options['choice'],
        'drush' => TRUE,
      ]);

      $this->logger()->info('Successfully imported custom blocks');
    }
    else {
      $this->logger()->warning('No choice made for import style on importing custom blocks');
    }
  }

  /**
   * Export menu links
   *
   * @validate-module-enabled structure_sync
   *
   * @command export:menus
   * @aliases em,export-menus
   */
  public function exportMenus() {
    $this->output()->writeln('Exporting menu links...');

    StructureSyncHelper::exportMenuLinks(['drush' => TRUE]);

    $this->logger()->info('Successfully exported menu links');
  }

  /**
   * Import menu links
   *
   * @validate-module-enabled structure_sync
   *
   * @command import:menus
   *
   * @option choice Import style choice.
   * @aliases im,import-menus
   */
  public function importMenus($options = ['choice' => NULL]) {

    $this->output()->writeln('Importing menu links...');

   $choices = [
      'full' => 'Full',
      'safe' => 'Safe',
      'force' => 'Force',
    ];

    if (!$options['choice']) {
      $options['choice'] = $this->io()->choice(dt("What import style would you like?"), $choices);
    }

    if ($options['choice'] && array_key_exists($options['choice'], $choices)) {
      $this->output()->writeln('Using "' . $choices[$options['choice']] . '" import style');

      StructureSyncHelper::importMenuLinks([
        'style' => $options['choice'],
        'drush' => TRUE,
      ]);

      $this->logger()->info('Successfully imported menu links');
    }
    else {
      $this->logger()->warning('No choice made for import style on importing menu links');
    }
  }

  /**
   * Import menu links, Taxonomy and Blocks
   *
   * @validate-module-enabled structure_sync
   *
   * @command import:all
   *
   * @option choice Import style choice.
   * @aliases ia,import-all
   */
  public function importAll($options = ['choice' => NULL]) {
    $this->importTaxonomies($options);
    $this->importBlocks($options);
    $this->importMenus($options);
  }

  /**
   * Export menu links, Taxonomy and Blocks
   *
   * @validate-module-enabled structure_sync
   *
   * @command export:all
   * @aliases ea,export-all
   */
  public function exportAll() {
    $this->exportTaxonomies();
    $this->exportBlocks();
    $this->exportMenus();
  }

}
