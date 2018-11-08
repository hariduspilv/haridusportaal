<?php

namespace Drupal\search_api_autocomplete\Plugin\search_api_autocomplete\search;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\search_api\Utility\QueryHelperInterface;
use Drupal\search_api_autocomplete\Search\SearchPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides autocomplete support for the search_api_page module.
 *
 * @SearchApiAutocompleteSearch(
 *   id = "page",
 *   group_label = @Translation("Search pages"),
 *   group_description = @Translation("Searches provided by the <em>Search pages</em> module"),
 *   provider = "search_api_page",
 *   deriver = "Drupal\search_api_autocomplete\Plugin\search_api_autocomplete\search\PageDeriver",
 * )
 */
class Page extends SearchPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The query helper service.
   *
   * @var \Drupal\search_api\Utility\QueryHelperInterface|null
   */
  protected $queryHelper;

  /**
   * Creates a new Page instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $plugin = new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager')
    );

    $plugin->setQueryHelper($container->get('search_api.query_helper'));

    return $plugin;
  }

  /**
   * Retrieves the query helper.
   *
   * @return \Drupal\search_api\Utility\QueryHelperInterface
   *   The query helper.
   */
  public function getQueryHelper() {
    return $this->queryHelper ?: \Drupal::service('search_api.query_helper');
  }

  /**
   * Sets the query helper.
   *
   * @param \Drupal\search_api\Utility\QueryHelperInterface $query_helper
   *   The new query helper.
   *
   * @return $this
   */
  public function setQueryHelper(QueryHelperInterface $query_helper) {
    $this->queryHelper = $query_helper;
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function createQuery($keys, array $data = []) {
    $query = $this->getQueryHelper()->createQuery($this->getIndex());
    $query->keys($keys);
    $page = $this->getPage();
    if ($page && $page->getSearchedFields()) {
      $query->setFulltextFields(array_values($page->getSearchedFields()));
    }
    return $query;
  }

  /**
   * Retrieves the search page entity for this plugin.
   *
   * @return \Drupal\search_api_page\SearchApiPageInterface|null
   *   The search page, or NULL if it couldn't be loaded.
   */
  protected function getPage() {
    /** @var \Drupal\search_api_page\SearchApiPageInterface $page */
    $page = $this->getEntityTypeManager()
      ->getStorage('search_api_page')
      ->load($this->getDerivativeId());
    return $page;
  }

  /**
   * {@inheritdoc}
   */
  public function calculateDependencies() {
    $this->dependencies = parent::calculateDependencies();

    $page = $this->getPage();
    if ($page) {
      $key = $page->getConfigDependencyKey();
      $name = $page->getConfigDependencyName();
      $this->addDependency($key, $name);
    }

    return $this->dependencies;
  }

}
