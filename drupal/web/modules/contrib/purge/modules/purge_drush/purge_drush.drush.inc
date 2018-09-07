<?php

/**
 * @file
 * Administrative Drush commands for Purge.
 */

use Drupal\Core\DependencyInjection\ContainerNotInitializedException;

/**
 * Implements hook_drush_help().
 */
function purge_drush_drush_help($command) {
  switch ($command) {
    case 'meta:purge_drush:title':
      return dt('Purge');
    case 'meta:purge_drush:summary':
      return dt('Administrative Drush commands for Purge.');
  }
}

/**
 * Implements hook_drush_command().
 */
function purge_drush_drush_command() {
  $items = [];
  $items['cache-rebuild-external'] = [
    '_purge_drush_inherit_context' => 'p-invalidate',
    'description' => "Invalidate 'everything' using the Purge framework.",
    'callback' => 'purge_drush_callback_router',
    'aliases' => ['cre'],
    'options' => [
      'type' => [
        '_default' => 'everything',
      ],
    ],
  ];
  $items['p-debug-dis'] = [
    'description' => "Disable debugging for all of Purge's log channels.",
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.logger',],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-debug-disable' => 'Disables the log channels.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pddis'],
    'core' => ['8+'],
  ];
  $items['p-debug-en'] = [
    'description' => "Enable debugging for all of Purge's log channels.",
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.logger',],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-debug-enable' => 'Enables the log channels.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pden'],
    'core' => ['8+'],
  ];
  $items['p-diagnostics'] = [
    'description' => 'Generate a diagnostic self-service report.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.diagnostics',],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-diagnostics' => 'Build the diagnostic report as a table.',
      'drush p-diagnostics --format=json' => 'Export as JSON.',
      'drush p-diagnostics --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json',],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'yaml',
      'concatenate-columns' => ['recommendation' => ['value', 'recommendation']],
      'fields-default' => ['title', 'recommendation', 'severity'],
      'field-labels' => [
        'id' => 'Id',
        'title' => 'Title',
        'description' => 'Description',
        'recommendation' => 'Recommendation',
        'value' => 'Value',
        'severity' => 'Severity',
        'severity_int' => 'SevInt',
        'blocks_processing' => 'Blocking?',
      ],
      'column-widths' => [
        'severity' => 8,
        'value' => 20,
        'recommendation' => 50,
        'severity_int' => 6,
      ],
    ],
    'aliases' => ['pdia'],
    'core' => ['8+'],
  ];
  $items['p-invalidate'] = [
    'description' => 'Directly invalidate an item without going through the queue.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.invalidation.factory', 'purge.processors', 'purge.purgers'],
    'arguments' => [
      'type' => 'The type of invalidation to perform, e.g.: tag, path, url.',
      'expression' => 'The string expression of what needs to be invalidated.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-invalidate tag node:1' => 'Clears URLs tagged with "node:1" from external caching platforms.',
      'drush p-invalidate url http://www.drupal.org/' => 'Clears "http://www.drupal.org/" from external caching platforms.',
      'drush p-invalidate everything' => 'Clears everything on external caching platforms.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pinv'],
    'core' => ['8+'],
  ];
  $items['p-processor-add'] = [
    'description' => 'Add a new processor.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.processors'],
    'arguments' => [
      'id' => 'The plugin ID of the processor to add.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-processor-add ID' => 'Add a processor of type ID.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pradd'],
    'core' => ['8+'],
  ];
  $items['p-processor-ls'] = [
    'description' => 'List all enabled processors.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.processors',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [],
    'examples' => [
      'drush p-processor-ls' => 'List all processors in a table.',
      'drush p-processor-ls --table=json' => 'Export all processors in JSON.',
      'drush p-processor-ls --table=yaml' => 'Export all processors in YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'id' => 'Id',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['prls'],
    'core' => ['8+'],
  ];
  $items['p-processor-lsa'] = [
    'description' => 'List available processor plugin IDs that can be added.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.processors'],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-processor-lsa' => 'List available plugin IDs for which processors can be created.',
      'drush p-processor-lsa --format=json' => 'Export as JSON.',
      'drush p-processor-lsa --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'plugin_id' => 'Plugin',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['prlsa'],
    'core' => ['8+'],
  ];
  $items['p-processor-rm'] = [
    'description' => 'Remove a processor.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.processors'],
    'arguments' => [
      'id' => 'The plugin ID of the processor to remove.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-processor-rm ID' => 'Remove the given processor.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['prrm'],
    'core' => ['8+'],
  ];
  $items['p-purger-add'] = [
    'description' => 'Create a new purger instance.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [
      'id' => 'The plugin ID of the purger instance to create.',
    ],
    'required-arguments' => 1,
    'options' => [
      'if-not-exists' => [
        'description' => "Don't create a new purger if one of this type exists.",
        'value' => FALSE,
        '_default' => FALSE,
      ],
    ],
    'examples' => [
      'drush p-purger-add ID' => 'Add a purger of type ID.',
      'drush p-purger-add --if-not-exists ID' => 'Create purger ID if it does not exist.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['ppadd'],
    'core' => ['8+'],
  ];
  $items['p-purger-ls'] = [
    'description' => 'List all configured purgers in order of execution.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-purger-ls' => 'List all configured purgers in order of execution.',
      'drush p-purger-ls --format=json' => 'Export as JSON.',
      'drush p-purger-ls --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'instance_id' => 'Instance',
        'plugin_id' => 'Plugin',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['ppls'],
    'core' => ['8+'],
  ];
  $items['p-purger-lsa'] = [
    'description' => 'List available plugin IDs for which purgers can be added.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-purgers-lsa' => 'List available plugin IDs for which purgers can be created.',
      'drush p-purgers-lsa --format=json' => 'Export as JSON.',
      'drush p-purgers-lsa --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'plugin_id' => 'Plugin',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['pplsa'],
    'core' => ['8+'],
  ];
  $items['p-purger-mvd'] = [
    'description' => 'Move the given purger DOWN in the execution order.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [
      'id' => 'The instance ID of the purger to move down.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-purger-mv-down ID' => 'Move this purger down.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['ppmvd'],
    'core' => ['8+'],
  ];
  $items['p-purger-mvu'] = [
    'description' => 'Move the given purger UP in the execution order.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [
      'id' => 'The instance ID of the purger to move up.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-purger-mv-down ID' => 'Move this purger up.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['ppmvu'],
    'core' => ['8+'],
  ];
  $items['p-purger-rm'] = [
    'description' => 'Remove a purger instance.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.purgers'],
    'arguments' => [
      'id' => 'The instance ID of the purger to remove.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-purger-rm ID' => 'Remove the given purger.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pprm'],
    'core' => ['8+'],
  ];
  $items['p-queue-add'] = [
    'description' => 'Add one or more items to the queue for later processing.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue', 'purge.queuers', 'purge.invalidation.factory'],
    'arguments' => [
      'type' => 'The type of invalidation to queue, e.g.: tag, path, url.',
      'expression' => 'The string expression of what needs to be invalidated.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-queue-add tag node:1' => 'Clears all cached pages matching TAG "node:1".',
      'drush pqa url http://www.s.com/rss.xml' => 'Clears only the URL provided.',
      'drush pqa wildcardurl http://s.com/f/*' => 'Clears URLs by wildcard, all under http://s.com/f/ will be cleared.',
      'drush pqa everything' => 'Instructs to clear the entire site, be careful!',
      'drush pqa tag node:1,tag node:2,url http://../rss.xml,tag node:321' => 'Comma separated input of multiple items.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pqa'],
    'core' => ['8+'],
  ];
  $items['p-queue-browse'] = [
    'description' => 'Inspect what is in the queue by paging through it.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [
      'limit' => [
        'description' => 'The number of items to show on a single page.',
        'example-value' => '20',
        'value' => 'optional',
        '_default' => 20,
      ],
      'page' => [
        'description' => 'The page to show data for, pages start at 1.',
        'example-value' => '1',
        'value' => 'optional',
        '_default' => 1,
      ],
    ],
    'examples' => [
      'drush p-queue-browse' => 'Browse queue content and press space to load more.',
      'drush p-queue-browse --limit=30' => 'Browse the queue content and show 30 items at a time.',
      'drush p-queue-browse --page=3' => 'Show page 3 of the queue.',
      'drush p-queue-browse --format=json' => 'Fetch a page from the queue exported as JSON.',
      'drush p-queue-browse --format=yaml' => 'Fetch a page from the queue exported as JSON.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'typetr' => 'Type',
        'statetr' => 'State',
        'expression' => 'Expression',
      ],
    ],
    'aliases' => ['pqb'],
    'core' => ['8+'],
  ];
  $items['p-queue-empty'] = [
    'description' => 'Empty the entire queue.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue.stats', 'purge.queue',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [],
    'examples' => [
      'drush p-queue-empty' => 'Empty the entire queue.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pqe'],
    'core' => ['8+'],
  ];
  $items['p-queue-stats'] = [
    'description' => 'Retrieve the queue statistics.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue.stats',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [
      'reset-totals' => [
        'description' => "Wipe the TOTAL statistical counters.",
        'value' => FALSE,
        '_default' => FALSE,
      ],
    ],
    'examples' => [
      'drush p-queue-stats' => 'Retrieve the queue statistics.',
      'drush p-queue-stats --reset-totals' => 'Wipe the TOTAL statistical counters.',
      'drush p-queue-stats --format=json' => 'Fetch the data as JSON.',
      'drush p-queue-stats --format=yaml' => 'Fetch the data as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json',],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'yaml',
      'field-labels' => [
        'left' => '',
        'right' => '',
      ],
      'column-widths' => [
        'left' => 20,
        'right' => 60,
      ],
    ],
    'aliases' => ['pqs'],
    'core' => ['8+'],
  ];
  $items['p-queue-volume'] = [
    'description' => 'Count how many items currently sit in the queue.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [],
    'examples' => [
      'drush p-queue-volume' => 'The number of items in the queue.',
      'drush p-queue-volume --format=yaml' => 'YAML parseable output.',
      'drush p-queue-volume --format=json' => 'JSON parseable output.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pqv'],
    'core' => ['8+'],
  ];
  $items['p-queue-work'] = [
    'description' => 'Claim a chunk of items from the queue and process them.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queue', 'purge.processors', 'purge.purgers'],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [
      'finish' => [
        'description' => 'Continue processing till the queue is empty.',
        'value' => FALSE,
        '_default' => FALSE,
      ],
    ],
    'examples' => [
      'drush p-queue-work' => 'Claim a chunk of items from the queue and process them.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['pqw'],
    'core' => ['8+'],
  ];
  $items['p-queuer-add'] = [
    'description' => 'Add a new queuer.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queuers'],
    'arguments' => [
      'id' => 'The plugin ID of the queuer to add.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-queuer-add ID' => 'Add a queuer of type ID.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['puadd'],
    'core' => ['8+'],
  ];
  $items['p-queuer-ls'] = [
    'description' => 'List all enabled queuers.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queuers',],
    'arguments' => [],
    'required-arguments' => FALSE,
    'options' => [],
    'examples' => [
      'drush p-queuer-ls' => 'List all queuers in a table.',
      'drush p-queuer-ls --table=json' => 'Export all queuers in JSON.',
      'drush p-queuer-ls --table=yaml' => 'Export all queuers in YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'id' => 'Id',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['puls'],
    'core' => ['8+'],
  ];
  $items['p-queuer-lsa'] = [
    'description' => 'List available queuer plugin IDs that can be added.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queuers'],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-queuer-lsa' => 'List available plugin IDs for which queuers can be created.',
      'drush p-queuer-lsa --format=json' => 'Export as JSON.',
      'drush p-queuer-lsa --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => [
        'plugin_id' => 'Plugin',
        'label' => 'Label',
        'description' => 'Description',
      ],
    ],
    'aliases' => ['pulsa'],
    'core' => ['8+'],
  ];
  $items['p-queuer-rm'] = [
    'description' => 'Remove a queuer.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.queuers'],
    'arguments' => [
      'id' => 'The plugin ID of the queuer to remove.',
    ],
    'required-arguments' => 1,
    'options' => [],
    'examples' => [
      'drush p-queuer-rm ID' => 'Remove the given queuer.',
    ],
    '_outputformats' => ['string', 'yaml', 'json'],
    'outputformat' => [
      'default' => 'string',
      'pipe-format' => 'yaml',
    ],
    'aliases' => ['purm'],
    'core' => ['8+'],
  ];
  $items['p-types'] = [
    'description' => 'List all supported cache invalidation types.',
    'callback' => 'purge_drush_callback_router',
    'callback services' => ['purge.invalidation.factory', 'purge.purgers'],
    'arguments' => [],
    'required-arguments' => 0,
    'options' => [],
    'examples' => [
      'drush p-types' => 'List all supported cache invalidation types.',
      'drush p-types --format=json' => 'Export as JSON.',
      'drush p-types --format=yaml' => 'Export as YAML.',
    ],
    '_outputformats' => ['table', 'yaml', 'json', 'list'],
    'outputformat' => [
      'default' => 'table',
      'pipe-format' => 'list',
      'field-labels' => ['label' => 'Type',],
    ],
    'aliases' => ['ptyp'],
    'core' => ['8+'],
  ];
  return $items;
}

/**
 * Implements hook_drush_command_alter().
 */
function purge_drush_drush_command_alter(&$command) {

  // P-TYPES: Add a column for each enabled purger.
  if ($command['command'] === 'p-types') {
    try {
      foreach (\Drupal::service('purge.purgers')->getLabels() as $id => $label) {
        $label = (string) $label;
        $command['outputformat']['field-labels'][$id] = $label;
        $command['engines']['outputformat']['field-labels'][$id] = $label;
      }
    }
    catch (ContainerNotInitializedException $e) {
      // This happens barely, but when it does we simply don't add any columns.
    }
  }
}

/**
 * Route command execution to the right function and load its file.
 *
 * @param mixed $...
 *   One or more parameters passed depending on the routed command definition.
 *
 * @return mixed
 *   The command response.
 */

function purge_drush_callback_router() {

  // Load the command context and allow a basic form of inheritance.
  $context = drush_get_command();
  if (isset($context['_purge_drush_inherit_context'])) {
    $contexts = purge_drush_drush_command();
    $context_parent = $contexts[$context['_purge_drush_inherit_context']];
    $context_child = $contexts[$context['command']];
    $context_child['command'] = $context['_purge_drush_inherit_context'];
    $context = array_merge($context, $context_parent, $context_child);
  }

  // Come up with the actual command name.
  $command = str_replace('-', '_', $context['command']);

  // Load requested container services in our own 'callback services' field.
  $services = [];
  foreach ($context['callback services'] as $service) {
    $services[] = \Drupal::service($service);
  }

  // Append options with '_default' as arguments to keep callbacks simple.
  $args = func_get_args();
  foreach ($context['options'] as $option => $definition) {
    if (isset($definition['_default'])) {
      $args[] = drush_get_option($option, $definition['_default']);
    }
  }

  // Verify that the given --format is listed in our '_outputformats'.
  if (drush_get_option('pipe', FALSE)) {
    $format = $context['outputformat']['pipe-format'];
  }
  else {
    $format = drush_get_option('format', $context['outputformat']['default']);
  }
  if (!in_array($format, $context['_outputformats'])) {
    $formats = ['@formats' => implode(', ', $context['_outputformats'])];
    $message = dt('Unsupported output format, options: @formats.', $formats);
    return drush_set_error('DRUSH_FORMAT_ERROR', $message);
  }

  // Require the actual file in which the callback resides.
  require_once dirname(__FILE__) . '/' .  'purge_drush.' . $command . '.inc';

  // Build up the final structure of the arguments and dispatch code execution.
  $final_args = array_merge(
    [$format],
    $services, $args);
  return call_user_func_array('purge_drush_' . $command, $final_args);
}
