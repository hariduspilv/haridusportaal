<?php

namespace Drupal\sitemap\Plugin\Sitemap;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\sitemap\SitemapBase;
use Drupal\taxonomy\VocabularyInterface;

/**
 * Provides a sitemap for an taxonomy vocabulary.
 *
 * @Sitemap(
 *   id = "vocabulary",
 *   title = @Translation("Vocabulary"),
 *   description = @Translation("Vocabulary description"),
 *   settings = {
 *     "title" = "",
 *     "show_description" = FALSE,
 *     "show_count" = FALSE,
 *     "term_depth" = 9,
 *     "term_count_threshold" = 0,
 *     "customize_link" = FALSE,
 *     "term_link" = "entity.taxonomy_term.canonical|taxonomy_term",
 *     "always_link" = FALSE,
 *     "enable_rss" = FALSE,
 *     "rss_link" = "view.taxonomy_term.feed_1|arg_0",
 *     "rss_depth" = 9,
 *   },
 *   deriver = "Drupal\sitemap\Plugin\Derivative\VocabularySitemapDeriver",
 *   enabled = FALSE,
 *   vocabulary = "",
 * )
 */
class Vocabulary extends SitemapBase {

  /**
   * @var int
   * The maximum depth that may be configured for taxonomy terms.
   */
  const DEPTH_MAX = 9;

  /**
   * @var int
   * The term depth value that equates to the setting being disabled.
   */
  const DEPTH_DISABLED = 0;

  /**
   * @var int
   * The threshold count value that equates to the setting being disabled.
   */
  const THRESHOLD_DISABLED = 0;

  /**
   * @var string
   * The default taxonomy term route|arg.
   */
  const DEFAULT_TERM_LINK = 'entity.taxonomy_term.canonical|taxonomy_term';

  /**
   * @var string
   * The default taxonomy term RSS feed route|arg.
   */
  const DEFAULT_TERM_RSS_LINK = 'view.taxonomy_term.feed_1|arg_0';


  //@TODO: Possible to set settings as class properties?

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    // Provide the menu name as the default title.
    $vid = $this->getPluginDefinition()['vocabulary'];
    $vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load($vid);
    $form['title']['#default_value'] = $this->settings['title'] ?: $vocab->label();

    $form['show_description'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Display vocabulary description'),
      '#default_value' => $this->settings['show_description'],
      '#description' => $this->t('When enabled, this option will show the vocabulary description.'),
    ];

    $form['show_count'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Display node counts next to taxonomy terms'),
      '#default_value' => $this->settings['show_count'],
      '#description' => $this->t('When enabled, this option will show the number of nodes in each taxonomy term.'),
    ];

    $form['term_depth'] = [
      // @TODO: Number type not submitting?
      //'#type' = 'number',
      '#type' => 'textfield',
      '#title' => $this->t('Term depth'),
      '#default_value' => $this->settings['term_depth'],
      //'#min' => self::DEPTH_DISABLED,
      //'#max' => self::DEPTH_MAX,
      '#size' => 3,
      '#description' => $this->t(
        'Specify how many levels of taxonomy terms should be included. For instance, enter <code>1</code> to only include top-level terms, or <code>@disabled</code> to include no terms. The maximum depth is <code>@max</code>.',
        ['@disabled' => self::DEPTH_DISABLED, '@max' => self::DEPTH_MAX]
      ),
    ];

    $form['term_count_threshold'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Term count threshold'),
      '#default_value' => $this->settings['term_count_threshold'],
      '#size' => 3,
      '#description' => $this->t(
        'Only show taxonomy terms whose node counts are greater than this threshold. Set to <em>@disabled</em> to disable this threshold. Note that in hierarchical taxonomies, parent items with children will still be shown.',
        ['@disabled' => self::THRESHOLD_DISABLED]
      ),
    ];

    $form['customize_link'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Customize term links'),
      '#default_value' => $this->settings['customize_link']
    ];
    $customizeLinkName = 'plugins[vocabulary:' . $vid . '][settings][customize_link]';

    $form['term_link'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Term link route and argument'),
      '#default_value' => $this->settings['term_link'],
      "#description" => $this->t('Provide the route name and route argument name for the link, in the from of <code>route.name|argument.name</code>. The default value of this field is <code>entity.taxonomy_term.canonical|taxonomy_term</code>.'),
      '#states' => [
        'visible' => [
          ':input[name="' . $customizeLinkName . '"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['always_link'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Always link to the taxonomy term.'),
      '#default_value' => $this->settings['always_link'],
      '#description' => $this->t('There are a few cases where a taxonomy term maybe be displayed in the list, but will not have a link created (for example, terms without any tagged content [nodes], or parent terms displayed when the threshold is greater than zero). Check this box to ensure that a link to the taxonomy term is always provided.'),
      '#states' => [
        'visible' => [
          ':input[name="' . $customizeLinkName . '"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['enable_rss'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable RSS feed links'),
      '#default_value' => $this->settings['enable_rss'],
    ];
    $enableRssName = 'plugins[vocabulary:' . $vid . '][settings][enable_rss]';

    $form['rss_link'] = [
      '#type' => 'textfield',
      '#title' => $this->t('RSS route and argument'),
      '#default_value' => $this->settings['rss_link'],
      "#description" => $this->t('Provide the route name and route argument name for the link, in the from of <code>route.name|argument.name</code>. The default value of this field is <code>view.taxonomy_term.feed_1|arg_0</code>.'),
      '#states' => [
        'visible' => [
          ':input[name="' . $enableRssName . '"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['rss_depth'] = [
      '#type' => 'textfield',
      '#title' => $this->t('RSS depth'),
      '#default_value' => $this->settings['rss_depth'],
      '#size' => 3,
      '#maxlength' => 10,
      '#description' => $this->t(
        'Specify how many levels of taxonomy terms should have a link to the default RSS feed included. For instance, enter <code>1</code> to include an RSS feed for the top-level terms, or <code>@disabled</code> to not include a feed. The maximum depth is <code>@max</code>.',
        ['@disabled' => self::DEPTH_DISABLED, '@max' => self::DEPTH_MAX]
      ),
      '#states' => [
        'visible' => [
          ':input[name="' . $enableRssName . '"]' => ['checked' => TRUE],
        ],
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function view() {
    $vid = $this->pluginDefinition['vocabulary'];
    /** @var \Drupal\taxonomy\Entity\Vocabulary $vocabulary */
    $vocabulary = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load($vid);
    $content = [];

    if (isset($this->settings['show_description']) && $this->settings['show_description']) {
      $content[] = ['#markup' => $vocabulary->getDescription()];
    }

    // Plan for a nested list of terms.
    $list = [];
    if ($maxDepth = $this->settings['term_depth']) {
      /** @var \Drupal\taxonomy\TermStorageInterface $termStorage */
      $termStorage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

      $hierarchyType = $termStorage->getVocabularyHierarchyType($vid);
      // Fetch the top-level terms.
      $terms = $termStorage->loadTree($vid, 0, 1);
      // We might not need to worry about the vocabulary being nested.
      if ($hierarchyType == VocabularyInterface::HIERARCHY_DISABLED || $maxDepth == 1) {
        foreach ($terms as $term) {
          $term->treeDepth = $term->depth;
          if ($display = $this->buildSitemapTerm($term)) {
            $list[$term->tid]['data'] = $display;
          }
        }
      }
      elseif ($hierarchyType == VocabularyInterface::HIERARCHY_SINGLE) {
        // Use a more structured tree to create a nested list.
        foreach ($terms as $obj) {
          $currentDepth = 1;
          $this->buildList($list, $obj, $vid, $currentDepth, $maxDepth);
          // TODO: Remove parents where all child terms are not displayed.
        }
      }
      else {
        // TODO: Support multiple hierarchy? Need to test

      }
    }

    // @TODO: Test & Document
    // Add an alter hook for modules to manipulate the taxonomy term output.
    \Drupal::moduleHandler()->alter(['sitemap_vocabulary', 'sitemap_vocabulary_' . $vid], $list, $vid);

    $content[] = [
      '#theme' => 'item_list',
      '#items' => $list,
    ];

    return [
      '#theme' => 'sitemap_item',
      '#title' => $this->settings['title'],
      '#content' => $content,
      '#sitemap' => $this,
      // @TODO: Does a vocabulary cache tag exist?
    ];
  }

  /**
   * Builds a taxonomy term item.
   *
   * @param \stdClass $term
   *   The term object returned by TermStorage::loadTree()
   *
   * @return array|void
   */
  protected function buildSitemapTerm($term) {
    $this->checkTermThreshold($term);

    if ($term->display) {
      return [
        '#theme' => 'sitemap_taxonomy_term',
        '#name' => $term->name,
        '#url' => $this->buildTermLink($term) ?: '',
        '#show_link' => $this->determineLinkVisibility($term),
        '#show_count' => $this->determineCountVisibility($term),
        '#count' =>  isset($term->count) ? $term->count : '',
        '#show_feed' => $this->settings['enable_rss'],
        '#feed' => $this->buildFeedLink($term) ?: '',
      ];
    }
  }

  /**
   * Checks the threshold count for a term.
   *
   * @param \stdClass $term
   *   The term object returned by TermStorage::loadTree()
   */
  protected function checkTermThreshold(&$term) {
    if (!isset($term->display)) {
      $term->display = FALSE;
    }
    $threshold = $this->settings['term_count_threshold'];
    $showCount = $this->settings['show_count'];
    $term->count = sitemap_taxonomy_term_count_nodes($term->tid);
    if ($threshold || $showCount) {
      if ($threshold && !isset($term->hasChildren)) {
        if ($term->count >= $threshold) {
          $term->display = TRUE;
        }
      }
      else {
        $term->display = TRUE;
      }
    }
    else {
      $term->display = TRUE;
    }
  }

  /**
   * Builds the taxonomy term link.
   *
   * @param \stdClass $term
   *   The term object returned by TermStorage::loadTree()
   *
   * @return string|void
   */
  protected function buildTermLink($term) {
    $vid = $this->pluginDefinition['vocabulary'];
    // @TODO: Add and test handling for Forum vs Vocab routes
    if (\Drupal::service('module_handler')->moduleExists('forum') && $vid == \Drupal::config('forum.settings')->get('vocabulary')) {
      return Url::fromRoute('forum.index')->toString();
    }

    // Route validation will be provided on form save and config update,
    // rather than every time a link is created.
    if (isset($this->settings['term_link'])) {
      return $this->buildLink($this->settings['term_link'], $term->tid);
    }
  }

  /**
   * Builds the taxonomy term feed link.
   *
   * @param \stdClass $term
   *   The term object returned by TermStorage::loadTree()
   *
   * @return string|void
   */
  protected function buildFeedLink($term) {
    $rssDepth = $this->settings['rss_depth'];
    if ($rssDepth && isset($term->treeDepth) && $rssDepth >= $term->treeDepth) {
      // Route validation will be provided on form save and config update,
      // rather than every time a link is created.
      if (isset($this->settings['rss_link'])) {
        return $this->buildLink($this->settings['rss_link'], $term->tid);
      }
    }
  }

  /**
   * Builds a tree/list array given a taxonomy term tree object.
   *
   * @see https://www.webomelette.com/loading-taxonomy-terms-tree-drupal-8
   *
   * @param array $list
   * @param \stdClass $object
   * @param string $vid
   * @param int $currentDepth
   * @param int $maxDepth
   */
  protected function buildList(&$list, $object, $vid, &$currentDepth, $maxDepth) {
    // Check that we are only working with the parent-most term.
    if ($object->depth != 0) {
      return;
    }

    // Track current depth of the term.
    $object->treeDepth = $currentDepth;

    // Check for children on the term.
    // @TODO Implement $termStorage at the class level.
    $termStorage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $children = $termStorage->loadChildren($object->tid);
    if (!$children) {
      $object->hasChildren = FALSE;
      if ($element = $this->buildSitemapTerm($object)) {
        $list[$object->tid][] = $element;
      }
      return;
    }
    else {
      // If the term has children, it should always be displayed.
      // TODO: That's not entirely accurate...
      $object->display = TRUE;
      $object->hasChildren = TRUE;
      $list[$object->tid][] = $this->buildSitemapTerm($object);
      $list[$object->tid]['children'] = [];
      $object_children = &$list[$object->tid]['children'];
    }
    $currentDepth++;

    if ($maxDepth >= $currentDepth) {
      $child_objects = $termStorage->loadTree($vid, $object->tid, 1);

      /** @var \Drupal\taxonomy\TermInterface[] $children */
      foreach ($children as $child) {
        foreach ($child_objects as $child_object) {
          if ($child_object->tid == $child->id()) {
            $this->buildlist($object_children, $child_object, $vid, $currentDepth, $maxDepth);
          }
        }
      }
    }
  }

  /**
   * Determine whether the link for a term should be displayed.
   *
   * @param \stdClass $term
   *
   * @return boolean
   */
  protected function determineLinkVisibility($term) {
    if ($this->settings['always_link']) {
      return TRUE;
    }
    elseif ($this->settings['term_count_threshold'] == Vocabulary::THRESHOLD_DISABLED && $term->count) {
      return TRUE;
    }
    elseif ($this->settings['term_count_threshold'] && $term->count >= $this->settings['term_count_threshold']) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Determine whether the usage count for a term should be displayed.
   *
   * @param \stdClass $term
   *
   * @return boolean
   */
  protected function determineCountVisibility($term) {
    if ($this->settings['show_count']) {
      if ($threshold = $this->settings['term_count_threshold']) {
        if ($term->count >= $threshold) {
          return TRUE;
        }
      }
      else {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Build the URL given a route|arg pattern.
   *
   * @param string $string
   * @param int $tid
   *
   * @return string
   */
  protected function buildLink($string, $tid) {
    $parts = $this->_splitRouteArg($string);
    return Url::fromRoute($parts['route'], [$parts['arg'] => $tid])->toString();
  }

  /**
   * Helper function to split the route|arg pattern.
   *
   * @param string $string
   *
   * @return array
   */
  protected function _splitRouteArg($string) {
    $return = [];

    if ($string) {
      $arr = explode('|', $string);
      if (count($arr) == 2) {
        $return['route'] = $arr[0];
        $return['arg'] = $arr[1];
      }
    }

    return $return;
  }

  /**
   * Validate the route and argument provided.
   * @TODO Implement for form_save and config import.
   *
   * @param $string
   */
  protected function validateCustomRoute($string) {
    $parts = $this->_splitRouteArg($string);

    /* @var \Drupal\Core\Routing\RouteProviderInterface $route_provider */
    $route_provider = \Drupal::service('router.route_provider');

    try {
      $route = $route_provider->getRouteByName($parts['route']);
      // TODO Determine if $route has the provided $parts['arg'] parameter.
    }
    catch (\Exception $e) {
      // TODO
    }
  }
}
