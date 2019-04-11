<?php

namespace Drupal\content_sync\DependencyResolver;


use Drupal\Component\Graph\Graph;

class ImportQueueResolver implements ContentSyncResolverInterface {

  public function resolve(array $normalized_entities) {
    $queue = [];
    $graph = [];
    $uuids = [];
    foreach ($normalized_entities as $identifier => $entity) {
      $ids = explode('.', $identifier);
      list($entity_type_id, $bundle, $uuid) = $ids;
      if (!empty($entity['_content_sync']['entity_dependencies'])) {
        foreach ($entity['_content_sync']['entity_dependencies'] as $ref_entity_type_id => $references) {
          foreach ($references as $reference) {
            if (!empty($normalized_entities[$reference])) {
              $graph[$identifier]['edges'][$reference] = 1;
            }
          }
        }
      }
      else {
        $uuids[] = $identifier;
        $queue[] = [
          'entity_type_id' => $entity_type_id,
          'decoded_entity' => $entity,
        ];
      }

    }
    $graph = new Graph($graph);
    $entities = $graph->searchAndSort();
    uasort($entities, 'Drupal\Component\Utility\SortArray::sortByWeightElement');
    foreach ($entities as $uuid => $vertex) {
      foreach ($vertex['edges'] as $key => $value) {
        if (!in_array($key, $uuids) && $uuid != $key) {
          $uuids[] = $key;
          $ids = explode('.', $key);
          $queue[] = [
            'entity_type_id' => $ids[0],
            'decoded_entity' => $normalized_entities[$key],
          ];
        }
      }
      $uuids[] = $uuid;
      $ids = explode('.', $uuid);
      $queue[] = [
        'entity_type_id' => $ids[0],
        'decoded_entity' => $normalized_entities[$uuid],
      ];
    }
    return $queue;
  }

}