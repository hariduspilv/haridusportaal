<?php

namespace Drupal\content_sync\DependencyResolver;


interface ContentSyncResolverInterface {

  public function resolve(array $normalized_entities);
}