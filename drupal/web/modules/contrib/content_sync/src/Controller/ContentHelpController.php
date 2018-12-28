<?php

namespace Drupal\content_sync\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\content_sync\ContentSyncHelpManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides route responses for content_sync help.
 */
class ContentHelpController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * The help manager.
   *
   * @var \Drupal\Component\Plugin\PluginManagerInterface
   */
  protected $helpManager;

  /**
   * Constructs a ContentSyncHelpController object.
   *
   * @param \Drupal\content_sync\ContentSyncHelpManagerInterface $help_manager
   *   The help manager.
   */
  public function __construct(ContentSyncHelpManagerInterface $help_manager) {
    $this->helpManager = $help_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('content_sync.help_manager')
    );
  }

  /**
   * Returns dedicated help about (aka How can we help you?) page.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request.
   *
   * @return array
   *   A renderable array containing a help about (aka How can we help you?) page.
   */
  public function about(Request $request) {
    $build = $this->helpManager->buildAbout();
    unset($build['title']);
    $build +=[
      '#prefix' => '<div class="content_sync-help">',
      '#suffix' => '</div>',
    ];
    $build['#attached']['library'][] = 'content_sync/content_sync.help';
    return $build;
  }

  /**
   * Returns dedicated help video page.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request.
   * @param string $id
   *   The video id.
   *
   * @return array
   *   A renderable array containing a help video player page.
   */
  public function video(Request $request, $id) {
    $id = str_replace('-', '_', $id);
    $video = $this->helpManager->getVideo($id);
    if (!$video) {
      throw new NotFoundHttpException();
    }

    $build = [];
    if (is_array($video['content'])) {
      $build['content'] = $video['content'];
    }
    else {
      $build['content'] = [
        '#markup' => $video['content'],
      ];
    }
    if ($video['youtube_id']) {
      $build['video'] = [
        '#theme' => 'content_sync_help_video_youtube',
        '#youtube_id' => $video['youtube_id'],
      ];
    }
    return $build;
  }

  /**
   * Route video title callback.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request.
   * @param string $id
   *   The id of the dedicated help section.
   *
   * @return string
   *   The help video's title.
   */
  public function videoTitle(Request $request, $id) {
    $id = str_replace('-', '_', $id);
    $video = $this->helpManager->getVideo($id);
    return (isset($video)) ? $video['title'] : $this->t('Watch video');
  }

}
