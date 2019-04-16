<?php

$nids = \Drupal::entityQuery('node')
    ->condition('type', 'event')
    ->condition('field_entry_type', 'juhan')
    ->execute();

foreach($nids as $nid){
    $entity = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
    $entity->delete();
}