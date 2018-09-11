<?php

/**
 * @file
 * Contains \Drupal\module_missing_message_fixer\Form\ModuleMissingMessageFixerForm.
 */

namespace Drupal\module_missing_message_fixer\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\module_missing_message_fixer\ModuleMissingMessageFixer;

class ModuleMissingMessageFixerForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'module_missing_message_fixer_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, \Drupal\Core\Form\FormStateInterface $form_state) {
    $form = [];

    // Fancy title string.
    $title = t('This list comes from the system table and is checked against the drupal_get_filename() function. See <a href="@link" target="_blank">this issue</a> for more information.', [
      '@link' => 'https://www.drupal.org/node/2487215'
      ]);

    // Title.
    $form['title'] = [
      '#type' => 'item',
      '#markup' => '<h4>' . $title . '</h4>',
    ];

    // Fancy submit buttons to win this.
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => t('Remove These Errors!'),
    ];

    // Set the tables select to make this more granular.
    $form['table'] = [
      '#type' => 'tableselect',
      '#header' => ModuleMissingMessageFixer::getTableHeader(),
      '#options' => ModuleMissingMessageFixer::getTableRows(),
      '#empty' => t('No Missing Modules Found!!!'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, \Drupal\Core\Form\FormStateInterface $form_state) {
    $modules = [];
    // Go through each record and add it to the array to win.
    foreach ($form_state->getValue(['table']) as $module) {
      if ($module) {
        $modules[] = $module;
      }
    }

    /**
     * @todo
     *
     * https://www.drupal.org/forum/support/module-development-and-code-questions/2015-09-09/how-to-remove-mymodule-configurations#comment-10820772
     */

    // Delete if there is no modules.
    if (count($modules) > 0) {
      $query = \Drupal::database()->delete('key_value');
      $query->condition('collection', 'system.schema');
      $query->condition('name', $modules, 'IN');
      $query->execute();
    }
  }

}
