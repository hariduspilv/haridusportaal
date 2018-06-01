<?php

namespace Drupal\taxonomy_manager\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

/**
 * Controller routines for taxonomy_manager routes.
 */
class MainController extends ControllerBase {

  /**
   * List of vocabularies, which link to Taxonomy Manager interface.
   *
   * @return array
   *   A render array representing the page.
   */
  public function listVocabularies() {
    $new_voc_url = Url::fromRoute('entity.taxonomy_vocabulary.add_form');
    $new_voc_admin_link = $this->l(
      $this->t('Add new vocabulary'),
      $new_voc_url
    );

    $edit_voc_url = Url::fromRoute('entity.taxonomy_vocabulary.collection');
    $edit_voc_admin_link = $this->l(
      $this->t('Edit vocabulary settings'),
      $edit_voc_url
    );

    $build = [
      '#markup' => "$new_voc_admin_link | $edit_voc_admin_link",
    ];

    $voc_list = [];
    $vocabularies = $this->entityTypeManager()->getStorage('taxonomy_vocabulary')->loadMultiple();
    foreach ($vocabularies as $vocabulary) {
      $vocabulary_form = Url::fromRoute('taxonomy_manager.admin_vocabulary',
        ['taxonomy_vocabulary' => $vocabulary->id()]);
      $voc_list[] = $this->l($vocabulary->label(), $vocabulary_form);
    }
    if (!count($voc_list)) {
      $voc_list[] = ['#markup' => $this->t('No Vocabularies available')];
    }

    $build['vocabularies'] = [
      '#theme' => 'item_list',
      '#items' => $voc_list,
      '#title' => $this->t('Vocabularies'),
    ];
    return $build;
  }

}
