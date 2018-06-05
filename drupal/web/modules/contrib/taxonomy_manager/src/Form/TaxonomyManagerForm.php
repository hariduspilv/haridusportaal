<?php

namespace Drupal\taxonomy_manager\Form;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\OpenModalDialogCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\Component\Utility\Html;
use Drupal\taxonomy\VocabularyInterface;
use Drupal\taxonomy_manager\TaxonomyManagerHelper;

/**
 * Taxonomy manager class.
 */
class TaxonomyManagerForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'taxonomy_manager.vocabulary_terms_form';
  }

  /**
   * Returns the title for the whole page.
   *
   * @param string $taxonomy_vocabulary
   *   The name of the vocabulary.
   *
   * @return string
   *   The title, itself
   */
  public function getTitle($taxonomy_vocabulary) {
    return $this->t("Taxonomy Manager - %voc_name", ["%voc_name" => $taxonomy_vocabulary->label()]);
  }

  /**
   * Form constructor.
   *
   * Display a tree of all the terms in a vocabulary, with options to edit
   * each one. The form implements the Taxonomy Manager intefrace.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\taxonomy\VocabularyInterface $taxonomy_vocabulary
   *   The vocabulary being with worked with.
   *
   * @return array
   *   The form structure.
   */
  public function buildForm(array $form, FormStateInterface $form_state, VocabularyInterface $taxonomy_vocabulary = NULL) {
    $form['voc'] = ['#type' => 'value', "#value" => $taxonomy_vocabulary];
    $form['#attached']['library'][] = 'taxonomy_manager/form';

    if (TaxonomyManagerHelper::vocabularyIsEmpty($taxonomy_vocabulary->id())) {
      $form['text'] = [
        '#markup' => $this->t('No terms available'),
      ];
      $form[] = \Drupal::formBuilder()->getForm('Drupal\taxonomy_manager\Form\AddTermsToVocabularyForm', $taxonomy_vocabulary);
      return $form;
    }

    $form['toolbar'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Toolbar'),
    ];
    $form['toolbar']['add'] = [
      '#type' => 'submit',
      '#name' => 'add',
      '#value' => $this->t('Add'),
      '#ajax' => [
        'callback' => '::addFormCallback',
      ],
    ];
    $form['toolbar']['delete'] = [
      '#type' => 'submit',
      '#name' => 'delete',
      '#value' => $this->t('Delete'),
      '#ajax' => [
        'callback' => '::deleteFormCallback',
      ],
    ];
    $form['toolbar']['move'] = [
      '#type' => 'submit',
      '#name' => 'move',
      '#value' => $this->t('Move'),
      '#ajax' => [
        'callback' => '::moveFormCallback',
      ],
    ];
    $form['toolbar']['export'] = [
      '#type' => 'submit',
      '#name' => 'export',
      '#value' => $this->t('Export'),
      '#ajax' => [
        'callback' => '::exportFormCallback',
      ],
    ];

    /* Taxonomy manager. */
    $form['taxonomy']['#tree'] = TRUE;

    $form['taxonomy']['manager'] = [
      '#type' => 'fieldset',
      '#title' => Html::escape($taxonomy_vocabulary->label()),
      '#tree' => TRUE,
    ];

    $form['taxonomy']['manager']['top'] = [
      '#markup' => '',
      '#prefix' => '<div class="taxonomy-manager-tree-top">',
      '#suffix' => '</div>',
    ];

    $form['taxonomy']['manager']['tree'] = [
      '#type' => 'taxonomy_manager_tree',
      '#vocabulary' => $taxonomy_vocabulary->id(),
      '#pager_size' => \Drupal::config('taxonomy_manager.settings')->get('taxonomy_manager_pager_tree_page_size'),
    ];

    $form['taxonomy']['manager']['pager'] = ['#type' => 'pager'];

    // Add placeholder for term data form, the load-term-data field has AJAX
    // events attached and will trigger the load of the term data form. The
    // field is hidden via CSS and the value gets set in termData.js.
    $form['term-data']['#prefix'] = '<div id="taxonomy-term-data-form">';
    $form['term-data']['#suffix'] = '</div>';
    $form['load-term-data'] = [
      '#type' => 'textfield',
      '#ajax' => [
        'callback' => '::termDataCallback',
        'event' => 'change',
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $selected_terms = $form_state->getValue(['taxonomy', 'manager', 'tree']);
  }

  /**
   * AJAX callback handler for add form.
   */
  public function addFormCallback($form, FormStateInterface $form_state) {
    return $this->modalHelper($form_state, 'Drupal\taxonomy_manager\Form\AddTermsToVocabularyForm', 'taxonomy_manager.admin_vocabulary.add', $this->t('Add terms'));
  }

  /**
   * AJAX callback handler for delete form.
   */
  public function deleteFormCallback($form, FormStateInterface $form_state) {
    return $this->modalHelper($form_state, 'Drupal\taxonomy_manager\Form\DeleteTermsForm', 'taxonomy_manager.admin_vocabulary.delete', $this->t('Delete terms'));
  }

  /**
   * AJAX callback handler for move form.
   */
  public function moveFormCallback($form, FormStateInterface $form_state) {
    return $this->modalHelper($form_state, 'Drupal\taxonomy_manager\Form\MoveTermsForm', 'taxonomy_manager.admin_vocabulary.move', $this->t('Move terms'));
  }

  /**
   * AJAX callback handler for export terms from a given vocabulary.
   */
  public function exportFormCallback($form, FormStateInterface $form_state) {
    return $this->modalHelper($form_state, 'Drupal\taxonomy_manager\Form\ExportTermsForm', 'taxonomy_manager.admin_vocabulary.export', $this->t('Export terms'));
  }

  /**
   * AJAX callback handler for the term data form.
   */
  public function termDataCallback($form, FormStateInterface $form_state) {
    $taxonomy_vocabulary = $form_state->getValue('voc');
    $taxonomy_term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($form_state->getValue('load-term-data'));

    $term_form = \Drupal::service('entity.form_builder')->getForm($taxonomy_term, 'default');

    // Move the term data form into a fieldset.
    $term_form['fieldset']['#type'] = 'fieldset';
    $term_form['fieldset']['#title'] = Html::escape($taxonomy_term->getName()) . ' (' . $taxonomy_term->id() . ')';
    $term_form['fieldset']['#attributes'] = [];
    foreach (Element::children($term_form) as $key) {
      if ($key != 'fieldset') {
        $term_form['fieldset'][$key] = $term_form[$key];
        unset($term_form[$key]);
      }
    }

    $term_form['#prefix'] = '<div id="taxonomy-term-data-form">';
    $term_form['#suffix'] = '</div>';

    // Change the form action url form the current site to the add form.
    $term_form['#action'] = $this->url('entity.taxonomy_term.edit_form', ['taxonomy_term' => $taxonomy_term->id()]);

    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand('#taxonomy-term-data-form', $term_form));
    return $response;
  }

  /**
   * Term data submit handler.
   *
   * @TODO: redirect to taxonomy manager
   */
  public static function termDataFormSubmit($form, FormStateInterface $form_state) {

  }

  /**
   * Helper function to generate a modal form within an AJAX callback.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state of the current (parent) form.
   * @param string $class_name
   *   The class name of the form to embed in the modal.
   * @param string $route_name
   *   The route name the form is located.
   * @param string $title
   *   The modal title.
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   *   The ajax response.
   */
  protected function modalHelper(FormStateInterface $form_state, $class_name, $route_name, $title) {
    $taxonomy_vocabulary = $form_state->getValue('voc');
    $selected_terms = $form_state->getValue(['taxonomy', 'manager', 'tree']);

    $del_form = \Drupal::formBuilder()->getForm($class_name, $taxonomy_vocabulary, $selected_terms);
    $del_form['#attached']['library'][] = 'core/drupal.dialog.ajax';

    // Change the form action url form the current site to the add form.
    $del_form['#action'] = $this->url($route_name, ['taxonomy_vocabulary' => $taxonomy_vocabulary->id()]);

    $response = new AjaxResponse();
    $response->addCommand(new OpenModalDialogCommand($title, $del_form, ['width' => '700']));
    return $response;
  }

}
