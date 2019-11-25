<?php

namespace Drupal\purge_drush\Plugin\Purge\Queuer;

use Drupal\purge\Plugin\Purge\Queuer\QueuerBase;
use Drupal\purge\Plugin\Purge\Queuer\QueuerInterface;

/**
 * Queuer for the 'drush p:queue-add' command.
 *
 * @PurgeQueuer(
 *   id = "drush_purge_queue_add",
 *   label = @Translation("Drush p:queue-add"),
 *   description = @Translation("Queuer for the 'drush p:queue-add' command."),
 *   enable_by_default = true,
 *   configform = "",
 * )
 */
class DrushQueueAddQueuer extends QueuerBase implements QueuerInterface {

}
