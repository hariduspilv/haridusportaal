<?php

namespace Drupal\purge\Plugin\Purge\Invalidation;

use Drupal\Core\Plugin\PluginBase;

/**
 * Provides base implementations the immutable invalidation object.
 *
 * Immutable invalidations are not used in real-life cache invalidation, as
 * \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface doesn't accept
 * them. However, as they are read-only, they are used by user interfaces to
 * see what is in the queue without actually claiming or changing it.
 */
abstract class ImmutableInvalidationBase extends PluginBase implements ImmutableInvalidationInterface {

  /**
   * Unique runtime ID for this instance.
   *
   * @var int
   */
  protected $id;

  /**
   * The instance ID of the purger that is about to process this object.
   *
   * @var string|null
   */
  protected $context = NULL;

  /**
   * Mixed expression (or NULL) that describes what needs to be invalidated.
   *
   * @var mixed|null
   */
  protected $expression = NULL;

  /**
   * Purger metadata.
   *
   * This property is a associative array, each purger has its own key. Values
   * are also associated arrays, in which metadata is stored key-value.
   *
   * @var array[]
   */
  protected $properties = [];

  /**
   * Invalidation states per purger.
   *
   * Associative list of which the keys refer to purger instances and the values
   * are \Drupal\purge\Plugin\Purge\Invalidation\InvStatesInterface constants.
   *
   * @var int[]
   */
  protected $states = [];

  /**
   * Valid post-processing states.
   *
   * When a purger is done processing, it can't leave objects as FRESH. This
   * list is basically a whitelist that's checked after processing.
   *
   * @var int[]
   */
  protected $statesAfterProcessing = [
    self::NOT_SUPPORTED,
    self::PROCESSING,
    self::SUCCEEDED,
    self::FAILED,
  ];

  /**
   * {@inheritdoc}
   */
  public function __toString() {
    return is_null($this->expression) ? '' : $this->expression;
  }

  /**
   * {@inheritdoc}
   */
  public function getExpression() {
    return $this->expression;
  }

  /**
   * {@inheritdoc}
   */
  public function getProperties() {
    if (!is_null($this->context)) {
      throw new \LogicException('Cannot retrieve properties in purger context.');
    }
    return $this->properties;
  }

  /**
   * {@inheritdoc}
   */
  public function getProperty($key) {
    if (is_null($this->context)) {
      throw new \LogicException('Call ::setStateContext() before retrieving properties!');
    }
    if (isset($this->properties[$this->context][$key])) {
      return $this->properties[$this->context][$key];
    }
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getState() {

    // Regardless of the context, when there are no states stored we're FRESH.
    if (empty($this->states)) {
      return self::FRESH;
    }

    // In general context, we need to resolve what the invalidation state is.
    if ($this->context === NULL) {
      $totals = [self::SUCCEEDED => 0, self::NOT_SUPPORTED => 0];
      $total = count($this->states);
      foreach ($this->states as $state) {
        if (isset($totals[$state])) {
          $totals[$state]++;
        }
      }

      // If all purgers failed to support it, its unsupported.
      if ($totals[self::NOT_SUPPORTED] === $total) {
        return self::NOT_SUPPORTED;
      }
      // If all purgers succeeded, it succeeded.
      elseif ($totals[self::SUCCEEDED] === $total) {
        return self::SUCCEEDED;
      }
      // Failure and processing are the only states left we can be in, when any
      // of those are found, that's what the general state will reflect.
      elseif (in_array(self::FAILED, $this->states)) {
        return self::FAILED;
      }
      elseif (in_array(self::PROCESSING, $this->states)) {
        return self::PROCESSING;
      }
      // Catch combination states where one or more purgers added NOT_SUPPORTED
      // but other purgers added states as well.
      elseif (in_array(self::NOT_SUPPORTED, $this->states)) {
        if (in_array(self::FAILED, $this->states)) {
          return self::FAILED;
        }
        elseif (in_array(self::PROCESSING, $this->states)) {
          return self::PROCESSING;
        }
        elseif (in_array(self::SUCCEEDED, $this->states)) {
          return self::SUCCEEDED;
        }
      }
      throw new \LogicException("Invalidation state data integrity violation");
    }

    // When the purger instance ID is known, the state becomes more specific.
    else {
      if (isset($this->states[$this->context])) {
        return $this->states[$this->context];
      }
      return self::FRESH;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getStateString() {
    $mapping = [
      self::FRESH         => 'FRESH',
      self::PROCESSING    => 'PROCESSING',
      self::SUCCEEDED     => 'SUCCEEDED',
      self::FAILED        => 'FAILED',
      self::NOT_SUPPORTED => 'NOT_SUPPORTED',
    ];
    return $mapping[$this->getState()];
  }

  /**
   * {@inheritdoc}
   */
  public function getStateStringTranslated() {
    $mapping = [
      self::FRESH         => $this->t('New'),
      self::PROCESSING    => $this->t('Currently invalidating'),
      self::SUCCEEDED     => $this->t('Succeeded'),
      self::FAILED        => $this->t('Failed'),
      self::NOT_SUPPORTED => $this->t('Not supported'),
    ];
    return $mapping[$this->getState()];
  }

  /**
   * {@inheritdoc}
   */
  public function getStates() {
    return $this->states;
  }

  /**
   * {@inheritdoc}
   */
  public function getStateContexts() {
    if (!is_null($this->context)) {
      throw new \LogicException('Cannot retrieve state contexts in purger context.');
    }
    return array_keys($this->states);
  }

  /**
   * {@inheritdoc}
   */
  public function getType() {
    return $this->getPluginId();
  }

}
