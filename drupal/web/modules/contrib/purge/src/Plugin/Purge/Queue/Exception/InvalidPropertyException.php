<?php

namespace Drupal\purge\Plugin\Purge\Queue\Exception;

/**
 * Invalid property.
 *
 * Thrown by \Drupal\purge\Plugin\Purge\Queue\ProxyItemInterface::__get() when
 * a property is called that doesn't exists, e.g.: $proxyitem->invalidprop.
 */
class InvalidPropertyException extends \Exception {}
