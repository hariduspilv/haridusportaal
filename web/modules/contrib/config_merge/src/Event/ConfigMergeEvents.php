<?php

namespace Drupal\config_merge\Event;

/**
 * Class ConfigMergeEvents
 *
 * @package Drupal\config_merge\Event
 */
class ConfigMergeEvents {

  /**
   * Event after successful 3-way merge of the configuration objects.
   */
  const POST_MERGE = 'config_merge.post_merge';

}
