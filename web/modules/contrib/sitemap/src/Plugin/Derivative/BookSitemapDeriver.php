<?php

namespace Drupal\sitemap\Plugin\Derivative;

use Drupal\book\BookManagerInterface;
use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * {@inheritdoc}
 */
class BookSitemapDeriver extends DeriverBase implements ContainerDeriverInterface {
  use StringTranslationTrait;

  /**
   * The book manager.
   *
   * @var \Drupal\book\BookManagerInterface
   */
  protected $bookManager;

  /**
   * Constructs new SitemapBooks sitemap_map.
   *
   * @param \Drupal\book\BookManagerInterface $book_manager
   *   The book manager.
   */
  public function __construct(BookManagerInterface $book_manager) {
    $this->bookManager = $book_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, $base_plugin_id) {
    if (\Drupal::moduleHandler()->moduleExists('book')) {
      return new static(
        $container->get('book.manager')
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {
    if (\Drupal::moduleHandler()->moduleExists('book')) {
      foreach ($this->bookManager->getAllBooks() as $id => $book) {
        $this->derivatives[$id] = $base_plugin_definition;
        $this->derivatives[$id]['title'] = $this->t('Book: @book', ['@book' => $book['title']]);
        $this->derivatives[$id]['description'] = $book['type'];
        $this->derivatives[$id]['settings']['title'] = NULL;
        $this->derivatives[$id]['book'] = $id;
        $this->derivatives[$id]['config_dependencies']['config'] = ['book.settings'];
      }
    }
    return $this->derivatives;
  }

}
