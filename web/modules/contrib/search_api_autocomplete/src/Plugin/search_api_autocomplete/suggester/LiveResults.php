<?php

namespace Drupal\search_api_autocomplete\Plugin\search_api_autocomplete\suggester;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\search_api\LoggerTrait;
use Drupal\search_api\Plugin\PluginFormTrait;
use Drupal\search_api\Query\QueryInterface;
use Drupal\search_api\SearchApiException;
use Drupal\search_api_autocomplete\Suggester\SuggesterPluginBase;
use Drupal\search_api_autocomplete\Suggestion\SuggestionFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a suggester plugin that displays live results.
 *
 * @SearchApiAutocompleteSuggester(
 *   id = "live_results",
 *   label = @Translation("Display live results"),
 *   description = @Translation("Display live results to visitors as they type. (Unless the server is configured to find partial matches, this will most likely only produce results once the visitor has finished typing.)"),
 * )
 */
class LiveResults extends SuggesterPluginBase implements PluginFormInterface {

  use LoggerTrait;
  use PluginFormTrait;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface|null
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    /** @var static $plugin */
    $plugin = parent::create($container, $configuration, $plugin_id, $plugin_definition);

    $plugin->setEntityTypeManager($container->get('entity_type.manager'));
    $plugin->setLogger($container->get('logger.channel.search_api_autocomplete'));

    return $plugin;
  }

  /**
   * Retrieves the entity type manager.
   *
   * @return \Drupal\Core\Entity\EntityTypeManagerInterface
   *   The entity type manager.
   */
  public function getEntityTypeManager() {
    return $this->entityTypeManager ?: \Drupal::service('entity_type.manager');
  }

  /**
   * Sets the entity type manager.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The new entity type manager.
   *
   * @return $this
   */
  public function setEntityTypeManager(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
    return $this;
  }

  /**
   * Retrieves the logger.
   *
   * @return \Psr\Log\LoggerInterface
   *   The logger.
   */
  public function getLogger() {
    return $this->logger ?: \Drupal::service('logger.channel.search_api_autocomplete');
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'fields' => [],
      'view_modes' => [],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['#attached']['library'][] = 'search_api/drupal.search_api.admin_css';

    // Let the user select the fulltext fields to use for the searches.
    $search = $this->getSearch();
    $fields = $search->getIndex()->getFields();
    $fulltext_fields = $search->getIndex()->getFulltextFields();
    $options = [];
    foreach ($fulltext_fields as $field) {
      $options[$field] = $fields[$field]->getFieldIdentifier();
    }
    $form['fields'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Override used fields'),
      '#description' => $this->t('Select the fields which should be searched for matches when looking for autocompletion suggestions. Leave blank to use the same fields as the underlying search.'),
      '#options' => $options,
      '#default_value' => array_combine($this->configuration['fields'], $this->configuration['fields']),
      '#attributes' => ['class' => ['search-api-checkboxes-list']],
    ];

    $form['view_modes'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('View modes'),
      '#description' => $this->t('Please select the view modes to use for live results.'),
    ];
    // Let the user select the view mode to use for live results.
    $selected_view_modes = $this->configuration['view_modes'];
    foreach ($search->getIndex()->getDatasources() as $datasource_id => $datasource) {
      foreach ($datasource->getBundles() as $bundle => $name) {
        $view_modes = $datasource->getViewModes($bundle);
        // If there are no view modes available, there's no need to display a
        // select box. Just default to "Use only label".
        if (!$view_modes) {
          $form['view_modes'][$datasource_id][$bundle] = [
            '#type' => 'value',
            '#value' => '',
          ];
          continue;
        }

        $default_value = '';
        if (isset($selected_view_modes[$datasource_id][$bundle])) {
          $default_value = $selected_view_modes[$datasource_id][$bundle];
        }

        $form['view_modes'][$datasource_id][$bundle] = [
          '#type' => 'select',
          '#title' => $name,
          '#options' => [
            '' => $this->t('Use only label'),
          ] + $view_modes,
          '#default_value' => $default_value,
        ];
      }
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    // Change the "fields" option to an array of just the selected fields.
    $values['fields'] = array_keys(array_filter($values['fields']));
    $this->setConfiguration($values);
  }

  /**
   * {@inheritdoc}
   */
  public function getAutocompleteSuggestions(QueryInterface $query, $incomplete_key, $user_input) {
    $fulltext_fields = $this->configuration['fields'];
    $index = $query->getIndex();
    if ($fulltext_fields) {
      // Take care only to set fields that are still indexed fulltext fields.
      $index_fields = $index->getFulltextFields();
      $fulltext_fields = array_intersect($fulltext_fields, $index_fields);
      if ($fulltext_fields) {
        $query->setFulltextFields($fulltext_fields);
      }
      else {
        $args = [
          '@suggester' => $this->label(),
          '@search' => $this->getSearch()->label(),
          '@index' => $index->label(),
        ];
        $this->getLogger()->warning('Only invalid fulltext fields set for suggester "@suggester" in autocomplete settings for search "@search" on index "@index".', $args);
      }
    }
    $query->keys($user_input);

    try {
      $results = $query->execute();
    }
    catch (SearchApiException $e) {
      // If the query fails, there's nothing we can do about that.
      return [];
    }

    // Pre-load the result items for performance reasons.
    $item_ids = array_keys($results->getResultItems());
    $objects = $index->loadItemsMultiple($item_ids);
    $factory = new SuggestionFactory($user_input);

    $suggestions = [];
    $view_modes = $this->configuration['view_modes'];
    foreach ($results->getResultItems() as $item_id => $item) {
      // If the result object could not be loaded, there's little we can do
      // here.
      if (empty($objects[$item_id])) {
        continue;
      }

      $object = $objects[$item_id];
      $item->setOriginalObject($object);
      try {
        $datasource = $item->getDatasource();
      }
      catch (SearchApiException $e) {
        // This should almost never happen, but theoretically it could, so we
        // just skip the item if this happens.
        continue;
      }

      // Check whether the user has access to this item.
      if (!$item->checkAccess()) {
        continue;
      }

      // Can't include results that don't have a URL.
      $url = $datasource->getItemUrl($object);
      if (!$url) {
        continue;
      }

      $datasource_id = $item->getDatasourceId();
      $bundle = $datasource->getItemBundle($object);
      // If no view mode was selected for this bundle, just use the label.
      if (empty($view_modes[$datasource_id][$bundle])) {
        $label = $datasource->getItemLabel($object);
        $suggestions[] = $factory->createUrlSuggestion($url, $label);
      }
      else {
        $view_mode = $view_modes[$datasource_id][$bundle];
        $render = $datasource->viewItem($object, $view_mode);
        if ($render) {
          $suggestions[] = $factory->createUrlSuggestion($url, NULL, $render);
        }
      }
    }

    return $suggestions;
  }

  /**
   * {@inheritdoc}
   */
  public function calculateDependencies() {
    $this->dependencies = parent::calculateDependencies();

    $index = $this->getSearch()->getIndex();
    foreach ($this->configuration['view_modes'] as $datasource_id => $bundles) {
      $datasource = $index->getDatasource($datasource_id);
      $entity_type_id = $datasource->getEntityTypeId();
      // If the datasource doesn't represent an entity type, we unfortunately
      // can't know what dependencies its view modes might have.
      if (!$entity_type_id) {
        continue;
      }
      foreach ($bundles as $bundle => $view_mode) {
        if ($view_mode === '') {
          continue;
        }
        /** @var \Drupal\Core\Entity\EntityViewModeInterface $view_mode_entity */
        $view_mode_entity = $this->getEntityTypeManager()
          ->getStorage('entity_view_mode')
          ->load($entity_type_id . '.' . $view_mode);
        if ($view_mode_entity) {
          $key = $view_mode_entity->getConfigDependencyKey();
          $name = $view_mode_entity->getConfigDependencyName();
          $this->addDependency($key, $name);
        }
      }
    }

    return $this->dependencies;
  }

  /**
   * {@inheritdoc}
   */
  public function onDependencyRemoval(array $dependencies) {
    // All dependencies of this suggester are entity view modes, so we go
    // through all of the view modes set for specific bundles and remove all
    // those which have been removed (setting them back to "Use only label").
    // First, we collect all view mode dependencies keyed by entity ID, to make
    // this easier.
    $removed_view_modes = [];
    $non_view_mode_dependencies = FALSE;
    foreach ($dependencies as $objects) {
      foreach ($objects as $object) {
        if ($object instanceof EntityInterface
            && $object->getEntityTypeId() === 'entity_view_mode') {
          $removed_view_modes[$object->id()] = TRUE;
        }
        else {
          $non_view_mode_dependencies = TRUE;
        }
      }
    }

    // Then, we go through all bundle settings and look for those removed view
    // modes.
    $index = $this->getSearch()->getIndex();
    foreach ($this->configuration['view_modes'] as $datasource_id => $bundles) {
      $datasource = $index->getDatasource($datasource_id);
      $entity_type_id = $datasource->getEntityTypeId();
      // If the datasource doesn't represent an entity type, we unfortunately
      // can't know what dependencies its view modes might have.
      if (!$entity_type_id) {
        continue;
      }
      foreach ($bundles as $bundle => $view_mode) {
        if ($view_mode === '') {
          continue;
        }
        $view_mode_entity_id = $entity_type_id . '.' . $view_mode;
        if (!empty($removed_view_modes[$view_mode_entity_id])) {
          $this->configuration['view_modes'][$datasource_id][$bundle] = '';
        }
      }
    }

    // This will have successfully dealt with all affected dependencies unless
    // non-view mode dependencies (perhaps set by the parent class) were
    // involved.
    return !$non_view_mode_dependencies;
  }

}
