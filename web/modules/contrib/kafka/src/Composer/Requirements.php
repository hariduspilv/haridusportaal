<?php

namespace Drupal\kafka\Composer;

use Composer\Script\Event;

/**
 * Class Requirements is a Composer script checker for PHP/extension versions.
 *
 * Note that it only works if composer install/update is invoked directly, not
 * as a dependency. But you may also use this from the script in the main
 * project composer.json if you add an appropriate autoload clause.
 */
class Requirements {
  const EXTENSION = 'rdkafka';
  const MIN_PHP = '5.6.27';
  const VERSIONS = [
    5 => '1.0.0',
    7 => '2.0.0',
  ];

  /**
   * Script callback for pre-install / pre-update.
   *
   * @param \Composer\Script\Event $event
   *   The Composer event triggering this call. Not used.
   */
  public static function validate(Event $event) {
    // Probably redundant with the composer.json php requirement.
    if (version_compare(PHP_VERSION, self::MIN_PHP) < 0) {
      throw new \RuntimeException(strtr("PHP needs to be at version @version or later.", [
        '@version' => self::MIN_PHP,
      ]));
    }

    if (!extension_loaded(self::EXTENSION)) {
      throw new \RuntimeException(strtr("PHP @ext needs to be loaded.", [
        '@ext' => self::EXTENSION,
      ]));
    }

    $re = new \ReflectionExtension(self::EXTENSION);
    $ev = $re->getVersion();
    $expected = self::VERSIONS[PHP_MAJOR_VERSION];
    if (version_compare($ev, $expected) < 0) {
      throw new \RuntimeException(strtr("PHP @ext extension needs to be @expected minimum, got @ver.", [
        '@ext' => self::EXTENSION,
        '@expected' => $expected,
        '@ver' => $ev,
      ]));
    }
  }

}
