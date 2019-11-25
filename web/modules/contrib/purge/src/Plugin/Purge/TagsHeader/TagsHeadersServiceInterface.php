<?php

namespace Drupal\purge\Plugin\Purge\TagsHeader;

use Drupal\purge\ServiceInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Describes a service that provides access to available tags headers.
 */
interface TagsHeadersServiceInterface extends ServiceInterface, ContainerAwareInterface, \Countable, \Iterator {}
