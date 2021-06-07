<?php

namespace Drupal\sitemap\Plugin\Sitemap;

use Drupal\Core\Form\FormStateInterface;
use Drupal\sitemap\SitemapBase;

/**
 * Provides a sitemap for a book.
 *
 * @Sitemap(
 *   id = "book",
 *   title = @Translation("Book name"),
 *   description = @Translation("Book type"),
 *   settings = {
 *     "title" = "",
 *     "show_expanded" = TRUE,
 *   },
 *   deriver = "Drupal\sitemap\Plugin\Derivative\BookSitemapDeriver",
 *   enabled = FALSE,
 *   book = "",
 * )
 */
class Book extends SitemapBase {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    if (\Drupal::moduleHandler()->moduleExists('book')) {
      $form = parent::settingsForm($form, $form_state);

      // Provide the book name as the default title.
      $bid = $this->getPluginDefinition()['book'];
      $book = \Drupal::entityTypeManager()->getStorage('node')->load($bid);
      $form['title']['#default_value'] = $this->settings['title'] ?: $book->label();

      $form['show_expanded'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Show expanded'),
        '#default_value' => $this->settings['show_expanded'],
        '#description' => $this->t('Disable if you do not want to display the entire book outline on the sitemap.'),
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function view() {
    /** @var \Drupal\book\BookManagerInterface $book_manager */
    $book_manager = \Drupal::service('book.manager');
    $book_id = $this->pluginDefinition['book'];

    $max_depth = $this->settings['show_expanded'] ? NULL : 1;
    $tree = $book_manager->bookTreeAllData($book_id, NULL, $max_depth);
    $content = $book_manager->bookTreeOutput($tree);

    return [
      '#theme' => 'sitemap_item',
      '#title' => $this->settings['title'],
      '#content' => $content,
      '#sitemap' => $this,
    ];
  }

}
