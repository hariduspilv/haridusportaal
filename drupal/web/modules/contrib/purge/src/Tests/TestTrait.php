<?php

namespace Drupal\purge\Tests;

/**
 * Several helper properties and methods for purge tests.
 *
 * @see \Drupal\purge\Tests\KernelTestBase
 * @see \Drupal\purge\Tests\WebTestBase
 */
trait TestTrait {

  /**
   * The factory for configuration objects.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The 'purge.logger' service.
   *
   * @var \Drupal\purge\Logger\LoggerServiceInterface
   */
  protected $purgeLogger;

  /**
   * The 'purge.processors' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface
   */
  protected $purgeProcessors;

  /**
   * The 'purge.purgers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface
   */
  protected $purgePurgers;

  /**
   * The 'purge.invalidation.factory' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * The 'purge.queue' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface
   */
  protected $purgeQueue;

  /**
   * The 'purge.queue.stats' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface
   */
  protected $purgeQueueStats;

  /**
   * The 'purge.queue.txbuffer' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queue\TxBufferInterface
   */
  protected $purgeQueueTxbuffer;

  /**
   * The 'purge.queuers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface
   */
  protected $purgeQueuers;

  /**
   * The 'purge.diagnostics' service.
   *
   * @var \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface
   */
  protected $purgeDiagnostics;

  /**
   * The 'purge.tagsheaders' service.
   *
   * @var \Drupal\purge\Plugin\Purge\TagsHeader\TagsHeadersServiceInterface
   */
  protected $purgeTagsHeaders;

  /**
   * Assert that the named exception is thrown.
   *
   * @param string $exception
   *   The full name of the exception to be thrown.
   * @param callable $call
   *   The callable to call from within the try statement.
   * @param mixed[] $args
   *   Arguments to be passed to the callable.
   */
  protected function assertException($exception, callable $call, array $args = []) {
    // phpcs:disable Drupal.Functions.DiscouragedFunctions.Discouraged
    // phpcs:disable PHPCS_SecurityAudit.BadFunctions.NoEvals.NoEvals
    $thrown = FALSE;
    eval("
      try {
        call_user_func_array(\$call, \$args);
      }
      catch ($exception \$e) {
        \$thrown = TRUE;
      }");
    $this->assertTrue($thrown, "Exception $exception thrown.");
    // phpcs:enable PHPCS_SecurityAudit.BadFunctions.NoEvals.NoEvals
    // phpcs:enable Drupal.Functions.DiscouragedFunctions.Discouraged
  }

  /**
   * Assert that the named exception is thrown.
   *
   * @param string $exception
   *   The full name of the exception to be thrown.
   * @param callable $call
   *   The callable to call from within the try statement.
   * @param mixed[] $args
   *   Arguments to be passed to the callable.
   */
  protected function assertNoException($exception, callable $call, array $args = []) {
    // phpcs:disable Drupal.Functions.DiscouragedFunctions.Discouraged
    // phpcs:disable PHPCS_SecurityAudit.BadFunctions.NoEvals.NoEvals
    $thrown = FALSE;
    eval("
      try {
        call_user_func_array(\$call, \$args);
      }
      catch ($exception \$e) {
        \$thrown = TRUE;
      }");
    $this->assertFalse($thrown, "Exception $exception isn't thrown.");
    // phpcs:enable PHPCS_SecurityAudit.BadFunctions.NoEvals.NoEvals
    // phpcs:enable Drupal.Functions.DiscouragedFunctions.Discouraged
  }

  /**
   * Make $this->purgeLogger available.
   */
  protected function initializeLoggerService() {
    if (is_null($this->purgeLogger)) {
      $this->purgeLogger = $this->container->get('purge.logger');
    }
  }

  /**
   * Make $this->purgeProcessors available.
   *
   * @param string[] $plugin_ids
   *   Array of plugin ids to be enabled.
   * @param bool $write_empty
   *   Write empty plugin configurations.
   */
  protected function initializeProcessorsService(array $plugin_ids = [], $write_empty = FALSE) {
    if (is_null($this->purgeProcessors)) {
      $this->purgeProcessors = $this->container->get('purge.processors');
    }
    if (count($plugin_ids) || $write_empty) {
      $this->purgeProcessors->reload();
      $this->purgeProcessors->setPluginsEnabled($plugin_ids);
    }
  }

  /**
   * Make $this->purgePurgers available.
   *
   * @param string[] $plugin_ids
   *   Array of plugin ids to be enabled.
   * @param bool $write_empty
   *   Write empty plugin configurations.
   */
  protected function initializePurgersService(array $plugin_ids = [], $write_empty = FALSE) {
    if (is_null($this->purgePurgers)) {
      $this->purgePurgers = $this->container->get('purge.purgers');
    }
    if (count($plugin_ids) || $write_empty) {
      $ids = [];
      foreach ($plugin_ids as $i => $plugin_id) {
        $ids["id$i"] = $plugin_id;
      }
      $this->purgePurgers->reload();
      $this->purgePurgers->setPluginsEnabled($ids);
    }
  }

  /**
   * Make $this->purgeInvalidationFactory available.
   */
  protected function initializeInvalidationFactoryService() {
    if (is_null($this->purgeInvalidationFactory)) {
      $this->purgeInvalidationFactory = $this->container->get('purge.invalidation.factory');
    }
  }

  /**
   * Make $this->purgeQueue available.
   *
   * @param null|string[] $plugin_id
   *   The plugin ID of the queue to be configured.
   * @param bool $write_empty
   *   Write empty plugin configuration.
   */
  protected function initializeQueueService($plugin_id = NULL, $write_empty = FALSE) {
    if (is_null($this->purgeQueue)) {
      $this->purgeQueue = $this->container->get('purge.queue');
    }
    $plugin_ids = is_null($plugin_id) ? [] : [$plugin_id];
    if (count($plugin_ids) || $write_empty) {
      $this->purgeQueue->reload();
      $this->purgeQueue->setPluginsEnabled($plugin_ids);
    }
  }

  /**
   * Make $this->purgeQueuers available.
   *
   * @param string[] $plugin_ids
   *   Array of plugin ids to be enabled.
   * @param bool $write_empty
   *   Write empty plugin configurations.
   */
  protected function initializeQueuersService(array $plugin_ids = [], $write_empty = FALSE) {
    if (is_null($this->purgeQueuers)) {
      $this->purgeQueuers = $this->container->get('purge.queuers');
    }
    if (count($plugin_ids) || $write_empty) {
      $this->purgeQueuers->reload();
      $this->purgeQueuers->setPluginsEnabled($plugin_ids);
    }
  }

  /**
   * Make $this->purgeDiagnostics available.
   */
  protected function initializeDiagnosticsService() {
    if (is_null($this->purgeDiagnostics)) {
      $this->purgeDiagnostics = $this->container->get('purge.diagnostics');
    }
    else {
      $this->purgeDiagnostics->reload();
    }
  }

  /**
   * Make $this->purgeTagsheaders available.
   */
  protected function initializeTagsHeadersService() {
    if (is_null($this->purgeTagsHeaders)) {
      $this->purgeTagsHeaders = $this->container->get('purge.tagsheaders');
    }
    else {
      $this->purgeTagsHeaders->reload();
    }
  }

  /**
   * Create $amount requested invalidation objects.
   *
   * @param int $amount
   *   The amount of objects to return.
   * @param string $plugin_id
   *   The id of the invalidation type being instantiated.
   * @param mixed|null $expression
   *   Value - usually string - that describes the kind of invalidation, NULL
   *   when the type of invalidation doesn't require $expression. Types usually
   *   validate the given expression and throw exceptions for bad input.
   * @param bool $initialize_purger
   *   Initialize a purger that supports all invalidation types. When FALSE is
   *   passed, expect a \Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException.
   *
   * @return array|\Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
   *   Array of InvalidationInterface objects or a single InvalidationInterface.
   */
  public function getInvalidations($amount, $plugin_id = 'everything', $expression = NULL, $initialize_purger = TRUE) {
    $this->initializeInvalidationFactoryService();
    if ($initialize_purger) {
      $this->initializePurgersService(['id' => 'good']);
    }
    $set = [];
    for ($i = 0; $i < $amount; $i++) {
      $set[] = $this->purgeInvalidationFactory->get($plugin_id, $expression);
    }
    return ($amount === 1) ? $set[0] : $set;
  }

  /**
   * Switch to the memory queue backend.
   */
  public function setMemoryQueue() {
    $this->configFactory = $this->container->get('config.factory');
    $this->config('purge.plugins')
      ->set('queue', 'memory')
      ->save();
  }

}
