<?php

namespace Drupal\purge_drush\Commands;

use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\InvalidExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\MissingExpressionException;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvStatesInterface;
use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;
use Drupal\purge\Plugin\Purge\Purger\Exception\CapacityException;
use Drupal\purge\Plugin\Purge\Purger\Exception\DiagnosticsException;
use Drupal\purge\Plugin\Purge\Purger\Exception\LockException;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;
use Drush\Commands\DrushCommands;
use Drush\Exceptions\UserAbortException;

/**
 * Directly invalidate an item without going through the queue.
 */
class InvalidateCommand extends DrushCommands {

  /**
   * The 'purge.processors' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface
   */
  protected $purgeProcessors;

  /**
   * The 'purge.purgers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface
   */
  protected $purgePurgers;

  /**
   * The 'purge.invalidation.factory' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * Construct a Invalidatecommand object.
   *
   * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface $purge_invalidation_factory
   *   The purge invalidation factory service.
   * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purge_processors
   *   The purge processors service.
   * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purge_purgers
   *   The purge purgers service.
   */
  public function __construct(InvalidationsServiceInterface $purge_invalidation_factory, ProcessorsServiceInterface $purge_processors, PurgersServiceInterface $purge_purgers) {
    parent::__construct();
    $this->purgeInvalidationFactory = $purge_invalidation_factory;
    $this->purgeProcessors = $purge_processors;
    $this->purgePurgers = $purge_purgers;
  }

  /**
   * Directly invalidate an item without going through the queue.
   *
   * @param string $type
   *   The type of invalidation to perform, e.g.: tag, path, url.
   * @param string|null $expression
   *   The string expression of what needs to be invalidated.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:invalidate tag node:1
   *   Clears URLs tagged with "node:1" from external caching platforms.
   * @usage drush p:invalidate url http://www.drupal.org/
   *   Clears "http://www.drupal.org/" from external caching platforms.
   * @usage drush p:invalidate everything
   *   Clears everything on external caching platforms.
   *
   * @command p:invalidate
   * @aliases pinv,p-invalidate
   */
  public function invalidate($type, $expression = NULL, array $options = ['format' => 'string']) {

    // Retrieve our queuer object and fail when it is not returned.
    if (!($processor = $this->purgeProcessors->get('drush_purge_invalidate'))) {
      throw new \Exception(dt("Please add the required processor:\ndrush p:processor-add drush_purge_invalidate"));
    }

    // Instantiate the invalidation object based on user input.
    try {
      $invalidations = [$this->purgeInvalidationFactory->get($type, $expression)];
    }
    catch (PluginNotFoundException $e) {
      throw new \Exception(dt("Type '@type' does not exist, see 'drush p:types' for available types.", ['@type' => $type]));
    }
    catch (InvalidExpressionException $e) {
      throw new \Exception($e->getMessage());
    }
    catch (TypeUnsupportedException $e) {
      throw new \Exception(dt("There is no purger supporting '@type', please install one!", ['@type' => $type]));
    }
    catch (MissingExpressionException $e) {
      throw new \Exception($e->getMessage());
    }

    // Prevent users from accidentally harming their website.
    if (($options['format'] === 'string') && ($type === 'everything')) {
      $this->io()->caution(dt("Invalidating everything will mass-clear potentially thousands"
        . " of pages, which could temporarily make your site really slow as"
        . " external caches will have to warm up again.\n"));
      if (!$this->io()->confirm(dt("Are you really sure?"))) {
        throw new UserAbortException();
      }
    }

    // Attempt the cache invalidation and deal with errors.
    try {
      $this->purgePurgers->invalidate($processor, $invalidations);
    }
    catch (DiagnosticsException $e) {
      throw new \Exception($e->getMessage());
    }
    catch (CapacityException $e) {
      throw new \Exception($e->getMessage());
    }
    catch (LockException $e) {
      throw new \Exception($e->getMessage());
    }

    // Since this command is more meant for testing, we only regard SUCCEEDED as
    // a acceptable return state to call success on.
    if ($invalidations[0]->getState() === InvStatesInterface::SUCCEEDED) {
      if ($options['format'] === 'string') {
        $this->io()->success(dt('Item invalidated successfully!'));
      }
    }
    else {
      throw new \Exception(
        dt('Invalidation failed, return state is: @state.', [
          '@state' => $invalidations[0]->getStateString(),
        ])
      );
    }
  }

  /**
   * Invalidate 'everything' using the Purge framework.
   *
   * @command cache:rebuild-external
   * @aliases cre,cache-rebuild-external
   */
  public function rebuildExternal(array $options = ['format' => 'string']) {
    return $this->invalidate('everything', NULL, $options);
  }

}
