<?php

namespace Drupal\content_sync;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Serialization\Yaml;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Url;
use Drupal\content_sync\Element\ContentSyncMessage;

/**
 * Content Sync help manager.
 */
class ContentSyncHelpManager implements ContentSyncHelpManagerInterface {

  use StringTranslationTrait;

  /**
   * Help for the Content Sync module.
   *
   * @var array
   */
  protected $help;

  /**
   * Videos for the Content Sync module.
   *
   * @var array
   */
  protected $videos;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The configuration object factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The state service.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * The path matcher.
   *
   * @var \Drupal\Core\Path\PathMatcherInterface
   */
  protected $pathMatcher;


  /**
   * Constructs a ContentSyncHelpManager object.
   *
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   Current user.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The configuration object factory.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\State\StateInterface $state
   *   The state service.
   * @param \Drupal\Core\Path\PathMatcherInterface $path_matcher
   *   The path matcher.
   */
  public function __construct(AccountInterface $current_user, ConfigFactoryInterface $config_factory, ModuleHandlerInterface $module_handler, StateInterface $state, PathMatcherInterface $path_matcher) {
    $this->currentUser = $current_user;
    $this->configFactory = $config_factory;
    $this->moduleHandler = $module_handler;
    $this->state = $state;
    $this->pathMatcher = $path_matcher;
    $this->help = $this->initHelp();
  }

  /**
   * {@inheritdoc}
   */
  public function getHelp($id = NULL) {
    if ($id !== NULL) {
      return (isset($this->help[$id])) ? $this->help[$id] : NULL;
    }
    else {
      return $this->help;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function buildHelp($route_name, RouteMatchInterface $route_match) {
    // Get path from route match.
    $path = preg_replace('/^' . preg_quote(base_path(), '/') . '/', '/', Url::fromRouteMatch($route_match)->setAbsolute(FALSE)->toString());

    $build = [];
    foreach ($this->help as $id => $help) {
      // Set default values.
      $help += [
        'routes' => [],
        'paths' => [],
        'access' => TRUE,
        'message_type' => '',
        'message_close' => FALSE,
        'message_id' => '',
        'message_storage' => '',
        'video_id' => '',
      ];

      if (!$help['access']) {
        continue;
      }

      $is_route_match = in_array($route_name, $help['routes']);
      $is_path_match = ($help['paths'] && $this->pathMatcher->matchPath($path, implode(PHP_EOL, $help['paths'])));
      $has_help = ($is_route_match || $is_path_match);
      if (!$has_help) {
        continue;
      }

      if ($help['message_type']) {
        $build[$id] = [
          '#type' => 'content_sync_message',
          '#message_type' => $help['message_type'],
          '#message_close' => $help['message_close'],
          '#message_id' => ($help['message_id']) ? $help['message_id'] : 'content_sync.help.' . $help['id'],
          '#message_storage' => $help['message_storage'],
          '#message_message' => [
            '#theme' => 'content_sync_help',
            '#info' => $help,
          ],
        ];
        if ($help['message_close']) {
          $build['#cache']['max-age'] = 0;
        }
      }
      else {
        $build[$id] = [
          '#theme' => 'content_sync_help',
          '#info' => $help,
        ];
      }

    }
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function buildIndex() {
    $build['intro'] = [
      '#markup' => $this->t('The Content Sync module is a content synchronization manager for Drupal 8.'),
      '#prefix' => '<p>',
      '#suffix' => '</p>',
    ];
    $build['sections'] = [
      '#prefix' => '<div class="content_sync-help content_sync-help-accordion">',
      '#suffix' => '</div>',
    ];
    $build['sections']['uses'] = $this->buildUses();
    $build['sections']['about'] = $this->buildAbout();
    $build['sections']['#attached']['library'][] = 'content_sync/content_sync.help';
    return $build;
  }


  /**
   * {@inheritdoc}
   */
  public function buildHelpMenu() {
    $default_query = [
      'title' => '{Your title should be descriptive and concise}',
      'version' => $this->state->get('content_sync.version'),
    ];

    $issue_query = $default_query + [
        'body' => "
<h3>Problem/Motivation</h3>
(Why the issue was filed, steps to reproduce the problem, etc.)

SUGGESTIONS

* Search existing issues.
* Try Simplytest.me
* Export and attach an example YAML files.

<h3>Proposed resolution</h3>
(Description of the proposed solution, the rationale behind it, and workarounds for people who cannot use the patch.)",
      ];

    $feature_query = $default_query + [
        'body' => "
<h3>Problem/Motivation</h3>
(Explain why this new feature or functionality is important or useful.)

<h3>Proposed resolution</h3>
(Description of the proposed solution, the rationale behind it, and workarounds for people who cannot use the patch.)",
      ];
    
    $links = [];
    $links['index'] = [
      'title' => $this->t('How can we help you?'),
      'url' => Url::fromRoute('content.help.about'),
      'attributes' => [
        'class' => ['use-ajax'],
        'data-dialog-type' => 'modal',
        'data-dialog-options' => Json::encode(['width' => 640]),
      ],
    ];
    $links['documentation'] = [
      'title' => $this->t('Read Content Sync Documentation'),
      'url' => Url::fromUri('https://www.drupal.org/project/content_sync', ['attributes' => ['target' => '_blank']]),
    ];
    $links['issue'] = [
      'title' => $this->t('Report a Bug/Issue'),
      'url' => Url::fromUri('https://www.drupal.org/node/add/project-issue/content_sync', ['query' => $issue_query, 'attributes' => ['target' => '_blank']]),
    ];
    $links['request'] = [
      'title' => $this->t('Request Feature'),
      'url' => Url::fromUri('https://www.drupal.org/node/add/project-issue/content_sync', ['query' => $feature_query, 'attributes' => ['target' => '_blank']]),
    ];
    $links['support'] = [
      'title' => $this->t('Additional Support'),
      'url' => Url::fromUri('https://www.drupal.org/project/content_sync', ['attributes' => ['target' => '_blank']]),
    ];
    /*$links['community'] = [
      'title' => $this->t('Join the Drupal Community'),
      'url' => Url::fromUri('https://register.drupal.org/user/register', ['query' => ['destination' => '/project/content_sync'], 'attributes' => ['target' => '_blank']]),
    ];
    $links['association'] = [
      'title' => $this->t('Support the Drupal Association'),
      'url' => Url::fromUri('https://www.drupal.org/association/campaign/value-2017', ['attributes' => ['target' => '_blank']]),
    ];*/
    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['content_sync-help-menu']],
      'operations' => [
        '#type' => 'operations',
        '#links' => $links
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildUses($docs = FALSE) {
    $build = [
      'title' => [
        '#markup' => $this->t('Uses'),
        '#prefix' => '<h2 id="uses">',
        '#suffix' => '</h2>',
      ],
      'content' => [
        '#prefix' => '<div>',
        '#suffix' => '</div>',
        'help' => [
          '#prefix' => '<dl>',
          '#suffix' => '</dl>',
        ],
      ],
    ];
    foreach ($this->help as $id => $help_info) {
      // Check that help item should be displayed under 'Uses'.
      if (empty($help_info['uses'])) {
        continue;
      }

      // Never include the 'How can we help you?' help menu.
      unset($help_info['menu']);

      // Title.
      $build['content']['help'][$id]['title'] = [
        '#prefix' => '<dt>',
        '#suffix' => '</dt>',
      ];
      if (isset($help_info['url'])) {
        $build['content']['help'][$id]['title']['link'] = [
          '#type' => 'link',
          '#url' => $help_info['url'],
          '#title' => $help_info['title'],
        ];
      }
      else {
        $build['content']['help'][$id]['title']['#markup'] = $help_info['title'];
      }
      // Content.
      $build['content']['help'][$id]['content'] = [
        '#prefix' => '<dd>',
        '#suffix' => '</dd>',
        'content' => [
          '#theme' => 'content_sync_help',
          '#info' => $help_info,
          '#docs' => TRUE,
        ],
      ];
    }
    return $build;
  }


  /****************************************************************************/
  // Index sections.
  /****************************************************************************/

  /**
   * {@inheritdoc}
   */
  public function buildAbout() {
    $menu = $this->buildHelpMenu();
    $links = $menu['operations']['#links'];

    $link_base = [
      '#type' => 'link',
      '#attributes' => ['class' => ['button', 'button--primary']],
      '#suffix' => '<br/><br/><hr/>',
    ];
    
    $build = [
      'title' => [
        '#markup' => $this->t('How can we help you?'),
        '#prefix' => '<h2 id="about">',
        '#suffix' => '</h2>',
      ],
      'content' => [
        '#prefix' => '<div>',
        '#suffix' => '</div>',
      ],
    ];

    //$build['content']['quote'] = [];
    //$build['content']['quote']['image'] = [
    //  '#theme' => 'image',
    //  '#uri' => 'https://pbs.twimg.com/media/C-RXmp7XsAEgMN2.jpg',
    //  '#alt' => $this->t('DrupalCon Baltimore'),
    //  '#prefix' => '<p>',
    //  '#suffix' => '</p>',
    //];
    //$build['content']['quote']['content']['#markup'] = '<blockquote><strong>' . $this->t('It’s really the Drupal community and not so much the software that makes the Drupal project what it is. So fostering the Drupal community is actually more important than just managing the code base.') . '</strong><address>' . $this->t('- Dries Buytaert') . '</address></blockquote><hr/>';

    // Content Sync.
    $build['content']['content_sync'] = [];
    $build['content']['content_sync']['title']['#markup'] = '<h3>' . $this->t('Need help with the Content Sync module?') . '</h3>';
    $build['content']['content_sync']['content']['#markup'] = '<p>' . $this->t('The best place to start is by reading the documentation, watching the help videos, and looking at the examples and templates included in the content sync module.') . '</p>';
    $build['content']['content_sync']['link'] = $link_base + [
        '#url' => Url::fromUri('https://www.drupal.org/project/content_sync'),
        '#title' => $this->t('Get help with the Content Sync module'),
      ];

    // Help.
   /* if ($help_video = $this->buildAboutVideo('uQo-1s2h06E')) {
      $build['content']['help'] = [];
      $build['content']['help']['title']['#markup'] = '<h3>' . $this->t('Help us help you') . '</h3>';
      $build['content']['help']['video'] = $this->buildAboutVideo('uQo-1s2h06E');
      $build['content']['help']['#suffix'] = '<hr/>';
    }*/

    // Issue.
    $build['content']['issue'] = [];
    $build['content']['issue']['title']['#markup'] = '<h3>' . $this->t('How can you report bugs and issues?') . '</h3>';
    $build['content']['issue']['content']['#markup'] = '<p>' . $this->t('The first step is to review the Content Sync module’s issue queue for similar issues. You may be able to find a patch or other solution there. You may also be able to contribute to an existing issue with your additional details.') . '</p>' .
      '<p>' . $this->t('If you need to create a new issue, please make and export example of the faulty functionality/YAML files. This will help guarantee that your issue is reproducible. To get the best response, it’s helpful to craft a good issue report. You can find advice and tips on the <a href="https://www.drupal.org/node/73179">How to create a good issue page</a>. Please use the issue summary template when creating new issues.') . '</p>';
    $build['content']['issue']['link'] = $link_base + [
        '#url' => $links['issue']['url'],
        '#title' => $this->t('Report a bug/issue with the Content Sync module'),
      ];

    // Request.
    $build['content']['request'] = [];
    $build['content']['request']['title']['#markup'] = '<h3>' . $this->t('How can you request a feature?') . '</h3>';
    $build['content']['request']['content']['#markup'] = '<p>' . $this->t('Feature requests can be added to the Content Sync module\'s issue queue. Use the same tips provided for creating issue reports to help you author a feature request. The better you can define your needs and ideas, the easier it will be for people to help you.') . '</p>';
    $build['content']['request']['link'] = $link_base + [
        '#url' => $links['request']['url'],
        '#title' => $this->t('Help improve the ContentSync module'),
      ];

    /*
    // Community.
    $build['content']['community'] = [];
    $build['content']['community']['title']['#markup'] = '<h3>' . $this->t('Are you new to Drupal?') . '</h3>';
    $build['content']['community']['content']['#markup'] = '<p>' . $this->t('As an open source project, we don’t have employees to provide Drupal improvements and support. We depend on our diverse community of passionate volunteers to move the project forward. Volunteers work not just on web development and user support but also on many other contributions and interests such as marketing, organising user groups and camps, speaking at events, maintaining documentation, and helping to review issues.') . '</p>';
    $build['content']['community']['link'] = $link_base + [
      '#url' => Url::fromUri('https://www.drupal.org/getting-involved'),
      '#title' => $this->t('Get involved in the Drupal community'),
    ];

    // Register.
    $build['content']['register'] = [];
    $build['content']['register']['title']['#markup'] = '<h3>' . $this->t('Start by creating your Drupal.org user account') . '</h3>';
    $build['content']['register']['content']['#markup'] = '<p>' . $this->t('When you create a Drupal.org account, you gain access to a whole ecosystem of Drupal.org sites and services. Your account works on Drupal.org and any of its subsites including Drupal Groups, Drupal Jobs, Drupal Association and more.') . '</p>';
    $build['content']['register']['link'] = $link_base + [
      '#url' => $links['community']['url'],
      '#title' => $this->t('Become a member of the Drupal community'),
    ];

    // Association.
    $build['content']['association'] = [];
    $build['content']['association']['title']['#markup'] = '<h3>' . $this->t('Join the Drupal Association') . '</h3>';
    $build['content']['association']['content'] = [
      'content' => ['#markup' => $this->t('The Drupal Association is dedicated to fostering and supporting the Drupal software project, the community, and its growth. We help the Drupal community with funding, infrastructure, education, promotion, distribution, and online collaboration at Drupal.org.')],
      '#prefix' => '<p>',
      '#suffix' => '</p>',
    ];
    $build['content']['association']['video'] = $this->buildAboutVideo('LZWqFSMul84');
    $build['content']['association']['link'] = $link_base + [
      '#url' => $links['association']['url'],
      '#title' => $this->t('Learn more about the Drupal Association'),
    ];
    */

    return $build;
  }

  /**
   * Build about video player or linked button.
   *
   * @param string $youtube_id
   *   A YouTube id.
   *
   * @return array
   *   A video player, linked button, or an empty array if videos are disabled.
   */
  protected function buildAboutVideo($youtube_id) {
    $video_display = \Drupal::config('content_sync.settings')->get('ui.video_display');
    switch ($video_display) {
      case 'dialog':
        return [
          '#theme' => 'content_sync_help_video_youtube',
          '#youtube_id' => $youtube_id,
          '#autoplay' => FALSE,
        ];
        break;

      case 'link':
        return [
          '#type' => 'link',
          '#title' => t('Watch video'),
          '#url' => Url::fromUri('https://youtu.be/' . $youtube_id),
          '#attributes' => ['class' => ['button', 'button-action', 'button--small', 'button-content_sync-play']],
          '#prefix' => ' ',
        ];
        break;

      case 'hidden':
      default:
        return [];
        break;
    }
  }

  /**
   * Initialize help.
   *
   * @return array
   *   An associative array containing help.
   */
  protected function initHelp() {
    $help = [];

    // Install.
    $help['install'] = [
      'routes' => [
        // @see /admin/modules
        'system.modules_list',
      ],
      'title' => $this->t('Installing the Content Sync module'),
      'content' => $this->t('<strong>Congratulations!</strong> You have successfully installed the Content Sync module.'),
      'message_type' => 'info',
      'message_close' => TRUE,
      'message_storage' => ContentSyncMessage::STORAGE_STATE,
      'access' => $this->currentUser->hasPermission('Synchronize content'),
      'video_id' => 'install',
      'menu' => TRUE,
      'uses' => FALSE,
    ];

    // Release.
    $module_info = Yaml::decode(file_get_contents($this->moduleHandler->getModule('content_sync')->getPathname()));
    $version = (isset($module_info['version']) && !preg_match('/^8.x-5.\d+-.*-dev$/', $module_info['version'])) ? $module_info['version'] : '8.x-1.x-dev';
    $installed_version = $this->state->get('content_sync.version');
    // Reset storage state if the version has changed.
    if ($installed_version != $version) {
      ContentSyncMessage::resetClosed(ContentSyncMessage::STORAGE_STATE, 'content_sync.help.release');
      $this->state->set('content_sync.version', $version);
    }
    $t_args = [
      '@version' => $version,
      ':href' => 'https://www.drupal.org/project/content_sync/releases/' . $version,
    ];
    $help['release'] = [
      'routes' => [
        'content.sync',
      ],
      'title' => $this->t('You have successfully updated...'),
      'content' => $this->t('You have successfully updated to the @version release of the Content Sync module. <a href=":href">Learn more</a>', $t_args),
      'message_type' => 'status',
      'message_close' => TRUE,
      'message_storage' => ContentSyncMessage::STORAGE_STATE,
      'access' => $this->currentUser->hasPermission('Synchronize content'),
      'uses' => FALSE,
    ];

    // Introduction.
    $help['introduction'] = [
      'routes' => [
        'content.sync',
      ],
      'title' => $this->t('Welcome'),
      'content' => $this->t('Welcome to the Content Sync module for Drupal 8. The Content Synchronization module provides a user interface for importing and exporting content changes between installations of your website in different environments. Content is stored in YAML format. For more information, see the <a href=":url">online documentation for the content synchronization module</a>.', [':url' => 'https://www.drupal.org/project/content_sync']),
      'message_type' => 'info',
      'message_close' => TRUE,
      'message_storage' => ContentSyncMessage::STORAGE_USER,
      'access' => $this->currentUser->hasPermission('Synchronize content'),
      'video_id' => 'introduction',
    ];

    /****************************************************************************/
    // General.
    /****************************************************************************/

    // Content Sync.
    $help['content_sync'] = [
      'routes' => [
        'content.sync',
      ],
      'title' => $this->t('Content synchronization'),
      'url' => Url::fromRoute('content.sync'),
      'content' => $this->t('Compare the content uploaded to your content sync directory with the active content before completing the import.'),
      'menu' => TRUE,
    ];

    // Content Export Full.
    $help['content_export_full'] = [
      'routes' => [
        'content.export_full',
      ],
      'title' => $this->t('Exporting the full content'),
      'url' => Url::fromRoute('content.export_full'),
      'content' => $this->t('Create and download an archive consisting of all your site\'s content exported as <em>*.yml</em> files as a gzipped tar file.'),
      'menu' => TRUE,
    ];

    // Content Export Single.
    $help['content_export_single'] = [
      'routes' => [
        'content.export_single',
      ],
      'title' => $this->t('Exporting a single content item'),
      'url' => Url::fromRoute('content.export_single'),
      'content' => $this->t('Export a single content item by selecting a <em>Content type</em> and <em>Content name</em>. The content and its corresponding <em>*.yml file name</em> are then displayed on the page for you to copy.'),
      'menu' => TRUE,
    ];

    // Content Import Full.
    $help['content_import_full'] = [
      'routes' => [
        'content.import_full',
      ],
      'title' => $this->t('Importing the full content'),
      'url' => Url::fromRoute('content.import_full'),
      'content' => $this->t('Upload a full site content from an archive file to the content sync directory to be imported.'),
      'menu' => TRUE,
    ];

    // Content Import Single.
    $help['content_import_single'] = [
      'routes' => [
        'content.import_single',
      ],
      'title' => $this->t('Importing a single content item'),
      'url' => Url::fromRoute('content.import_single'),
      'content' => $this->t('Import a single content item by pasting its YAML structure into the text field.'),
      'menu' => TRUE,
    ];

    // Content Logs.
    $help['content_logs'] = [
      'routes' => [
        'content.overview',
      ],
      'title' => $this->t('Content logs'),
      'url' => Url::fromRoute('content.overview'),
      'content' => $this->t('Chronological list of recorded events containing errors, warnings and operational information of the content import, export and synchronization.'),
      'menu' => TRUE,
    ];

    // Content Settings.
    $help['content_settings'] = [
      'routes' => [
        'content.settings',
      ],
      'title' => $this->t('Content synchronization settings'),
      'url' => Url::fromRoute('content.settings'),
      'content' => $this->t('Set specific settings for the content synchronization behaviour.'),
      'menu' => TRUE,
    ];

    foreach ($help as $id => &$help_info) {
      $help_info += [
        'id' => $id,
        'uses' => TRUE,
      ];
    }

    return $help;
  }

}
