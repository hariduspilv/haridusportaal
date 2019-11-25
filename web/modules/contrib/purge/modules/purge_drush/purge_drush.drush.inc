<?php

/**
 * @file
 * Drush 8 commands for Purge: legacy function wrappers.
 */

/**
 * Implements hook_drush_command().
 */
function purge_drush_drush_command() {
  $items = [];
  $items['cache-rebuild-external'] = [
    'description' => "Invalidate 'everything' using the Purge framework.",
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['cache:rebuild-external'],
    'aliases' => ['cre'],
    'core' => ['8+'],
  ];
  $items['p-debug-dis'] = [
    'description' => "Disable debugging for all of Purge's log channels.",
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:debug-dis'],
    'aliases' => ['pddis'],
    'core' => ['8+'],
  ];
  $items['p-debug-en'] = [
    'description' => "Enable debugging for all of Purge's log channels.",
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:debug-en'],
    'aliases' => ['pden'],
    'core' => ['8+'],
  ];
  $items['p-diagnostics'] = [
    'description' => 'Generate a diagnostic self-service report.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:diagnostics'],
    'aliases' => ['pdia'],
    'core' => ['8+'],
  ];
  $items['p-invalidate'] = [
    'description' => 'Directly invalidate an item without going through the queue.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:invalidate'],
    'aliases' => ['pinv'],
    'core' => ['8+'],
  ];
  $items['p-processor-add'] = [
    'description' => 'Add a new processor.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:processor-add'],
    'aliases' => ['pradd'],
    'core' => ['8+'],
  ];
  $items['p-processor-ls'] = [
    'description' => 'List all enabled processors.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:processor-ls'],
    'aliases' => ['prls'],
    'core' => ['8+'],
  ];
  $items['p-processor-lsa'] = [
    'description' => 'List available processor plugin IDs that can be added.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:processor-lsa'],
    'aliases' => ['prlsa'],
    'core' => ['8+'],
  ];
  $items['p-processor-rm'] = [
    'description' => 'Remove a processor.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:processor-rm'],
    'aliases' => ['prrm'],
    'core' => ['8+'],
  ];
  $items['p-purger-add'] = [
    'description' => 'Create a new purger instance.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-add'],
    'aliases' => ['ppadd'],
    'core' => ['8+'],
  ];
  $items['p-purger-ls'] = [
    'description' => 'List all configured purgers in order of execution.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-ls'],
    'aliases' => ['ppls'],
    'core' => ['8+'],
  ];
  $items['p-purger-lsa'] = [
    'description' => 'List available plugin IDs for which purgers can be added.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-lsa'],
    'aliases' => ['pplsa'],
    'core' => ['8+'],
  ];
  $items['p-purger-mvd'] = [
    'description' => 'Move the given purger DOWN in the execution order.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-mvd'],
    'aliases' => ['ppmvd'],
    'core' => ['8+'],
  ];
  $items['p-purger-mvu'] = [
    'description' => 'Move the given purger UP in the execution order.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-mvu'],
    'aliases' => ['ppmvu'],
    'core' => ['8+'],
  ];
  $items['p-purger-rm'] = [
    'description' => 'Remove a purger instance.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:purger-rm'],
    'aliases' => ['pprm'],
    'core' => ['8+'],
  ];
  $items['p-queue-add'] = [
    'description' => 'Add one or more items to the queue for later processing.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-add'],
    'aliases' => ['pqa'],
    'core' => ['8+'],
  ];
  $items['p-queue-browse'] = [
    'description' => 'Inspect what is in the queue by paging through it.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-browse'],
    'aliases' => ['pqb'],
    'core' => ['8+'],
  ];
  $items['p-queue-empty'] = [
    'description' => 'Empty the entire queue.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-empty'],
    'aliases' => ['pqe'],
    'core' => ['8+'],
  ];
  $items['p-queue-stats'] = [
    'description' => 'Retrieve the queue statistics.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-stats'],
    'aliases' => ['pqs'],
    'core' => ['8+'],
  ];
  $items['p-queue-volume'] = [
    'description' => 'Count how many items currently sit in the queue.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-volume'],
    'aliases' => ['pqv'],
    'core' => ['8+'],
  ];
  $items['p-queue-work'] = [
    'description' => 'Claim a chunk of items from the queue and process them.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queue-work'],
    'aliases' => ['pqw'],
    'core' => ['8+'],
  ];
  $items['p-queuer-add'] = [
    'description' => 'Add a new queuer.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queuer-add'],
    'aliases' => ['puadd'],
    'core' => ['8+'],
  ];
  $items['p-queuer-ls'] = [
    'description' => 'List all enabled queuers.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queuer-ls'],
    'aliases' => ['puls'],
    'core' => ['8+'],
  ];
  $items['p-queuer-lsa'] = [
    'description' => 'List available queuer plugin IDs that can be added.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queuer-lsa'],
    'aliases' => ['pulsa'],
    'core' => ['8+'],
  ];
  $items['p-queuer-rm'] = [
    'description' => 'Remove a queuer.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:queuer-rm'],
    'aliases' => ['purm'],
    'core' => ['8+'],
  ];
  $items['p-types'] = [
    'description' => 'List all supported cache invalidation types.',
    'callback' => 'purge_drush_legacy_handler',
    'callback arguments' => ['p:types'],
    'aliases' => ['ptyp'],
    'core' => ['8+'],
  ];
  return $items;
}

/**
 * Tell the user that Drush 8 support has been removed.
 *
 * @param string $drush9_command
 *   Name of the Drush 9 command to use instead.
 *
 * @return mixed
 *   The command response.
 */
function purge_drush_legacy_handler($drush9_command) {
  return drush_set_error(
    'DRUSH_FORMAT_ERROR',
    dt("The Purge project dropped Drush 8 support, please use Drush 9's @newcmd instead.", ['@newcmd' => $drush9_command])
  );
}
