<?php

namespace Drupal\json_feed\Plugin\views\display;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Render\RenderContext;
use Drupal\views\Plugin\views\display\Feed;
use Drupal\views\Render\ViewsRenderPipelineMarkup;

/**
 * The plugin that handles a JSON feed.
 *
 * @ingroup views_display_plugins
 *
 * @ViewsDisplay(
 *   id = "json_feed",
 *   title = @Translation("JSON Feed"),
 *   help = @Translation("Display the view as a JSON feed."),
 *   uses_route = TRUE,
 *   admin = @Translation("JSON Feed"),
 *   returns_response = TRUE
 * )
 */
class JsonFeed extends Feed {

  /**
   * {@inheritdoc}
   */
  protected $usesAJAX = FALSE;

  /**
   * Re-enable pager.
   *
   * @var bool
   */
  protected $usesPager = TRUE;

  /**
   * {@inheritdoc}
   */
  protected $usesMore = FALSE;

  /**
   * {@inheritdoc}
   */
  protected $usesAreas = FALSE;

  /**
   * {@inheritdoc}
   */
  public function getType() {
    return 'json_feed';
  }

  /**
   * {@inheritdoc}
   */
  public static function buildResponse($view_id, $display_id, array $args = []) {
    $build = static::buildBasicRenderable($view_id, $display_id, $args);

    // Setup an empty response so headers can be added as needed during views
    // rendering and processing.
    $response = new CacheableResponse('', 200);
    $build['#response'] = $response;

    /** @var \Drupal\Core\Render\RendererInterface $renderer */
    $renderer = \Drupal::service('renderer');

    $output = (string) $renderer->renderRoot($build);

    $response->setContent($output);
    $cache_metadata = CacheableMetadata::createFromRenderArray($build);
    $response->addCacheableDependency($cache_metadata);

    $response->headers->set('Content-type', $build['#content_type']);

    return $response;
  }

  /**
   * {@inheritdoc}
   */
  protected function defineOptions() {
    $options = parent::defineOptions();

    // Set the default style plugins.
    $options['style']['contains']['type']['default'] = 'json_feed_serializer';
    $options['row']['contains']['type']['default'] = 'json_feed_fields';
    $options['defaults']['default']['style'] = FALSE;
    $options['defaults']['default']['row'] = FALSE;

    // Remove unusable form settings.
    unset($options['exposed_form']);
    unset($options['exposed_block']);
    unset($options['css_class']);

    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function optionsSummary(&$categories, &$options) {
    parent::optionsSummary($categories, $options);

    unset($categories['exposed']);

    // Hide some settings, as they aren't useful for pure data output.
    unset($options['show_admin_links']);
    unset($options['analyze-theme']);
    unset($options['exposed_form']);
    unset($options['exposed_block']);
    unset($options['css_class']);
  }

  /**
   * {@inheritdoc}
   */
  public function render() {
    $build = [];
    $build['#markup'] = $this->getRenderer()->executeInRenderContext(new RenderContext(), function () {
      return $this->view->style_plugin->render();
    });

    $this->view->element['#content_type'] = $this->view->getRequest()->getMimeType('json');

    // Encode and wrap the output in a pre tag if this is for a live preview.
    if (!empty($this->view->live_preview)) {
      $build['#prefix'] = '<pre>';
      $build['#plain_text'] = $build['#markup'];
      $build['#suffix'] = '</pre>';
      unset($build['#markup']);
    }
    else {
      $build['#markup'] = ViewsRenderPipelineMarkup::create($build['#markup']);
    }

    parent::applyDisplayCachablityMetadata($build);

    return $build;
  }

  /**
   * {@inheritdoc}
   *
   * The DisplayPluginBase preview method assumes we will be returning a render
   * array. The data plugin will already return the serialized string.
   */
  public function preview() {
    return $this->view->render();
  }

}
