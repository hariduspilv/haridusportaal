<?php

namespace Drupal\content_sync\Controller;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\Unicode;
use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\Core\Url;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for content_sync routes.
 */
class ContentLogController extends ControllerBase {

  /**
   * The database service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The module handler service.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The date formatter service.
   *
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected $dateFormatter;

  /**
   * The form builder service.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * The user storage.
   *
   * @var \Drupal\user\UserStorageInterface
   */
  protected $userStorage;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('module_handler'),
      $container->get('date.formatter'),
      $container->get('form_builder')
    );
  }

  /**
   * Constructs a LogController object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   A database connection.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   A module handler.
   * @param \Drupal\Core\Datetime\DateFormatterInterface $date_formatter
   *   The date formatter service.
   * @param \Drupal\Core\Form\FormBuilderInterface $form_builder
   *   The form builder service.
   */
  public function __construct(Connection $database, ModuleHandlerInterface $module_handler, DateFormatterInterface $date_formatter, FormBuilderInterface $form_builder) {
    $this->database = $database;
    $this->moduleHandler = $module_handler;
    $this->dateFormatter = $date_formatter;
    $this->formBuilder = $form_builder;
    $this->userStorage = $this->entityManager()->getStorage('user');
  }

  /**
   * Gets an array of log level classes.
   *
   * @return array
   *   An array of log level classes.
   */
  public static function getLogLevelClassMap() {
    return [
      RfcLogLevel::DEBUG => 'cslog-debug',
      RfcLogLevel::INFO => 'cslog-info',
      RfcLogLevel::NOTICE => 'cslog-notice',
      RfcLogLevel::WARNING => 'cslog-warning',
      RfcLogLevel::ERROR => 'cslog-error',
      RfcLogLevel::CRITICAL => 'cslog-critical',
      RfcLogLevel::ALERT => 'cslog-alert',
      RfcLogLevel::EMERGENCY => 'cslog-emergency',
    ];
  }

  /**
   * Displays a listing of database log messages.
   *
   * Messages are truncated at 56 chars.
   * Full-length messages can be viewed on the message details page.
   *
   * @return array
   *   A render array as expected by drupal_render().
   *
   * @see Drupal\content_sync\Form\logClearLogConfirmForm
   * @see Drupal\content_sync\Controller\LogController::eventDetails()
   */
  public function overview() {

    $filter = $this->buildFilterQuery();
    $rows = [];

    $classes = static::getLogLevelClassMap();

    $this->moduleHandler->loadInclude('module_sync', 'admin.inc');

    //$build['admin_filter_form'] = $this->formBuilder->getForm('Drupal\content_sync\Form\ContentLogFilterForm');

    $header = [
      // Icon column.
      '',
    /*  [
        'data' => $this->t('Type'),
        'field' => 'w.type',
        'class' => [RESPONSIVE_PRIORITY_MEDIUM]], */
      [
        'data' => $this->t('Date'),
        'field' => 'w.csid',
        'sort' => 'desc',
        'class' => [RESPONSIVE_PRIORITY_LOW]],
      $this->t('Message'),
      [
        'data' => $this->t('User'),
        'field' => 'ufd.name',
        'class' => [RESPONSIVE_PRIORITY_MEDIUM]],
      [
        'data' => $this->t('Operations'),
        'class' => [RESPONSIVE_PRIORITY_LOW]],
    ];

    $query = $this->database->select('cs_logs', 'w')
      ->extend('\Drupal\Core\Database\Query\PagerSelectExtender')
      ->extend('\Drupal\Core\Database\Query\TableSortExtender');
    $query->fields('w', [
      'csid',
      'uid',
      'severity',
      'type',
      'timestamp',
      'message',
      'variables',
      'link',
    ]);
    $query->leftJoin('users_field_data', 'ufd', 'w.uid = ufd.uid');

    if (!empty($filter['where'])) {
      $query->where($filter['where'], $filter['args']);
    }
    $result = $query
      ->limit(50)
      ->orderByHeader($header)
      ->execute();

    foreach ($result as $log) {
      $message = $this->formatMessage($log);
      if ($message && isset($log->csid)) {
        $title = Unicode::truncate(Html::decodeEntities(strip_tags($message)), 256, TRUE, TRUE);
        $log_text = Unicode::truncate($title, 56, TRUE, TRUE);
        // The link generator will escape any unsafe HTML entities in the final
        // text.
        /*$message = $this->l($log_text, new Url('log.event', ['event_id' => $log->csid], [
          'attributes' => [
            // Provide a title for the link for useful hover hints. The
            // Attribute object will escape any unsafe HTML entities in the
            // final text.
            'title' => $title,
          ],
        ]));*/
      }
      $username = [
        '#theme' => 'username',
        '#account' => $this->userStorage->load($log->uid),
      ];
      $rows[] = [
        'data' => [
          // Cells.
          ['class' => ['icon']],
         // $this->t($log->type),
          $this->dateFormatter->format($log->timestamp, 'short'),
          $message,
          ['data' => $username],
          ['data' => ['#markup' => $log->link]],
        ],
        // Attributes for table row.
        'class' => [Html::getClass('cslog-' . $log->type), $classes[$log->severity]],
      ];
    }

    $build['log_table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#attributes' => ['id' => 'admin-cslog', 'class' => ['admin-cslog']],
      '#empty' => $this->t('No log messages available.'),
      //'#attached' => [
      //  'library' => ['cslog/drupal.cslog'],
      //],
    ];
    $build['log_pager'] = ['#type' => 'pager'];

    return $build;

  }

  /**
   * Displays details about a specific database log message.
   *
   * @param int $event_id
   *   Unique ID of the database log message.
   *
   * @return array
   *   If the ID is located in the Database Logging table, a build array in the
   *   format expected by drupal_render();
   */
  public function eventDetails($event_id) {
    $build = [];
    if ($cslog = $this->database->query('SELECT w.*, u.uid FROM {cs_logs} w LEFT JOIN {users} u ON u.uid = w.uid WHERE w.csid = :id', [':id' => $event_id])->fetchObject()) {
      $severity = RfcLogLevel::getLevels();
      $message = $this->formatMessage($cslog);
      $username = [
        '#theme' => 'username',
        '#account' => $cslog->uid ? $this->userStorage->load($cslog->uid) : User::getAnonymousUser(),
      ];
      $rows = [
        [
          ['data' => $this->t('Type'), 'header' => TRUE],
          $this->t($cslog->type),
        ],
        [
          ['data' => $this->t('Date'), 'header' => TRUE],
          $this->dateFormatter->format($cslog->timestamp, 'long'),
        ],
        [
          ['data' => $this->t('User'), 'header' => TRUE],
          ['data' => $username],
        ],
        [
          ['data' => $this->t('Location'), 'header' => TRUE],
          $this->l($cslog->location, $cslog->location ? Url::fromUri($cslog->location) : Url::fromRoute('<none>')),
        ],
        [
          ['data' => $this->t('Referrer'), 'header' => TRUE],
          $this->l($cslog->referer, $cslog->referer ? Url::fromUri($cslog->referer) : Url::fromRoute('<none>')),
        ],
        [
          ['data' => $this->t('Message'), 'header' => TRUE],
          $message,
        ],
        [
          ['data' => $this->t('Severity'), 'header' => TRUE],
          $severity[$cslog->severity],
        ],
        [
          ['data' => $this->t('Hostname'), 'header' => TRUE],
          $cslog->hostname,
        ],
        [
          ['data' => $this->t('Operations'), 'header' => TRUE],
          ['data' => ['#markup' => $cslog->link]],
        ],
      ];
      $build['cslog_table'] = [
        '#type' => 'table',
        '#rows' => $rows,
        '#attributes' => ['class' => ['cslog-event']],
        '#attached' => [
          'library' => ['cslog/drupal.cslog'],
        ],
      ];
    }

    return $build;
  }

  /**
   * Builds a query for database log administration filters based on session.
   *
   * @return array
   *   An associative array with keys 'where' and 'args'.
   */
  protected function buildFilterQuery() {
    if (empty($_SESSION['cslog_overview_filter'])) {
      return;
    }

    $this->moduleHandler->loadInclude('content_sync', 'admin.inc');

    $filters = cs_log_filters();

    // Build query.
    $where = $args = [];
    foreach ($_SESSION['cslog_overview_filter'] as $key => $filter) {
      $filter_where = [];
      foreach ($filter as $value) {
        $filter_where[] = $filters[$key]['where'];
        $args[] = $value;
      }
      if (!empty($filter_where)) {
        $where[] = '(' . implode(' OR ', $filter_where) . ')';
      }
    }
    $where = !empty($where) ? implode(' AND ', $where) : '';

    return [
      'where' => $where,
      'args' => $args,
    ];
  }

  /**
   * Formats a database log message.
   *
   * @param object $row
   *   The record from the cs_logs table. The object properties are: csid, uid,
   *   severity, type, timestamp, message, variables, link, name.
   *
   * @return string|\Drupal\Core\StringTranslation\TranslatableMarkup|false
   *   The formatted log message or FALSE if the message or variables properties
   *   are not set.
   */
  public function formatMessage($row) {
    // Check for required properties.
    if (isset($row->message, $row->variables)) {
      $variables = @unserialize($row->variables);
      // Messages without variables or user specified text.
      if ($variables === NULL) {
        $message = Xss::filterAdmin($row->message);
      }
      elseif (!is_array($variables)) {
        $message = $this->t('Log data is corrupted and cannot be unserialized: @message', ['@message' => Xss::filterAdmin($row->message)]);
      }
      // Message to translate with injected variables.
      else {
        $message = $this->t(Xss::filterAdmin($row->message), $variables);
      }
    }
    else {
      $message = FALSE;
    }
    return $message;
  }

  /**
   * Shows the most frequent log messages of a given event type.
   *
   * Messages are not truncated on this page because events detailed herein do
   * not have links to a detailed view.
   *
   * @param string $type
   *   Type of database log events to display (e.g., 'search').
   *
   * @return array
   *   A build array in the format expected by drupal_render().
   */
  public function topLogMessages($type) {
    $header = [
      ['data' => $this->t('Count'), 'field' => 'count', 'sort' => 'desc'],
      ['data' => $this->t('Message'), 'field' => 'message'],
    ];

    $count_query = $this->database->select('cs_logs');
    $count_query->addExpression('COUNT(DISTINCT(message))');
    $count_query->condition('type', $type);

    $query = $this->database->select('cs_logs', 'w')
      ->extend('\Drupal\Core\Database\Query\PagerSelectExtender')
      ->extend('\Drupal\Core\Database\Query\TableSortExtender');
    $query->addExpression('COUNT(csid)', 'count');
    $query = $query
      ->fields('w', ['message', 'variables'])
      ->condition('w.type', $type)
      ->groupBy('message')
      ->groupBy('variables')
      ->limit(30)
      ->orderByHeader($header);
    $query->setCountQuery($count_query);
    $result = $query->execute();

    $rows = [];
    foreach ($result as $cs_log) {
      if ($message = $this->formatMessage($cs_log)) {
        $rows[] = [$cs_log->count, $message];
      }
    }

    $build['cs_log_top_table']  = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No log messages available.'),
      '#attached' => [
        'library' => ['cs_log/drupal.cslog'],
      ],
    ];
    $build['cs_log_top_pager'] = ['#type' => 'pager'];

    return $build;
  }

}
