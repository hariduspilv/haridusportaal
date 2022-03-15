<?php

namespace Drupal\sitemap\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Url;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Render\RendererInterface;

/**
 * Provides a 'Syndicate (sitemap)' block.
 *
 * @Block(
 *   id = "sitemap_syndicate",
 *   label = @Translation("Syndicate"),
 *   admin_label = @Translation("Syndicate (sitemap)")
 * )
 */
class SitemapSyndicateBlock extends BlockBase {
  use StringTranslationTrait;

  /**
   * The route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * The configuration factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Creates a LocalActionsBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Routing\RouteMatchInterface $routeMatch
   *   The route match.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The configuration factory.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, RouteMatchInterface $routeMatch, ConfigFactoryInterface $configFactory, RendererInterface $renderer) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->routeMatch = $routeMatch;
    $this->configFactory = $configFactory;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match'),
      $container->get('config.factory'),
      $container->get('renderer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'cache' => [
        // No caching.
        'max_age' => 0,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    return AccessResult::allowedIfHasPermission($account, 'access content');
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $config = $this->configFactory->get('sitemap.settings');
    $route_name = $this->routeMatch->getRouteName();

    if ($route_name == 'blog.user_rss') {
      $feedurl = Url::fromRoute('blog.user_rss', [
        'user' => $this->routeMatch->getParameter('user'),
      ]);
    }
    elseif ($route_name == 'blog.blog_rss') {
      $feedurl = Url::fromRoute('blog.blog_rss');
    }
    else {
      $feedurl = $this->configFactory->get('rss_front');
    }

    $feed_icon = [
      '#theme' => 'feed_icon',
      '#url' => $feedurl,
      '#title' => $this->t('Syndicate'),
    ];
    $output = $this->renderer->render($feed_icon);
    // Re-use drupal core's render element.
    $more_link = [
      '#type' => 'more_link',
      '#url' => Url::fromRoute('sitemap.page'),
      '#attributes' => ['title' => $this->t('View the sitemap to see more RSS feeds.')],
    ];
    $output .= $this->renderer->render($more_link);

    return [
      '#type' => 'markup',
      '#markup' => $output,
    ];
  }

}
