<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\AnnotatedCommand\AnnotationData;
use Consolidation\AnnotatedCommand\CommandData;
use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\InvalidExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\MissingExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;
use Drupal\purge\Plugin\Purge\Purger\Exception\CapacityException;
use Drupal\purge\Plugin\Purge\Purger\Exception\DiagnosticsException;
use Drupal\purge\Plugin\Purge\Purger\Exception\LockException;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;
use Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface;
use Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface;
use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;
use Drush\Commands\DrushCommands;
use Drush\Drush;
use Drush\Exceptions\UserAbortException;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableCell;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\BufferedOutput;

/**
 * Interact with the Purge queue from the command line.
 */
class QueueCommands extends DrushCommands {

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
   * The 'purge.queuers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface
   */
  protected $purgeQueuers;

  /**
   * Construct a QueueCommands object.
   *
   * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purge_processors
   *   The purge processors service.
   * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purge_purgers
   *   The purge purgers service.
   * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface $purge_invalidation_factory
   *   The purge invalidation factory service.
   * @param \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface $purge_queue
   *   The purge queue service.
   * @param \Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface $purge_queue_stats
   *   The purge queue statistics service.
   * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purge_queuers
   *   The purge queuers service.
   */
  public function __construct(ProcessorsServiceInterface $purge_processors, PurgersServiceInterface $purge_purgers, InvalidationsServiceInterface $purge_invalidation_factory, QueueServiceInterface $purge_queue, StatsTrackerInterface $purge_queue_stats, QueuersServiceInterface $purge_queuers) {
    parent::__construct();
    $this->purgeProcessors = $purge_processors;
    $this->purgePurgers = $purge_purgers;
    $this->purgeInvalidationFactory = $purge_invalidation_factory;
    $this->purgeQueue = $purge_queue;
    $this->purgeQueueStats = $purge_queue_stats;
    $this->purgeQueuers = $purge_queuers;
  }

  /**
   * Validate access to the SiteProcess API.
   *
   * @hook validate p:queue-work
   */
  public function checkDrushVersion(CommandData $commandData) {
    if (!(method_exists(Drush::class, 'aliasManager') && method_exists(Drush::class, 'drush'))) {
      throw new \Exception(dt('Drush 9.6=> is required for this command!'));
    }
  }

  /**
   * Transform the space-separated argument list into a usable array structure.
   *
   * @hook init p:queue-add
   */
  public function queueAddParseExpressions(InputInterface $input, AnnotationData $annotationData) {
    $raw = trim(implode(" ", $input->getArguments()['expressions']));
    $expressions = [];
    if ($raw) {
      $expressions = explode(' ', $raw);
      $expressions = array_map('trim', explode(',', implode(' ', $expressions)));
      array_walk($expressions, function (&$value, $key) {
        $value = explode(' ', $value);
        if (!isset($value[1])) {
          $value = [
            'type' => $value[0],
            'expression' => NULL,
          ];
        }
        else {
          $value = [
            'type' => $value[0],
            'expression' => $value[1],
          ];
        }
      });
    }
    $input->setArgument('expressions', $expressions);
  }

  /**
   * Add one or more items to the queue for later processing.
   *
   * @param array $expressions
   *   Comma-separated and typed list of expressions to add to the queue.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queue-add tag node:1
   *   Clears all cached pages matching TAG "node:1".
   * @usage drush pqa url http://www.s.com/rss.xml
   *   Clears only the URL provided.
   * @usage drush pqa wildcardurl http://s.com/f/*
   *   Clears URLs by wildcard, all under http://s.com/f/ will be cleared.
   * @usage drush pqa everything
   *   Instructs to clear the entire site, be careful!
   * @usage drush pqa tag node:1,tag node:2,url http://../rss.xml,tag node:321
   *   Comma separated input of multiple items.
   *
   * @command p:queue-add
   * @aliases pqa,p-queue-add
   */
  public function queueAdd(array $expressions, array $options = ['format' => 'string']) {
    // Retrieve our queuer object and fail when it is not returned.
    if (!($queuer = $this->purgeQueuers->get('drush_purge_queue_add'))) {
      throw new \Exception(dt("Please add the required queuer:\ndrush p:queuer-add drush_purge_queue_add"));
    }
    if (empty($expressions)) {
      throw new \Exception(dt("Please provide one or more expressions."));
    }
    // Iterate the provided input and provide feedback to the user.
    $invalidations = [];
    foreach ($expressions as $expression) {
      $type = $expression['type'];
      $expression = $expression['expression'];
      if (is_null($type) || empty($type)) {
        continue;
      }

      // Instantiate the invalidation object based on user input.
      try {
        $invalidations[] = $this->purgeInvalidationFactory->get($type, $expression);
      }
      catch (PluginNotFoundException $e) {
        throw new \Exception(dt("Type '@type' does not exist, see 'drush p:types' for available types.", ['@type' => $type]));
      }
      catch (InvalidExpressionException $e) {
        throw new \Exception($e->getMessage());
      }
      catch (TypeUnsupportedException $e) {
        throw new \Exception(dt("There is no purger supporting '@type', please install one!", ['@type' => $type]));
      }
      catch (MissingExpressionException $e) {
        throw new \Exception($e->getMessage());
      }

      // Prevent users from accidentally harming their website.
      if (($options['format'] === 'string') && ($type === 'everything')) {
        $this->io()->caution(dt("Invalidating everything will mass-clear potentially"
          . " thousands of pages, which could temporarily make your site really"
          . " slow as external caches will have to warm up again.\n"));
        if (!$this->io()->confirm(dt("Are you really sure?"))) {
          throw new UserAbortException();
        }
      }
    }

    // Add the objects to the queue and give user feedback.
    $this->purgeQueue->add($queuer, $invalidations);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('Added @count item(s) to the queue.', ['@count' => count($invalidations)]));
    }
  }

  /**
   * Inspect what is in the queue by paging through it.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @option limit
   *   The number of items to show on a single page.
   * @option page
   *   The page to show data for, pages start at 1.
   * @option no-translations
   *   Disable returning translated type and state fields.
   * @usage drush p:queue-browse
   *   Browse queue content and press space to load more.
   * @usage drush p:queue-browse --limit=50
   *   Browse the queue content and show 50 items at a time.
   * @usage drush p:queue-browse --page=3
   *   Show page 3 of the queue.
   * @usage drush p:queue-browse --page=3 --format=json|yaml
   *   Fetch a page from the queue exported as JSON.
   *
   * @command p:queue-browse
   * @aliases pqb,p-queue-browse
   *
   * @return null|\Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function queueBrowse(array $options = [
    'format' => 'table',
    'limit' => 30,
    'page' => 1,
    'no-translations' => FALSE,
  ]) {
    $options['limit'] = (int) $options['limit'];
    $options['page'] = (int) $options['page'];

    // Set the queue paging limit according to the passed --limit parameter.
    $this->purgeQueue->selectPageLimit($options['limit']);

    // Fetch a page of queue items for all non-interactive outputs.
    if (($options['format'] !== 'table') || $options['no-interaction']) {
      $output = [];
      foreach ($this->purgeQueue->selectPage($options['page']) as $immutable) {
        if ($options['format'] === 'list') {
          $output[] = $immutable->getExpression();
        }
        elseif ($options['no-translations']) {
          $output[] = [
            'type' => $immutable->getType(),
            'state' => $immutable->getStateString(),
            'expression' => $immutable->getExpression(),
          ];
        }
        else {
          $output[] = [
            'type' => (string) $immutable->getPluginDefinition()['label'],
            'state' => (string) $immutable->getStateStringTranslated(),
            'expression' => $immutable->getExpression(),
          ];
        }
      }
      return new RowsOfFields($output);
    }

    // Iterate through every page and let the user page interactively.
    for ($page = $options['page']; $page <= ($max = $this->purgeQueue->selectPageMax()); $page++) {

      // Build the pager string and $prev/$next variables.
      $pgrprev = ($prev = ($page !== 1)) ? '[←]' : '   ';
      $pgrnext = ($next = ($page !== $max)) ? '[→]' : '   ';
      $pgrpage = dt("page") . ' ' . sprintf("%d/%d", $page, $max);
      $pager = sprintf("%s %s %s", $pgrprev, $pgrpage, $pgrnext);

      // Recursively gather the rows as a RowsOfFields object.
      $options['page'] = $page;
      $options['format'] = 'json';
      $options['no-interaction'] = TRUE;
      $rows = (array) $this->queueBrowse($options);
      $rows[] = new TableSeparator();
      $rows[] = [
        new TableCell(dt("[q]uit")),
        new TableCell($pager, ['colspan' => 2]),
      ];

      // Render the table through a buffer so we can count the lines.
      $output = new BufferedOutput();
      $table = new Table($output);
      $table->setHeaders([dt("Type"), dt("State"), dt("Expression")]);
      $table->setColumnWidths([15, 12, 40]);
      $table->setRows($rows);
      $table->render();
      $table = $output->fetch();
      $table_lines = substr_count($table, "\n");
      $this->output->write($table);

      // Listen to keyboard input for [q]uit, [←] previous, [→] next.
      system('stty cbreak');
      while (TRUE) {
        $char = ord(fgetc(STDIN));
        // Erase the line:
        $this->output->write("\x1B[2K");
        // Move cursor to begin of the line:
        $this->output->write("\x0D");
        // Skip input iteration for noise character codes during keypresses.
        if (in_array($char, [27, 91])) {
          continue;
        }
        // Arrow-back: wipe rendered lines, render the previous page.
        if ($prev && ($char === 68)) {
          $page = $page - 2;
          $this->output->write(str_repeat("\x1B[1A\x1B[2K", $table_lines));
          break;
        }
        // Arrow-nex / space: wipe rendered lines, render the next page.
        elseif ($next && (in_array($char, [32, 67]))) {
          $this->output->write(str_repeat("\x1B[1A\x1B[2K", $table_lines));
          break;
        }
        // Finish execution for [q]uit or --> pressed on the last page.
        elseif (($char === 113) || ((!$next) && ($char === 67))) {
          return;
        }
      }
    }
  }

  /**
   * Empty the entire queue.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queue-empty
   *   Empty the entire queue.
   *
   * @command p:queue-empty
   * @aliases pqe,p-queue-empty
   */
  public function queueEmpty(array $options = ['format' => 'string']) {
    $total = (int) $this->purgeQueueStats->numberOfItems()->get();
    if (($options['format'] === 'string') && $total) {
      $question = dt("Are you certain you want to delete @total items?",
                     ['@total' => $total]);
      if (!$this->io()->confirm($question)) {
        throw new UserAbortException();
      }
    }
    $this->purgeQueue->emptyQueue();
    if ($options['format'] == 'string') {
      if ($total !== 0) {
        return $this->io()->success(
          dt('Cleared @total items from the queue.', ['@total' => $total]));
      }
      else {
        return $this->io()->success(
          dt('The queue was empty, nothing to clear!'));
      }
    }
    return (string) $total;
  }

  /**
   * Retrieve the queue statistics.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @option reset-totals
   *   Wipe the TOTAL statistical counters.
   * @usage drush p:queue-stats
   *   Retrieve the queue statistics.
   * @usage drush p:queue-stats --reset-totals
   *   Wipe the TOTAL statistical counters.
   * @usage drush p:queue-stats --format=json
   *   Fetch the data as JSON.
   * @usage drush p:queue-stats --format=yaml
   *   Fetch the data as YAML.
   *
   * @command p:queue-stats
   * @aliases pqs,p-queue-stats
   */
  public function queueStatistics(array $options = ['format' => 'table', 'reset-totals' => FALSE]) {

    // Reset the total counters if requested to.
    if ($options['reset-totals'] && ($options['format'] === 'table')) {
      $this->output()->writeln(dt("You are about to reset all total counters...\n"));
      if (!$this->io()->confirm(dt("Are you really sure?"))) {
        throw new UserAbortException();
      }
      $this->purgeQueueStats->resetTotals();
      return;
    }
    elseif ($options['reset-totals']) {
      $this->purgeQueueStats->resetTotals();
      return;
    }

    // Normal output generation.
    if ($options['format'] === 'table') {
      $table = [];
      $align_right = function ($input, $size = 20) {
        return str_repeat(' ', $size - strlen($input)) . $input;
      };
      foreach ($this->purgeQueueStats as $statistic) {
        $table[] = [
          'left' => $align_right(strtoupper($statistic->getId())),
          'right' => $statistic->getTitle(),
        ];
        $table[] = [
          'left' => $align_right($statistic->getInteger()),
          'right' => '',
        ];
        $table[] = [
          'left' => '',
          'right' => wordwrap($statistic->getDescription(), 80),
        ];
        $table[] = ['left' => '', 'right' => ''];
      }

      // Returning a RowsOfFields object doesn't allow us to dismiss the header.
      $this->io()->table([], $table);
      return;
    }
    else {
      $statistics = [];
      foreach ($this->purgeQueueStats as $statistic) {
        $statistics[$statistic->getId()] = $statistic->getInteger();
      }
      return $statistics;
    }
  }

  /**
   * Count how many items are currently in the queue.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queue-volume
   *   The number of items in the queue.
   * @usage drush p:queue-volume --format=yaml
   *   YAML parseable output.
   * @usage drush p:queue-volume --format=json
   *   JSON parseable output.
   *
   * @command p:queue-volume
   * @aliases pqv,p-queue-volume
   */
  public function queueVolume(array $options = ['format' => 'string']) {
    $volume = $this->purgeQueue->numberOfItems();
    if ($options['format'] == 'string') {
      return dt('There are @total items in the queue.', ['@total' => $volume]);
    }
    return (string) $volume;
  }

  /**
   * Process one or more chunks of items from the queue.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @option finish
   *   Keep processing until the queue is empty.
   *
   * @usage drush p:queue-work
   *   Process one chunk of queue items from the queue.
   * @usage drush p:queue-work --format=json|yaml
   *   Process one chunk and return parsable output.
   * @usage drush p:queue-work --finish
   *   Keep processing until the queue is empty.
   * @usage drush p:queue-work --finish --format=json|yaml
   *   Keep processing and return parsable output.
   * @usage drush p:queue-work --no-interaction
   *   Process one chunk without process fork. This mode suited for cron jobs
   *   and does not set a UNIX return status.
   *
   * @command p:queue-work
   * @aliases pqw,p-queue-work
   */
  public function queueWork(array $options = ['format' => 'string', 'finish' => FALSE]) {
    // Process one chunk outside of a fork and without result interpretation.
    if (($options['finish'] === FALSE) && $options['no-interaction']) {
      return $this->queueWorkChunk();
    }

    // Process one/multiple chunks and gather the results.
    $opt = ['format' => 'json', 'finish' => FALSE, 'no-interaction' => TRUE];
    $self = Drush::aliasManager()->getSelf();
    $runs = [];
    do {
      $subproc = Drush::drush($self, 'p:queue-work', [], $opt);
      $subproc->run();
      if (!is_array($result = json_decode($subproc->getOutput(), TRUE))) {
        throw new \Exception("Inter-process communication failure!");
      }
      $runs[] = $result;
      // Break the loop when finished processing or initially empty.
      if ($result['error'] == 'empty') {
        if (count($runs) === 1) {
          throw new \Exception(dt("The queue is empty or has only locked items!"));
        }
        break;
      }
      // Render a simple results table during interactive runs.
      if ($options['format'] == 'string') {
        $this->io()->table(
          [],
          [
            [dt("Succeeded"), $result['succeeded']],
            [dt("Failed"), $result['failed']],
            [dt("Currently invalidating"), $result['processing']],
            [dt("Not supported"), $result['not_supported']],
          ]
        );
      }
      // Break the loop for any other type of error.
      if ($result['error']) {
        throw new \Exception($result['error']);
      }
    } while ($options['finish'] && is_null($result['error']));

    return ($options['format'] == 'string') ? NULL : new RowsOfFields($runs);
  }

  /**
   * Process a single chunk with items from the queue.
   *
   * @param null|bool|string $returnstruct
   *   When TRUE or a (error) string, this returns an empty response array.
   *
   * @return array
   *   Associative array with the following items:
   *    - str   'error'
   *    - int   'total'
   *    - int   'processing'
   *    - int   'succeeded'
   *    - int   'failed'
   *    - int   'not_supported'
   */
  protected function queueWorkChunk($returnstruct = NULL) {
    if (!is_null($returnstruct)) {
      return [
        'error' => is_string($returnstruct) ? $returnstruct : NULL,
        'total' => 0,
        'processing' => 0,
        'succeeded' => 0,
        'failed' => 0,
        'not_supported' => 0,
      ];
    }
    // Retrieve the processor object and fail when it is not available.
    if (!($processor = $this->purgeProcessors->get('drush_purge_queue_work'))) {
      return $this->queueWorkChunk(
        dt("Please add the required processor:\ndrush p:processor-add drush_purge_queue_work"));
    }
    // Claim a chunk of items and exit execution when finished.
    if (!($claims = $this->purgeQueue->claim())) {
      return $this->queueWorkChunk('empty');
    }
    // Attempt to process the claims and handle the results.
    try {
      $this->purgePurgers->invalidate($processor, $claims);
    }
    catch (DiagnosticsException $e) {
      return $this->queueWorkChunk($e->getMessage());
    }
    catch (CapacityException $e) {
      return $this->queueWorkChunk($e->getMessage());
    }
    catch (LockException $e) {
      return $this->queueWorkChunk($e->getMessage());
    }
    finally {
      $this->purgeQueue->handleResults($claims);
    }
    // Propagate the result structure by counting states.
    $result = $this->queueWorkChunk(TRUE);
    $result['total'] = count($claims);
    foreach ($claims as $claim) {
      $result[strtolower($claim->getStateString())]++;
    }
    // Fail hard when the numbers aren't looking good.
    if (($result['succeeded'] === 0) && ($result['processing'] === 0)) {
      $result['error'] = dt("Not a single invalidation was successful!");
    }
    if (($result['failed'] / $result['total']) > 0.4) {
      $result['error'] = dt("Over 40% failed, please check the logs!");
    }
    return $result;
  }

}
