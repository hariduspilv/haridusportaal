<?php
/**
 * Created by PhpStorm.
 * User: p1ratrulezzz
 * Date: 21.11.16
 * Time: 22:46
 */

namespace Drupal\taxonomy_term_depth\Form;


use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\VocabularyInterface;

class DepthUpdateForm extends FormBase {
  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'taxonomy_term_depth_update_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, VocabularyInterface $vocabulary = NULL) {
    //Ensure that we have vocabulary
    $vocabulary = \Drupal::request()->get('taxonomy_vocabulary');

    /**
     * @var \Drupal\Core\Database\Connection
     */
    $dbh = \Drupal::database();
    $countAll = $dbh->select('taxonomy_term_field_data', 'ttd')
      ->condition('ttd.vid', $vocabulary->id())
      ->countQuery()->execute()->fetchField();

    $countEmpty = $dbh->select('taxonomy_term_field_data', 'ttd')
      ->condition('ttd.vid', $vocabulary->id())
      ->condition('ttd.depth_level', '', 'IS NULL')
      ->countQuery()->execute()->fetchField();

    // Truncate until two digits at the end without rounding the value.
    $percentProcessed = floor((100 - (100 * $countEmpty / $countAll)) * 100) / 100;
    $percentProcessed = $percentProcessed > 100 ? 100 : $percentProcessed;
    $form['display']['processed_info'] = [
      '#type' => 'item',
      'value' => [
        '#markup' => '
            <span class="title">Processed</span>
            <span class="value">'. $percentProcessed .'</span>
            <span class="suffix">%</span>
        ',
      ],
    ];

    if ($percentProcessed < 100 && ($queued_count = taxonomy_term_depth_queue_manager($vocabulary->id())->queueSize()) > 1)
    $form['display']['queued_info'] = [
      '#type' => 'item',
      'value' => [
        '#markup' => '
            <span class="title">Queued</span>
            <span class="value">'. $queued_count .'</span>
            <span class="suffix">terms</span>
        ',
      ],
    ];

    $form['actions']['rebuild all'] = [
      '#identity' => 'btn_rebuild_all',
      '#value' => $this->t('Rebuild all terms (in batch)'),
      '#type' => 'submit',
    ];

    $form['actions']['rebuild all voc'] = [
      '#identity' => 'btn_rebuild_all_voc',
      '#value' => $this->t('Rebuild all terms in all vocabularies (in batch)'),
      '#type' => 'submit',
    ];

    $form['actions']['rebuild all queue'] = [
      '#identity' => 'btn_rebuild_all_queue',
      '#value' => $this->t('Queue all items to rebuild'),
      '#type' => 'submit',
    ];

    $form['actions']['rebuild all voc queue'] = [
      '#identity' => 'btn_rebuild_all_voc_queue',
      '#value' => $this->t('Queue all items to rebuild (for all vocabularies)'),
      '#type' => 'submit',
    ];

    if ($percentProcessed < 100) {
      $form['actions']['rebuild missing queue'] = [
        '#identity' => 'btn_rebuild_missing_queue',
        '#value'    => $this->t('Queue missing items'),
        '#type'     => 'submit',
      ];
    }

    $form['actions']['rebuild missing all voc queue'] = [
      '#identity' => 'btn_rebuild_missing_all_voc_queue',
      '#value'    => $this->t('Queue missing items (for all vocabularies)'),
      '#type'     => 'submit',
    ];

    $form['vid'] = [
      '#type' => 'value',
      '#value' => $vocabulary->id(),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {}

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $identity = isset($form_state->getTriggeringElement()['#identity']) ? $form_state->getTriggeringElement()['#identity'] : 'unknown';
    $options = array();
    $options['vids'] = $form_state->getValue('vid');
    switch ($identity) {
      case 'btn_rebuild_all_voc':
        // Apply "btn_rebuild_all" to all vocabularies
        $options['vids'] = NULL;
      case 'btn_rebuild_all':
        batch_set(array(
          'operations' => array(
            array('taxonomy_term_depth_batch_callbacks_update_term_depth', array($options)),
          ),
          'title' => $this->t('Updating depths for all terms'),
          'file' => TAXONOMY_TERM_DEPTH_ROOT_REL. '/taxonomy_term_depth.batch.inc',
        ));
        break;
      case 'btn_rebuild_all_voc_queue':
        taxonomy_term_depth_queue_manager()->queueBatch();
        break;
      case 'btn_rebuild_all_queue':
        taxonomy_term_depth_queue_manager($options['vids'])->queueBatch();
        break;
      case 'btn_rebuild_missing_all_voc_queue':
        taxonomy_term_depth_queue_manager()->queueBatchMissing();
        break;
      case 'btn_rebuild_missing_queue':
        taxonomy_term_depth_queue_manager($options['vids'])->queueBatchMissing();
        break;
      default:
        drupal_set_message($this->t('Wrong operation selected'));
    }
  }
}
