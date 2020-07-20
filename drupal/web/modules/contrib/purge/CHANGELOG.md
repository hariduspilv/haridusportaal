[//]: # ( clear&&curl -s -F input_files[]=@CHANGELOG.md -F from=markdown -F to=html http://c.docverter.com/convert|tail -n+11|head -n-2 )

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [8.x-3.0-beta9] - 2019-10-03

### Added
- Added `.gitattributes` to keep documentation out of built packages.
- Added `composer.json` for integration with Composer-based workflows.
- **API:** `Annotation\PurgeTagsHeader::$dependent_purger_plugins` to allow
  binding headers to purgers.
- **API:** `TagsHeaderInterface::isEnabled()` which returns `TRUE` by default.
- **API:** `DiagnosticsServiceInterface::filterInfo`, `::filterOk`,
  `::filterWarnings`, `::filterWarningsAndErrors`, `::filterErrors`
- **API:** `DiagnosticsServiceInterface::toMessageList()`
- **API:** `DiagnosticsServiceInterface::toRequirementsArray()` parameter
  `$prefix_title`.

### Changed
- **Improvement:** thousands of fixes to pass all these these standards checks:
    - `phpcs --standard=Drupal --extensions=php,module,inc,install,test,profile,theme,css,info,txt,md`
    - `phpcs --standard=AcquiaDrupalStrict`
- **Improvement:** `PROJECTPAGE.md`, `README.md` and **new** `CHANGELOG.md`.
- **Improvement:** Drupal's status report now only shows warning and error
  diagnostics.
- **Improvement:** `Counter\Counter::set()` only writes if the value changes.
- **Improvement:** `Queue\DatabaseQueue::numberOfItems()` now builds the
  `COUNT()` OOP-style.
- **Improvement:** `Queue\StatsTracker::updateTotals()` no longer maintains
  the ``::numberOfItems()`` statistic.
- **Improvement:** `Queue\NumberOfItemsStatistic` is now synced from
  `QueueService::commit` and nowhere else.
- **API:** `DiagnosticsServiceInterface::getRequirementsArray()`
  --> `::toRequirementsArray()`
- **API:** `DiagnosticsServiceInterface::getHookRequirementsArray()` removed
- **API:** `DiagnosticCheckInterface::getHookRequirementsArray()`` removed
- **API:** `Queue\numberOfItemsStatistic`     --> `NumberOfItemsStatistic`
- **API:** `Queue\totalProcessingStatistic`   --> `TotalProcessingStatistic`
- **API:** `Queue\totalSucceededStatistic`    --> `TotalSucceededStatistic`
- **API:** `Queue\totalFailedStatistic`       --> `TotalFailedStatistic`
- **API:** `Queue\totalNotSupportedStatistic` --> `TotalNotSupportedStatistic`

### Fixed
- **#2795131:** `purge_tokens` should not set Max-Age to 0.
- **#2795131:** codestyle in the tests got overhauled.
- **#2795131:** Drush commands ported to Drush 9, tested extensively and
  UX improved.
- `Invalidation\WildcardPathInvalidation` declaration issue

## [8.x-3.0-beta8] - 2017-08-14

### Added
- `TypeUnsupportedException`, thrown from `InvalidationsService::get()`, this
  prevents people from adding things to their queue that aren't supported.
- `QueueSizeDiagnosticCheck` which warns after 30000 queue items and does a
  safety shutdown over 10000.
- **Improvement:** `drush` commands:
    - `cache-rebuild-external (cre)` shorthand for
      "`drush p-invalidate everything`".
    - `p-processor-add (pradd)`
    - `p-processor-ls (prols -> prls)`
    - `p-processor-lsa (prlsa)`
    - `p-processor-rm (prrm)`
    - `p-queue-stats (pqs)`: now has richer output and a`--reset-totals` switch.
    - `p-queue-empty (pqe)`: no longer resets statistics (hint: it shouldn't).
    - `p-queuer-add (puadd)`
    - `p-queuer-ls (puls)`
    - `p-queuer-lsa (pulsa)`
    - `p-queuer-rm (purm)`
    - `p-purger-mvu (ppmvu)`: move a purger UP in the execution order.
    - `p-purger-mvd (ppmvd)`: move a purger DOWN in the execution order.

### Changed
- **Improvement:** `purge_ui`'s diagnostic report, its colored and visually
  pretty now.
- **API:** Rewrote `Queue\StatsTrackerInterface` from the ground up.
- **API:** Simplified `Counter\PersistentCounterInterface` and
  `CounterInterface` into one merged `CounterInterface`, and
  `::setWriteCallback` lost its `$id` parameter.

### Fixed
- `Undefined variable count QueueService:122`
- `DatabaseQueue::createItemMultiple()` call to `db_insert()` **->**
  `$this->connection->insert()`
- Endless queue-loop of invalidations after removing a purger.
- Drush commands no longer require a `drush cache-rebuild` to become visible.

## [8.x-3.0-beta7] - 2017-07-24

### Added
- `drush p-queue-volume` to view the current queue volume.
- `drush p-debug-en` and `drush p-debug-dis` for quickly enabling and disabing
  debug logging again. Works great together with `drush p-queue-work -v`!
- `\Drupal\purge\Logger\LoggerChannelPart::isDebuggingEnabled()` to make it
  easier for downstreams to prevent heavy overhead code when this ain’t needed.

### Changed
- **Improvement:** `drush p-queue-add` now allows adding multiple items to the
  queue using commas.
- **Improvement:** `drush p-queue-work` now has a `--finish` argument.
- **Improvement:** `drush p-invalidate` and `drush p-queue-add` now ask for
  confirmation when invalidating `everything`, to prevent users from
  accidentally harming their website at a moment where this isn’t a good idea.
- **Improvement:** micro-optimized `\Drupal\purge\Logger\LoggerChannelPart`.
- **Improvement:** renamed several `drush` commands to improve consistency:
    - `p-processors` `PPRO` --> `p-procsr-ls` `PROLS`
    - `p-purgers` `PPPU` --> `p-purger-ls` `PPLS`
    - `p-purgers-available` `PPPUA` --> `p-purger-lsa` `PPLSA`
    - `p-purger-add` `PPA` --> `p-p-purger-add` `PPADD`
    - `p-purger-rm` `PPR` --> `p-purger-rm` `PPRM`
    - `p-queuers` `PQRS` --> `p-queuer-ls` `PQULS`

### Fixed
- Bug in `RuntimeMeasurement::stop()` causing fatal errors.

## [8.x-3.0-beta6] - 2016-10-26

### Added
- Drush commands `p-purgers`, `p-purgers-available`, `p-purger-add` and
  `p-purger-rm`.

### Changed
- **Improvement:** 5m TTLs no longer shuts down purging, but still a bad idea.

## [8.x-3.0-beta5] - 2016-09-07

### Added
- Diagnostic check: `\...\DiagnosticCheck\MaxAgeCheck`.
- Diagnostic check: `\...\DiagnosticCheck\PageCacheCheck`.

### Changed
- **API:** `TagsHeaderInterface` now also extends
  `ContainerFactoryPluginInterface` in order for `create::` injection support.
- **Improvement:** test coverage (`4430 passes, 0f, 0e`),
  [pareview.sh](http://www.pareview.sh) compliance.
- **Improvement:** The "`page cache maximum age`" dropdown on the performance
  tab, contains a lot more serious options now.
- **Improvement:** `::testIteration()` tests on `KernelServiceTestBase`
  derivatives, by introducing `assertIterator()`.
- **Improvement:** `Tests\Queue\PluginTestBase` now tests the paging logic of
  queue plugins.

### Fixed
- **#2692523:** The `Purge-Cache-Tags` header has been dropped, and moves to
  the [purge\_purger\_http](https://drupal.org/project/purge_purger_http)
  project (as a submodule). The reasoning here is clear and in line with the
  strategy of the purge module for the future: HTTP headers are implementation
  details and the responsibility of purger modules, not a core task (and
  technology-assumption) for the core project. Users who need customized
  configurations, already likely use the generic HTTP purger while others will
  use submodules that already introduce their own headers (and remove them too).
- **#2791387:** A new configurable block "`Purge this page`" has been added to
  allow administrators to quickly purge by URL, path or clear "everything".
  Alternatively, the block can also be configured to queue the items instead
  of direct execution.
- **#2706567:** by lahoosascoots, nielsvm, arknoll: `QueuerService` and
  `ProcessorsService` assumes there are plugins in CMI.
- **#2795131:** has rewritten the entire database queue backend, which now
  automatically deploys a new database table `purge_queue`. Please note that
  **upgrading users** will see their queues wiped out and are required to
  run **`drush p-queue-empty`** to also reset queue statistics.
- **#2744215:** diagnostic errors will now get logged for **new installations**,
  old installations will need to check "error" for the "diagnostics" log channel
  in their logging configurations.
- **#2755019:** Remove @file tag docblock
- **#2787993:** Allowed memory size of 268435456 bytes exhausted
- **#2724217:** Incompatibility with Monolog
- **#2744135:** `PurgerCapacityDataInterface::hasRuntimeMeasurement()`
  further clarified.

## [8.x-3.0-beta4] - 2016-04-01

### Changed
- **API:** `http.response.debug_cacheability_headers` has been dropped.
- **Improvement:** Tag-Header plugins: now allow submodules to set export
  headers with cache tags, the default header now is `Purge-Cache-Tags`.
- **Improvement:** Invalidation properties: invalidation objects now have
  `::setProperty()`, `::getProperty()`, this allows purgers to pass through
  information between processing rounds (Akamai requirement).
- **Improvement:** Log management now allows purge and its submodules to log
  extensively and users have fine-grained control over it.

## [8.x-3.0-beta3] - 2016-03-15

### Changed
- **API:** All purger implementations now need to implement
  `::hasRuntimeMeasurement()` and can now drop their already existing
  `::getTimeHint()` implementations unless they desire keeping that level of
  control. The end-user benefit is that capacity calculation becomes much more
  dynamic and now depends upon real-world execution times, which means that
  capacity can increase or decrease depending on how the purgers perform. The
  downstream benefit is that less code is required in purgers, reducing the
  risk of bugs and hassle.

### Fixed
- `\...\Queue\StatsTracker::destruct()` which was potentially writing
  the buffer multiple times.
- `\...\Invalidation\ImmutableInvalidationBase::getState()` - Catch
  combination states where one or more purgers added `NOT_SUPPORTED` but other
  purgers added states as well.

## [8.x-3.0-beta2] - 2016-03-11

### Changed
- **API:** The service `purge.queue.txbuffer` became public.

## [8.x-3.0-beta1] - 2016-02-05

### Added
- Purge version 8.x-3.0-beta1 - codename `Hello World`!
