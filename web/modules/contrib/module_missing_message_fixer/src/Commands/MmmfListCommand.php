<?php

namespace Drupal\module_missing_message_fixer\Commands;

use Drush\Commands\DrushCommands;
use Drupal\module_missing_message_fixer\ModuleMissingMessageFixer;
use Consolidation\OutputFormatters\StructuredData\RowsOfFields;

/**
 * Class MmmfListCommand.
 *
 * @package Drupal\module_missing_message_fixer
 */
class MmmfListCommand extends DrushCommands {

  /**
   * The ModuleMissingMessageFixer service.
   *
   * @var \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer
   */
  protected $fixer;

  /**
   * MmmfFixCommand constructor.
   *
   * @param \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer $mmmf
   *   The CLI service which allows interoperability.
   */
  public function __construct(ModuleMissingMessageFixer $mmmf) {
    $this->fixer = $mmmf;
  }

  /**
   * Returns a list of modules that have missing messages.
   *
   * @command module-missing-message-fixer:list
   *
   * @usage drush module-missing-message-fixer:list
   *   Returns a list of modules that have missing messages.
   *
   * @aliases mmmfl
   *
   * @field-labels
   *   name: Name
   *   type: Type
   */
  public function listCommand() {
    $rows = $this->fixer->getTableRows();
    if (count($rows) > 0) {
      $table[] = $this->fixer->getTableHeader();
      foreach ($rows as $row) {
        $table[] = $row;
      }
      return new RowsOfFields($table);
    }
    $this->output()->writeln('No Missing Modules Found!!!');
  }

}
