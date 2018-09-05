<?php

namespace Drupal\purge\Counter;

use Drupal\purge\Counter\CounterInterface;

/**
 * Describes a counter with the ability to return user-friendly explanations.
 */
interface ExplainedCounterInterface extends CounterInterface {

  /**
   * Gets a short machine readable ID.
   *
   * @return string
   */
  public function getId();

  /**
   * Gets the title of the counter.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup
   */
  public function getTitle();

  /**
   * Gets the description of the counter.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup
   */
  public function getDescription();

}
