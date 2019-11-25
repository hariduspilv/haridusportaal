<?php

namespace Drupal\Tests\purge_queuer_coretags\Unit;

use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface;
use Drupal\purge\Plugin\Purge\Queuer\QueuerBase;
use Drupal\purge\Plugin\Purge\Queuers\QueuersServiceInterface;
use Drupal\purge_queuer_coretags\CacheTagsQueuer;
use Drupal\Tests\UnitTestCase;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * @coversDefaultClass \Drupal\purge_queuer_coretags\CacheTagsQueuer
 * @group purge_queuer_coretags
 */
class CacheTagsQueuerTest extends UnitTestCase {

  /**
   * The tested cache tags queuer.
   *
   * @var \Drupal\purge_queuer_coretags\CacheTagsQueuer
   */
  protected $cacheTagsQueuer;

  /**
   * The mocked config factory.
   *
   * @var \PHPUnit_Framework_MockObject_MockObject|\Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The container.
   *
   * @var \Symfony\Component\DependencyInjection\ContainerInterface
   */
  protected $container;

  /**
   * The mocked queue service.
   *
   * @var \PHPUnit_Framework_MockObject_MockObject|\Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface
   */
  protected $purgeQueue;

  /**
   * The mocked queuers service.
   *
   * @var \PHPUnit_Framework_MockObject_MockObject|\Drupal\purge\Plugin\Purge\Queuers\QueuersServiceInterface
   */
  protected $purgeQueuers;

  /**
   * The mocked invalidations factory.
   *
   * @var \PHPUnit_Framework_MockObject_MockObject|\Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    $this->purgeQueue = $this->getMockBuilder(QueueServiceInterface::class)->setMethods([])->getMock();
    $this->purgeQueuers = $this->getMockBuilder(QueuersServiceInterface::class)->setMethods(['get'])->getMock();
    $this->purgeInvalidationFactory = $this->getMockForAbstractClass(InvalidationsServiceInterface::class);

    // Create a container with all dependent services in it.
    $this->container = new ContainerBuilder();
    $this->container->set('purge.queue', $this->purgeQueue);
    $this->container->set('purge.queuers', $this->purgeQueuers);
    $this->container->set('purge.invalidation.factory', $this->purgeInvalidationFactory);

    // Initialize the CacheTagsQueuer object and set the container.
    $this->cacheTagsQueuer = new CacheTagsQueuer();
    $this->cacheTagsQueuer->setContainer($this->container);
    $this->assertInstanceOf(ContainerAwareInterface::class, $this->cacheTagsQueuer);
    $this->assertInstanceOf(CacheTagsInvalidatorInterface::class, $this->cacheTagsQueuer);
  }

  /**
   * @covers ::initialize
   */
  public function testInitializeDoesntLoadWhenQueuerDisabled() {
    $this->purgeInvalidationFactory->expects($this->never())->method('get');
    $this->purgeQueue->expects($this->never())->method('add');
    $this->purgeQueuers
      ->expects($this->once())
      ->method('get')
      ->with('coretags')
      ->willReturn(FALSE);
    $this->assertNull($this->cacheTagsQueuer->invalidateTags(["1", "2"]));
  }

  /**
   * @covers ::invalidateTags
   *
   * @dataProvider providerTestInvalidateTags()
   */
  public function testInvalidateTags($config, array $sets) {
    $this->container->set('config.factory', $this->getConfigFactoryStub($config));
    // Assert that the queuer plugin is loaded exactly once.
    $this->purgeQueuers
      ->expects($this->once())
      ->method('get')
      ->with('coretags')
      ->willReturn($this->getMockBuilder(QueuerBase::class)->disableOriginalConstructor()->getMock()
    );
    // Assert how InvalidationsServiceInterface::get() is called.
    $invs_added_total = array_sum(array_map(
      function ($set) {
        return $set[1];
      },
      $sets
    ));
    $this->purgeInvalidationFactory
      ->expects($this->exactly($invs_added_total))
      ->method('get')
      ->with('tag')
      ->willReturn($this->getMock(InvalidationInterface::class)
    );
    // Assert the precise calls to QueueServiceInterface::add().
    $number_queue_add_calls = count(array_filter($sets, function ($set) {
      return $set[1] !== 0;
    }));
    reset($sets);
    $this->purgeQueue
      ->expects($this->exactly($number_queue_add_calls))
      ->method('add')
      ->with(
        $this->callback(
          function ($queuer) {
            return $queuer instanceof QueuerBase;
          }
        ),
        $this->callback(
          function (array $invs) use (&$sets) {
            $invs_added = current($sets)[1];
            // Sets with 0 shouldn't call ::add() at all, so skip over them.
            if ($invs_added === 0) {
              next($sets);
              $invs_added = current($sets)[1];
            }
            next($sets);
            return is_array($invs) && (count($invs) === $invs_added);
          }
        )
      );
    // Trigger the entire chain by feeding the sets of tags.
    foreach ($sets as $set) {
      $this->cacheTagsQueuer->invalidateTags($set[0]);
    }
  }

  /**
   * Provides test data for testInvalidateTags().
   */
  public function providerTestInvalidateTags() {
    $blacklist = [
      'purge_queuer_coretags.settings' => [
        'blacklist' => [
          'menu',
          'node',
        ],
      ],
    ];
    return [
      // Two calls to ::invalidateTags(), 'node:5' should get blacklisted.
      [
        $blacklist,
        [
          [['block:1'], 1],
          [['node:5'], 0],
          [['extension:views', 'baz'], 2],
        ],
      ],
      // One call to ::invalidateTags(), with 1 and 3 tags respectively.
      [
        $blacklist,
        [
          [['menu:main'], 0],
          [['NODE:5', 'foo', 'bar', 'bar'], 3],
        ],
      ],
      // One call to ::invalidateTags() with 4 tags.
      [
        ['purge_queuer_coretags.settings' => ['blacklist' => []]],
        [
          [['node:5', 'foo:2', 'foo:3', 'bar:baz'], 4],
        ],
      ],
      // Five calls to ::invalidateTags() with varying number of tags.
      [
        ['purge_queuer_coretags.settings' => ['blacklist' => []]],
        [
          [['a', 'b'], 2],
          [['c', 'd'], 2],
          [['e', 'f'], 2],
          [['g', 'h', 'i'], 3],
          [['j'], 1],
        ],
      ],
    ];
  }

}
