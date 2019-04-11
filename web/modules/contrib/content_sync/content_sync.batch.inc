<?php
use Drupal\Core\Entity\ContentEntityType;
use Drupal\Core\Serialization\Yaml;
use Drupal\Core\Archiver\ArchiveTar;

/**
 * Processes the content single import batch
 *
 * @param $data
 *   The batch content to persist.
 * @param array $context
 *   The batch context.
 */
function processContentBatch($data, &$context) {
  // Initialize Batch
  if ( empty($context['sandbox']) ) {
    $context['sandbox']['progress'] = 0;
    $context['sandbox']['current_number'] = 0;
    if(isset($data['values'])) {
      $context['sandbox']['max'] = (int) count($data['values']);
    }else{
      $context['sandbox']['max'] = 1;
    }
  }

  // In case of multiple values data
  $data_entity = $data;
  if(isset($data['values'])) {
    $data_entity['values'][0] = $data['values'][$context['sandbox']['progress']];
  }

  _content_sync_entity_to_db($data_entity, '', $context);

  if ( $context['sandbox']['progress'] != $context['sandbox']['max'] ) {
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
  }
}


/**
 * Processes the content sync import batch
 *
 * @param $files
 *   The batch content to persist.
 * @param $collection
 *   files division - subfolder.
 * @param $operation
 *   The type of import: create, update, delete.
 * @param array $context
 *   The batch context.
 */
function processContentDirectoryBatch($files, $collection, $operation, &$context) {
  //Initialize Batch
  if ( empty($context['sandbox']) ) {
    $context['sandbox']['progress'] = 0;
    $context['sandbox']['current_number'] = 0;
    $context['sandbox']['max'] = (int) count($files);
  }

  //Get the file to process
  $file = $files[$context['sandbox']['progress']];

  // Skip site.uuid as it is not a content entity.
  if($file == "site.uuid"){
    $context['results']['errors'][] = t('File Skipped ') . $file . t(' - site uuid should not be changed');
    $context['message'] = "File Skipped: " . $file;
    $context['sandbox']['progress']++;
    $operation = Null;
  }

  $directory = content_sync_get_content_directory('sync');

  // Validate file YAML format
  if (!empty($collection)){
    $file_path = $directory . "/".str_replace(".","/",$collection) . "/" . $file . ".yml";
  }else{
    $file_path = $directory . "/" . $file . ".yml";
  }
  $info = pathinfo($file_path);
  if ( strtolower($info["extension"]) != "yml" ) {
    $context['results']['errors'][] = t("File Skipped: ") . $file;
    $context['message'] = "File Skipped: " . $file;
    $context['sandbox']['progress']++;
  }else {

    list($entity_type, $entity_bundle, $entity_uuid) = explode('.', $file);

    // Skip superuser and current user  -- Avoid batch errors for session lost.
    // Get super user uuid
    $current_user_uuid = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id())->uuid();
    if($current_user_uuid == $entity_uuid){
      $context['results'][] = t('File Skipped ') . $file . t(' - current user info should not be updated');
      $context['message'] = "File Skipped: " . $file;
      $context['sandbox']['progress']++;
    }else {
      // Get super admin uuid -- assuming it is id 1
      $superadmin_user_uuid = \Drupal\user\Entity\User::load(1)->uuid();
      if ( $superadmin_user_uuid == $entity_uuid ) {
        $context['results'][] = t('File Skipped ') . $file . t(' - super admin user info should not be updated');
        $context['message'] = "File Skipped: " . $file;
        $context['sandbox']['progress']++;
      }else {
        if ( $operation == "create" || $operation == "update" ) {
          //Load the yml file and decode.
          try {
            $file_data = file_get_contents($file_path);
            $data = Yaml::decode($file_data);
          }
          catch (\Exception $e) {
            $context['results']['errors'][] = t('Error: %message.', ['%message' => $e->getMessage()]);
            $data = "";
          }
          //Verify that the uuid field is the same as the file name
          if ( $entity_uuid != $data['values'][0]['uuid'][0]['value'] ||
               $entity_type != $data['entity_type'] ||
               $entity_bundle != $data['bundle'] ) {
            $context['results']['errors'][] = t('File Skipped ') . $file . t(" - Malformed file");
            $context['message'] = "File Skipped: " . $file;
            $context['sandbox']['progress']++;
          }
          else {
            _content_sync_entity_to_db($data, $file, $context);
          }
        }
        elseif ( $operation == "delete" ) {
          $context['results'][] = t("Content Entity Deleted: ") . $file;

          $entityRepository = \Drupal::service('entity.repository');
          $entity = $entityRepository->loadEntityByUuid($entity_type, $entity_uuid);
          if ( !empty($entity) ) {
            $entity->delete();
          }
          $context['message'] = "Entity Deleted: " . $file;
          $context['sandbox']['progress']++;
        }
      }
    }
  }

  if ( $context['sandbox']['progress'] != $context['sandbox']['max'] ) {
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
  }
}

/**
 * Process a content entity YAML and store to the db
 * IMPORT Content.
 *
 * @param $data
 *   Content entity data from YAML.
 * @param $file
 *   file path.
 * @param array $context
 *   The batch context.
 */
 function _content_sync_entity_to_db($data, $file, &$context) {
   // Entity Type and Field Manager
   $entityTypeManager = \Drupal::entityTypeManager();
   $entityFieldManager = \Drupal::service('entity_field.manager');
   $entityBundles = \Drupal::service("entity_type.bundle.info");
   $entityRepository = \Drupal::service('entity.repository');

   // Process data only if there is a valid entity type and bundle flag
   $valid_entity_type = TRUE;

   // Get entity type
   if ( isset($data['entity_type']) ) {
     $entity_type = $data['entity_type'];
   }
   // Get entity bundle
   if ( isset($data['bundle']) ) {
     $entity_bundle = $data['bundle'];
   }
   // Validate entity_type and bundle
   if ( empty($entity_type) || empty($entity_bundle) ) {
     $context['results']['errors'][] = t('Entity Type and Bundle are required.') . $file;
     //$context['sandbox']['max'] = $context['sandbox']['progress'];
     $context['sandbox']['progress']++;
     $valid_entity_type = FALSE;
   }
   elseif ( !empty($entity_type) && !empty($entity_bundle) ) {
     // Check that entity type exists and it is a content instance
     $instances = $entityTypeManager->getDefinitions();
     if ( !(isset($instances[$entity_type]) && $instances[$entity_type] instanceof ContentEntityType) ) {
       $context['results']['errors'][] = t('Entity type does not exist or it is not a content instance.') . $file;
       $context['sandbox']['progress']++;
       $valid_entity_type = FALSE;
     }
     else {
       // Verify that bundle exists
       if ( !isset($entityBundles->getBundleInfo($entity_type)[$entity_bundle]) ) {
         $context['results']['errors'][] = t('Bundle does not exist, please review the site configuration.') . $file;
         $context['sandbox']['progress']++;
         $valid_entity_type = FALSE;
       }
       else {
         // Check if there are data to be inserted.
         if ( !isset($data['values']) ) {
           $context['results']['errors'][] = t('Values to be imported not found, check the YAML file.') . $file;
           $context['sandbox']['progress']++;
           $valid_entity_type = FALSE;
         }
       }
     }
   }

   //Process data
   if ( $valid_entity_type ) {
     // Initialize array of elements to save.
     $entity_elements = [];

     // Get Entity Fields.
     $fields = array_filter(
       $entityFieldManager->getFieldDefinitions($entity_type, $entity_bundle), function ($field_definition) {
       return $field_definition;
     }
     );
     foreach ($fields as $fieldID => $field) {
       $entity_elements[$field->getName()] = $field->getName();
     }

     // Get Entity Properties - to know the id and bundle fields.
     $properties = $entityTypeManager->getDefinitions()[$entity_type]->getKeys();
     // Remove property ID as we are gonna use UUID to avoid conflicts.
     unset($entity_elements[$properties['id']]);
     $entity_elements = array_filter($entity_elements);

     // Get arrays of content to be inserted.
     $data_value = $data['values'][0];

     // Remove vid to avoid conflicts w/revisions.
     unset($data_value['vid']);

     // Gather Content to import
     $record = [];
     // Content
     $data_value[$properties['bundle']] = $entity_bundle;
     foreach ($entity_elements as $elementID => $element) {
       // Set value for entity fields -  from import or default.
       if ( isset($data_value[$element]) ) {
         $record['values'][$element] = $data_value[$element];
         // If it is entity reference get the id from the uuid
         $element_type = $fields[$element]->getType();
         if ( $element_type == "entity_reference" ||
           $element_type == "image" ||
           $element_type == "file"
         ) {
           // Get entity type
           $reference_type = $fields[$element]->getSettings()['target_type'];
           // Loop all the values
           if ( is_array($data_value[$element]) ) {
             foreach ($data_value[$element] as $er_key => $er_val) {
               $entity = $entityRepository->loadEntityByUuid($reference_type, $er_val['target_id']);
               unset($record['values'][$element][$er_key]['target_id']);
               if ( !empty($entity) ) {
                 $record['values'][$element][$er_key]['target_id'] = $entity->id();
               }
             }
           }
         }
       }
     }
     //$record['values']['path']['pathauto'] = TRUE;

     // Translations
     if ( isset($data_value['translations']) && is_array($data_value['translations']) ) {
       foreach ($data_value['translations'] as $translations) {
         $langcode = $translations['langcode'][0]['value'];
         // TODO --- verify if langcode is available in the site
         $translations[$properties['bundle']] = $entity_bundle;
         foreach ($entity_elements as $elementID => $element) {
           if ( isset($translations[$element]) ) {
             // Only translatable elements for translations
             if ( $fields[$elementID]->isTranslatable() == TRUE ) {
               $record['translations'][$langcode][$element] = $translations[$element];
               // If it is entity reference get the id from the uuid
               $element_type = $fields[$element]->getType();
               if ( $element_type == "entity_reference" ||
                 $element_type == "image" ||
                 $element_type == "file"
               ) {
                 // Get entity type
                 $reference_type = $fields[$element]->getSettings()['target_type'];
                 // Loop all the values
                 if ( is_array($translations[$element]) ) {
                   foreach ($translations[$element] as $er_key => $er_val) {
                     $entity = $entityRepository->loadEntityByUuid($reference_type, $er_val['target_id']);
                     unset($record['translations'][$langcode][$element][$er_key]['target_id']);
                     if ( !empty($entity) ) {
                       $record['translations'][$langcode][$element][$er_key]['target_id'] = $entity->id();
                     }
                   }
                 }
               }
             } // TODO --- Warning about untranslatable fields set on translations.
           }
         }
         //$record['translations'][$langcode]['path']['pathauto'] = TRUE;
       }
     }

     // Flag to detect if the entity exist or is a new one.
     $new_entity = TRUE;

     // Get the id of the the parent uuid.
     if ( isset($record['values']['parent']) ) {
       // Load the entity from the UUID
       $parent_uuid = $record['values']['parent'];
       $entity = $entityRepository->loadEntityByUuid($entity_type, $parent_uuid);
       // Set parent only if the parent UUID exist.
       unset($record['values']['parent']);
       if ( !empty($entity) ) {
         // Get the  parent entity id and exchange it for the uuid.
         $record['values']['parent'] = $entity->id();
       }
     }

     // Password exception for users
     if($entity_type == 'user'){
       if(isset($record['values']['pass'][0]['value'])){
         $user_password = $record['values']['pass'][0]['value'];
       }
       unset($record['values']['pass']);
     }

     // Check the UUID of the entity being imported.
     if ( isset($record['values']['uuid'][0]['value']) ) {
       // Load the entity from the UUID
       $uuid = $record['values']['uuid'][0]['value'];
       $entity = $entityRepository->loadEntityByUuid($entity_type, $uuid);
       // If the entity exist then update it.
       if ( !empty($entity) ) {
         // Set the new entity flag as false.
         $new_entity = FALSE;
         foreach ($entity_elements as $elementID => $element) {
           if ( isset($record['values'][$elementID]) ) {
             $entity->set($elementID, $record['values'][$elementID]);
           }
           else {
             // Get default value.
             $default_value = $fields[$elementID]->getDefaultValue($entity);
             $entity->set($elementID, $default_value);
           }
         }
         $entity->Save();
       }
     }
     //  Entity is new, add it.
     if ( $new_entity ) {
       $entity = $entityTypeManager->getStorage($entity_type)
         ->create($record['values']);
       $entity->Save();
     }

     // Password exception for users II
     if($entity_type == 'user' && isset($user_password)) {
       $query = \Drupal::database()->update('users_field_data');
       $query->fields([
         'pass' => $user_password
       ]);
       $query->condition('uid', $entity->id());
       $query->execute();

       // Store the data for diff
       $new_entity = _content_sync_db_to_entity($entity_type,$entity_bundle,$entity->id());
       // Create the name
       $name = $entity_type . "." . $entity_bundle . "." . $entity->uuid();
       $new_entity['values'][0]['pass'][0]['value'] = $user_password;
       //Insert/Update Data
       $query = \Drupal::database()->delete('cs_db_snapshot');
       $query->condition('name', $name);
       $query->execute();
       $query = \Drupal::database()->insert('cs_db_snapshot');
       $query->fields(['collection', 'name', 'data']);
       $query->values(['', $name, serialize($new_entity)]);
       $query->execute();

     }

     // Include Translations
     $lang_default = $entity->langcode->value;
     // Remove translations if they are in the import data the they would be inserted.
     foreach ($entity->getTranslationLanguages() as $langcode => $language) {
       // Verify that it is not the default langcode.
       if ( $langcode != $lang_default ) {
         $entity->removeTranslation($langcode);
       }
     }
     if ( isset($record['translations']) && is_array($record['translations']) ) {
       // Commented because automatically pathauto has been set.
       // \Drupal::service('path.alias_storage')->save("/taxonomy/term/" . $term->id(), "/".$entity_bundle."/".$term->id(), $lancode_original);
       foreach ($record['translations'] as $langcode => $translation) {
         // Add Translation if it is not the default language
         if ( $langcode != $lang_default ) {
           $term_translation = $entity->addTranslation($langcode);
           foreach ($translation as $itemID => $item) {
             $term_translation->$itemID->setValue($item);
           }
           $term_translation->save();
           // Commented because automatically pathauto has been set.
           // \Drupal::service('path.alias_storage')->save("/taxonomy/term/" . $term->id(), "/".$entity_bundle."/".$langcode.$term->id(), $langcode);
         }
       }
     }

     // Batch Context status.
     $context['results'][] = $entity->uuid();
     $context['message'] = 'UUID - ' . $entity->uuid();
     $context['sandbox']['progress']++;
   }
 }

/**
 * Finish batch.
 *
 * Provide information about the Content Batch results.
 */
function finishContentBatch($success, $results, $operations) {
  if ( $success ) {
    if(isset($results['errors'])) {
      $errors = $results['errors'];
      unset($results['errors']);
    }
    //kint($results);
    //$results = array_unique($results);
    //kint($results);

    // Log all the items processed
    foreach ($results as $key => $result) {
      if($key != 'errors') {
        //drupal_set_message(t('Processed UUID @title.', array('@title' => $result)));
        \Drupal::logger('content_sync')
          ->notice('Processed UUID @title.', [
            '@title' => $result,
            'link' => 'Import'
          ]);
      }
    }
    if ( !empty($errors) ) {
      // Log the errors
      $errors = array_unique($errors);
      foreach ($errors as $error) {
      //  drupal_set_message($error, 'error');
        \Drupal::logger('content_sync')->error($error, [ 'link' => 'Import']);
        // \Drupal::logger('content_sync')->error($error);
      }
      drupal_set_message(\Drupal::translation()
        ->translate('The content was imported with errors. <a href=":content-overview">Logs</a>',[':content-overview' => \Drupal::url('content.overview')]), 'warning');
      \Drupal::logger('content_sync')->warning('The content was imported with errors.', [ 'link' => 'Import']);
    }
    else {
      drupal_set_message(\Drupal::translation()->translate('The content was imported successfully. <a href=":content-overview">Logs</a>',[':content-overview' => \Drupal::url('content.overview')]));
      \Drupal::logger('content_sync')->notice('The content was imported successfully.', [ 'link' => 'Import']);
    }
  }
  else {
    // Log if there was an error.
    $message = t('Finished with an error. <a href=":content-overview">Logs</a>',[':content-overview' => \Drupal::url('content.overview')]);
    drupal_set_message($message);
    \Drupal::logger('content_sync')->error('Finished with an error.', [ 'link' => 'Import']);
  }
  drupal_flush_all_caches();
}



/**
 * Processes the content archive export batch
 *
 * @param $files
 *   The batch content to persist.
 * @param array $context
 *   The batch context.
 */
function processContentExportFiles($files, &$context) {
  //Initialize ArchiverTar
  $archiver = new ArchiveTar(file_directory_temp() . '/content.tar.gz', 'gz');

  //Initialize Batch
  if ( empty($context['sandbox']) ) {
    $context['sandbox']['progress'] = 0;
    $context['sandbox']['current_number'] = 0;
    $context['sandbox']['max'] = count($files);
  }
  // Get submitted values
  $entity_type = $files[$context['sandbox']['progress']]['entity_type'];
  $entity_bundle = $files[$context['sandbox']['progress']]['entity_bundle'];
  $entity_id = $files[$context['sandbox']['progress']]['entity_id'];

  //Validate that it is a Content Entity
  $entityTypeManager = \Drupal::entityTypeManager();
  $instances = $entityTypeManager->getDefinitions();
  if ( !(isset($instances[$entity_type]) && $instances[$entity_type] instanceof ContentEntityType) ) {
    $context['results']['errors'][] = t('Entity type does not exist or it is not a content instance.') . $entity_type;
  }
  else {
    // Generate the YAML file.
    $entity = _content_sync_db_to_entity($entity_type,$entity_bundle,$entity_id);
    // Create the name
    $name = $entity_type . "." . $entity_bundle . "." . $entity['values'][0]['uuid'][0]['value'];
    // Create the file.
    $archiver->addString("$name.yml", Yaml::encode($entity));
    $context['message'] = $name;
    $context['results'][] = $name;
  }
  $context['sandbox']['progress']++;
  if ( $context['sandbox']['progress'] != $context['sandbox']['max'] ) {
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
  }
}

/**
 * Processes the content snapshot batch - when the module is installed
 *
 * @param $files
 *   The batch content to persist.
 * @param array $context
 *   The batch context.
 */
function processContentSyncSnapshot($files, &$context) {
  //Initialize Batch
  if ( empty($context['sandbox']) ) {
    $context['sandbox']['progress'] = 0;
    $context['sandbox']['current_number'] = 0;
    $context['sandbox']['max'] = count($files);
  }
  // Get submitted values
  $entity_type = $files[$context['sandbox']['progress']]['entity_type'];
  $entity_bundle = $files[$context['sandbox']['progress']]['entity_bundle'];
  $entity_id = $files[$context['sandbox']['progress']]['entity_id'];

  //Validate that it is a Content Entity
  $entityTypeManager = \Drupal::entityTypeManager();
  $instances = $entityTypeManager->getDefinitions();
  if ( !(isset($instances[$entity_type]) && $instances[$entity_type] instanceof ContentEntityType) ) {
    $context['results']['errors'][] = t('Entity type does not exist or it is not a content instance.') . $entity_type;
  }
  else {
    // Store the data for diff
    $entity = $entityTypeManager->getStorage($entity_type)
      ->load($entity_id);
    // Generate the YAML file.
    $serializer_context = [];
    $exported_entity = \Drupal::service('content_sync.exporter')->exportEntity($entity, $serializer_context);
    // Create the name
    $name = $entity_type . "." . $entity->bundle() . "." . $entity->uuid();

    // Insert Data
    $activeStorage = new Drupal\Core\Config\DatabaseStorage(\Drupal::database(), 'cs_db_snapshot');
    $activeStorage->write($name, Yaml::decode($exported_entity));
    $context['message'] = $name;
    $context['results'][] = $name;
  }
  $context['sandbox']['progress']++;
  if ( $context['sandbox']['progress'] != $context['sandbox']['max'] ) {
    $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
  }
}

/**
 * Finish batch.
 *
 * Provide information about the Content Batch results.
 */
function finishContentExportBatch($success, $results, $operations) {
  if ( $success ) {
    $errors = $results['errors'];
    unset($results['errors']);
    $results = array_unique($results);
    // Log all the items processed
    foreach ($results as $key => $result) {
      if($key != 'errors') {
        //drupal_set_message(t('Processed UUID @title.', array('@title' => $result)));
        \Drupal::logger('content_sync')
          ->info('Processed UUID @title.', [
            '@title' => $result,
            'link' => 'Export'
          ]);
      }
    }
    if ( !empty($errors) ) {
      // Log the errors
      $errors = array_unique($errors);
      foreach ($errors as $error) {
        //drupal_set_message($error, 'error');
        \Drupal::logger('content_sync')->error($error);
      }
      // Log the note that the content was exported with errors.
      drupal_set_message(\Drupal::translation()->translate('The content was exported with errors. <a href=":content-overview">Logs</a>',[':content-overview' => \Drupal::url('content.overview')]), 'warning');
      \Drupal::logger('content_sync')->warning('The content was exported with errors.', [ 'link' => 'Export']);
    }
    else {
      // Log the new created export link if applicable.
      drupal_set_message(\Drupal::translation()->translate('The content was exported successfully. <a href=":export-download">Download tar file</a>', [':export-download' => \Drupal::url('content.export_download')]));
      \Drupal::logger('content_sync')->info('The content was exported successfully. <a href=":export-download">Download tar file</a>', [':export-download' => \Drupal::url('content.export_download'), 'link' => 'Export']);
    }
  }
  else {
    // Log that there was an error
    $message = t('Finished with an error.<a href=":content-overview">Logs</a>',[':content-overview' => \Drupal::url('content.overview')]);
    drupal_set_message($message);
    \Drupal::logger('content_sync')->error('Finished with an error.', [ 'link' => 'Export']);
  }
}

/**
 * Convert a content entity from the db to an array
 * EXPORT content.
 *
 * @return array $entity
 *
 * @param $entity_type
 *   Content entity type.
 * @param $entity_bundle
 *   Content entity bundle.
 * @param array $entity_id
 *   Content entity id.
 */
function _content_sync_db_to_entity($entity_type,$entity_bundle,$entity_id){
  $entityTypeManager = \Drupal::entityTypeManager();
  $entityFieldManager = \Drupal::service('entity_field.manager');

  // Get Entity Fields.
  $fields = array_filter(
    $entityFieldManager->getFieldDefinitions($entity_type, $entity_bundle), function ($field_definition) {
    return $field_definition;
  }
  );

  // Initialize array of elements to export.
  $entity_elements = [];
  foreach ($fields as $fieldID => $field) {
    $entity_elements[$field->getName()] = $field->getName();
  }

  // Get Entity Properties - to know the id and bundle fields.
  $properties = $entityTypeManager->getDefinitions()[$entity_type]->getKeys();

  // Get data to fill the yaml.
  $entity_data = $entityTypeManager->getStorage($entity_type)->load($entity_id);
  $entity = [];
  $entity['entity_type'] = $entity_type;
  $entity['bundle'] = $entity_bundle;

  // Remove property ID as we are gonna use UUID to avoid conflicts.
  unset($entity_elements[$properties['id']]);
  // Remove bundle as it is defined already
  unset($entity_elements[$properties['bundle']]);
  // Remove vid to avoid conflicts w/versions
  unset($entity_elements['vid']);
  // Filter array
  $entity_elements = array_filter($entity_elements);

  //Get entity values
  foreach ($entity_elements as $elementID => $element) {
    //Include parent UUID if it exist
    if ($element == 'parent') {
      $parent = $entityTypeManager->getStorage($entity_type)->loadParents($entity_id);
      $parent = reset($parent);
      if ( !empty($parent) ) {
        $entity['values'][0][$element] = $parent->uuid();
      }
    }else {
      $entity['values'][0][$element] = $entity_data->get($element)
        ->getValue();
    }
    //Check if it is an entity reference and use UUID instead of target id.
    $element_type = $entity_data->get($element)
      ->getFieldDefinition()
      ->getType();
    if ( $element_type == "entity_reference" ||
      $element_type == "image" ||
      $element_type == "file"
    ) {
      if ( $entity_data->get($element)->entity ) {
        $reference_type = $entity_data->get($element)->entity->getEntityType()
          ->id();
        //Loop all the values
        foreach ($entity_data->get($element)
                   ->getValue() as $er_key => $er_val) {
          $entity['values'][0][$element][$er_key]['target_id'] = $entityTypeManager->getStorage($reference_type)
            ->load($er_val['target_id'])
            ->uuid();
        }
      }
    }
  }

  // Exception to get the path as it can not be retrieved as regular value.
  // Not check for image because gives an error.
  if($entity_type != "file") {
    $internal_path = "/" . $entity_data->toUrl()->getInternalPath();
    // AliasByPath return internal of alias doesn't exist.
    $alias = \Drupal::service('path.alias_manager')->getAliasByPath($internal_path);
    // Only pass the value is Alias exist.
    if($internal_path != $alias){
      $entity['values'][0]['path'] = $alias;
    }
  }

  // Include Translations
  $lang_default = $entity['values'][0]['langcode'][0]['value'];
  foreach ($entity_data->getTranslationLanguages() as $langcode => $language) {
    $c = 0;
    if ( $entity_data->hasTranslation($langcode) ) {
      $entity_data_translation = $entity_data->getTranslation($langcode);
      // Verify that it is not the default langcode.
      if ( $langcode != $lang_default ) {
        foreach ($entity_elements as $elementID => $element) {
          // Only translatable elements for translations
          if ( $fields[$elementID]->isTranslatable() == TRUE ) {
            $entity['values'][0]['translations'][$c][$element] = $entity_data_translation->get($element)
              ->getValue();

            //Check if it is an entity reference and use UUID instead of target id.
            $element_type = $entity_data_translation->get($element)
              ->getFieldDefinition()
              ->getType();
            if ( $element_type == "entity_reference" ||
              $element_type == "image" ||
              $element_type == "file"
            ) {
              if ( $entity_data_translation->get($element)->entity ) {
                $reference_type = $entity_data_translation->get($element)->entity->getEntityType()
                  ->id();
                //Loop all the values
                foreach ($entity_data_translation->get($element)
                           ->getValue() as $er_key => $er_val) {
                  $entity['values'][0]['translations'][$c][$element][$er_key]['target_id'] = $entityTypeManager->getStorage($reference_type)
                    ->load($er_val['target_id'])
                    ->uuid();
                }
              }
            }

          }
        }
        //$entity['translations'][$c]['path'] = $entity_data_translation->toUrl()->getInternalPath();
        //$c++;
      }
    }
  }
  return $entity;
}

/**
 * Generate UUID YAML file
 * To use for site UUID validation.
 *
 * @param $data
 *   The batch content to persist.
 * @param array $context
 *   The batch context.
 */
function generateSiteUUIDFile($data, &$context) {
  //Initialize ArchiverTar
  $archiver = new ArchiveTar(file_directory_temp() . '/content.tar.gz', 'gz');

  //Include Site UUID to YML file
  $site_config = \Drupal::config('system.site');
  $site_uuid_source = $site_config->get('uuid');
  $entity['site_uuid'] = $site_uuid_source;

  // Set the name
  $name = "site.uuid";
  // Create the file.
  $archiver->addString("$name.yml", Yaml::encode($entity));

  //Save to cs_db_snapshot if being called from installer.
  if ($data == 'snapshot'){
    // Insert Data
    $activeStorage = new Drupal\Core\Config\DatabaseStorage(\Drupal::database(), 'cs_db_snapshot');
    $activeStorage->write($name, $entity);
  }

  $context['message'] = $name;
  $context['results'][] = $name;
  $context['finished'] = 1;
}
