<?php

namespace Drupal\purge\Counter;

/**
 * Describes a counter with the ability to return user-friendly explanations.
 */
interface ExplainedCounterInterface extends CounterInterface {

  /**
   * Gets a short machine readable ID.
   *
   * @return string
   *   The machine readable ID.
   */
  public function getId();

  /**
   * Gets the title of the counter.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup
   *   The translated title.
   */
  public function getTitle();

  /**
   * Gets the description of the counter.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup
   *   The translated description.
   */
  public function getDescription();

}
