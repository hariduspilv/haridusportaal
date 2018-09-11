<?php

namespace Drupal\purge_queuer_url\Plugin\Purge\Queuer;

use Drupal\purge\Plugin\Purge\Queuer\QueuerInterface;
use Drupal\purge\Plugin\Purge\Queuer\QueuerBase;

/**
 * Queues URLs or paths to your Purge queue utilizing a traffic database.
 *
 * @PurgeQueuer(
 *   id = "urlpath",
 *   label = @Translation("URLs queuer"),
 *   description = @Translation("Queues URLs or paths to your Purge queue utilizing a traffic database."),
 *   enable_by_default = true,
 *   configform = "\Drupal\purge_queuer_url\Form\ConfigurationForm",
 * )
 */
class UrlAndPathQueuerPlugin extends QueuerBase implements QueuerInterface {}
