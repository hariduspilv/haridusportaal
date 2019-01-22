<?php


use \Drupal\content_export_yaml\ContentExport;

function content_export_yaml_drush_command() {
  $items = [];
  $items['cex-node'] = [
    'description' => 'Export Content Node',
    'aliases' => ['cexn'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];
  $items['cim-node'] = [
    'description' => 'Import Content Node',
    'aliases' => ['cimn'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];
  $items['cim-block'] = [
    'description' => 'Import Content Block custom',
    'aliases' => ['cimb','cim-block_content'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];
  $items['cex-block'] = [
    'description' => 'Export Content Block custom',
    'aliases' => ['cexb','cex-block_content'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];
  $items['cim-term'] = [
    'description' => 'Import Content Term custom',
    'aliases' => ['cimt','cim-taxonomy','cim-taxonomy_term'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];
  $items['cex-term'] = [
    'description' => 'Export Content Term custom',
    'aliases' => ['cext','cex-taxonomy','cex-taxonomy_term'],
    'arguments' => [
      'bundle' => 'The split configuration to export, if none is given do a normal import.',
      'id' => 'The split configuration to export, if none is given do a normal import.',
    ],
  ];

  return $items;
}
function drush_content_export_yaml_cex_term($bundle = NULL, $id = NULL) {
  $bundle_list = \Drupal\taxonomy\Entity\Vocabulary::loadMultiple();
  $bundle_list_name = array_keys($bundle_list);

  if ($bundle == NULL) {
    drush_print('Vocabulary is required ,it should be one of : '. implode(" - ",$bundle_list_name));
  }
  else {
    $export = new ContentExport();
    if(!in_array($bundle,$bundle_list_name)){
      drush_print('That Vocabulary  not exist , it should be one of : ' . implode(" - ",$bundle_list_name));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
      drush_print('Please enter Range ID you want to export : ');
      $start = drush_prompt(dt('Start To'));
      $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_term_list($bundle);
    }
    else {
      $result = $export->load_term_list($bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $item ,
            'index' => $key,
            'total' => $total,
            'type' => $bundle,
            'entity' => 'taxonomy_term'
          ];
          $operations[] = [
            'content_export_yaml_cex_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Export content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Export Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }

  }


}
function drush_content_export_yaml_cim_term($bundle = NULL, $id = NULL) {
  $bundle_list = \Drupal\taxonomy\Entity\Vocabulary::loadMultiple();
  $bundle_list_name = array_keys($bundle_list);

  if ($bundle == NULL) {
    drush_print('Vocabulary is required ,it should be one of : '. implode(" - ",$bundle_list_name));
  }
  else {
    $export = new ContentExport();
    if(!in_array($bundle,$bundle_list_name)){
      drush_print('That Vocabulary  not exist , it should be one of : ' . implode(" - ",$bundle_list_name));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
      drush_print('Please enter Range ID you want to export : ');
      $start = drush_prompt(dt('Start To'));
      $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_entity_config_list('taxonomy_term',$bundle);
    }
    else {
      $result = $export->load_entity_config_list('taxonomy_term',$bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $item ,
            'index' => $key+1,
            'total' => $total,
            'entity' => 'taxonomy_term',
            'id_label' => 'tid',
            'bundle_label' => 'vid',
            'type' => $bundle
          ];
          $operations[] = [
            'content_export_yaml_cim_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Import block content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Import Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }

  }


}

function drush_content_export_yaml_cex_block($bundle = NULL, $id = NULL) {
  $block_content_list = \Drupal\block_content\Entity\BlockContentType::loadMultiple();
  $block_content_list_name = array_keys($block_content_list);

  if ($bundle == NULL) {
    drush_print('Block Type is required ,it should be one of : '. implode(" - ",$block_content_list_name));
  }
  else {
    $export = new ContentExport();
    if(!in_array($bundle,$block_content_list_name)){
      drush_print('That Block type  not exist , it should be one of : ' . implode(" - ",$block_content_list_name));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
        drush_print('Please enter Range ID you want to export : ');
        $start = drush_prompt(dt('Start To'));
        $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_block_list($bundle);
    }
    else {
      $result = $export->load_block_list($bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $key ,
            'index' => $key,
            'total' => $total,
            'type' => $bundle
          ];
          $operations[] = [
            'content_export_yaml_block_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Export block content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Export Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }

  }


}
function drush_content_export_yaml_cim_block($bundle = NULL, $id = NULL) {
  $block_content_list = \Drupal\block_content\Entity\BlockContentType::loadMultiple();
  $block_content_list_name = array_keys($block_content_list);

  if ($bundle == NULL) {
    drush_print('Block Type is required ,it should be one of : '. implode(" - ",$block_content_list_name));
  }
  else {
    $export = new ContentExport();
    if(!in_array($bundle,$block_content_list_name)){
      drush_print('That Block type  not exist , it should be one of : ' . implode(" - ",$block_content_list_name));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
        drush_print('Please enter Range ID you want to export : ');
        $start = drush_prompt(dt('Start To'));
        $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_block_list_config($bundle);
    }
    else {
      $result = $export->load_block_list_config($bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $item ,
            'index' => $key+1,
            'total' => $total,
            'entity' => 'block_content',
            'type' => $bundle
          ];
          $operations[] = [
            'content_export_yaml_block_cim_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Import block content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Import Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }

  }


}


function drush_content_export_yaml_cex_node($bundle = NULL, $id = NULL) {
  if ($bundle == NULL) {
    drush_print('Parameter is required for example drush cex-node all ');
  }
  else {
    $export = new ContentExport();
    $bundle_array = $export->content_type_list();
    if(!in_array($bundle,array_keys($bundle_array))){
      drush_print('That node type  not exist , it should be one of : ' . implode(" - ",array_keys($bundle_array)));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
      drush_print('Please enter Range ID you want to export : ');
      $start = drush_prompt(dt('Start To'));
      $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_node_list($bundle);
    }
    else {
      $result = $export->load_node_list($bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $item->nid,
            'index' => $key + 1,
            'total' => $total,
          ];
          $operations[] = [
            'content_export_yaml_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Export node content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Export Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }
  }

}


function drush_content_export_yaml_cim_node($bundle = NULL, $id = NULL) {
  if ($bundle == NULL) {
    drush_print('Parameter is required for example drush cim-node all ');
  }
  else {
    $export = new ContentExport();
    $bundle_array = $export->content_type_list();
    if(!in_array($bundle,array_keys($bundle_array))){
      drush_print('That node type  not exist , it should be one of : ' . implode(" - ",array_keys($bundle_array)));
      exit(0);
    }
    if ($id) {
      $start = $id;
      $end = $id;
    }
    else {
      drush_print('Please enter Range file ID you want to insert : ');
      $start = drush_prompt(dt('Start To'));
      $end = drush_prompt(dt('End'));
    }
    if ($id == 'all') {
      $result = $export->load_node_config_list($bundle);
    }
    else {
      $result = $export->load_node_config_list($bundle, [$start, $end]);
    }
    if (!empty($result)) {
      if (drush_confirm(dt('Find items ' . sizeof($result) . ' , Are you sure to continue the process ?'))) {
        $total = sizeof($result);
        foreach ($result as $key => $item) {
          $info = [
            'id' => $item,
            'index' => $key,
            'total' => $total,
          ];
          $operations[] = [
            'content_export_yaml_import_index_batch_process',
            [$info],
          ];
        }
        $batch = [
          'operations' => $operations,
          'title' => t('Import node content process'),
          'init_message' => t('Starting...'),
          'progress_message' => t('Completed @current of @total.'),
          'error_message' => t('An error occurred'),
          'finished' => 'content_export_batch_finish',
          'file' => drupal_get_path('module', 'content_export_yaml') . '/drush/content_export_yaml.batch.inc',
        ];
        // Start the batch job.
        batch_set($batch);
        drush_backend_batch_process();
      }
      else {
        drush_print('Content Export Canceled');
      }
    }
    else {
      drush_print('No items are found');
    }
  }

}

