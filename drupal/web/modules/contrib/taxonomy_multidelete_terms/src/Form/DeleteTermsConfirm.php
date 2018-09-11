<?php

namespace Drupal\taxonomy_multidelete_terms\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\taxonomy\Entity\Term;
use Drupal\user\PrivateTempStoreFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Defines a confirmation form for deleting term data.
 */
class DeleteTermsConfirm extends ConfirmFormBase {

  protected $tempStore;

  /**
   * {@inheritdoc}
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    // For taxonomy_multidelete_terms any unique namespace will do.
    $this->tempStore = $temp_store_factory->get('taxonomy_multidelete_terms');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.private_tempstore')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'taxonomy_multidelete_terms_delete_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    // The question to display to the user.
    return t('Are you sure you want to delete these taxonomy terms?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('taxonomy_multidelete_terms.overview_form', array('taxonomy_vocabulary' => $this->getVocablaryName()));
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t('Deleting a term will delete all its children if there are any. This action cannot be undone.');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelText() {
    return $this->t('Cancel');
  }

  /**
   * {@inheritdoc}
   */
  protected function getRedirectUrl() {
    return $this->getCancelUrl();
  }

  /**
   * {@inheritdoc}
   */
  protected function deleteStore() {
    $storedata = $this->tempStore->get('deletedterms');
    if (!empty($storedata)) {
      $this->tempStore->delete('deletedterms');
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function getDeletionMessage() {
    $name = implode(', ', $this->getTermsName());
    return $this->t('Deleted term(s) %name.', array('%name' => $name));
  }

  /**
   * {@inheritdoc}
   */
  protected function getVocablaryName() {
    return $this->tempStore->get('vocabulary');
  }

  /**
   * {@inheritdoc}
   */
  protected function getTermsName() {
    $tids = $this->getTermsId();
    $name = array();
    foreach ($tids as $tid) {
      $name[] = Term::load($tid)->get('name')->value;
    }
    return $name;
  }

  /**
   * {@inheritdoc}
   */
  protected function getTermsId() {
    $terms_data = $this->tempStore->get('deletedterms');
    $tids = array();
    foreach ($terms_data as $value) {
      if (!empty($value['term']['check-delete'])) {
        $tids[] = $value['term']['tid'];
      }
    }
    return $tids;
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $term_data = $this->getTermsId();
    $form['terms'] = array(
      '#prefix' => '<ul>',
      '#suffix' => '</ul>',
      '#tree' => TRUE,
    );
    foreach ($term_data as $tid) {
      $val = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($tid);
      if (!$val) {
        $form_state->setRedirectUrl($this->getRedirectUrl());
        $response = new RedirectResponse($this->getCancelUrl()->toString());
        $response->send();
        return $response;
      }
      $termname = Term::load($tid)->get('name')->value;
      $form['terms'][$tid] = array(
        '#type' => 'hidden',
        '#value' => $tid,
        '#prefix' => '<li>',
        '#suffix' => $termname . "</li>\n",
      );
    }
    $form['operation'] = array('#type' => 'hidden', '#value' => 'cancel');

    $form = parent::buildForm($form, $form_state);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $selected_terms = array_filter($form_state->getValue('terms'));
    if ($form_state->getValue('terms') === 'cancel') {
      $this->deleteStore();
    }
    $batch = [
      'title' => t('Deleting Terms...'),
      'operations' => [
        [
          '\Drupal\taxonomy_multidelete_terms\TaxonomyMultideleteBatch::processTerms',
          [$selected_terms],
        ],
      ],
      'finished' => '\Drupal\taxonomy_multidelete_terms\TaxonomyMultideleteBatch::finishProcess',
    ];
    batch_set($batch);

    $form_state->setRedirectUrl($this->getRedirectUrl());

  }

}
