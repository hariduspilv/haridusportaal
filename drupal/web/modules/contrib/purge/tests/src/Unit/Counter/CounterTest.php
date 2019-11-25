<?php

namespace Drupal\Tests\purge\Unit\Counter;

use Drupal\purge\Counter\Counter;
use Drupal\purge\Plugin\Purge\Purger\Exception\BadBehaviorException;
use Drupal\Tests\UnitTestCase;

/**
 * @coversDefaultClass \Drupal\purge\Counter\Counter
 * @group purge
 */
class CounterTest extends UnitTestCase {

  /**
   * @covers ::disableDecrement
   */
  public function testDisableDecrement() {
    $counter = new Counter();
    $counter->disableDecrement();
    $this->expectException(\LogicException::class);
    $this->expectExceptionMessage('No ::decrement() permission on this object.');
    $counter->decrement();
  }

  /**
   * @covers ::disableIncrement
   */
  public function testDisableIncrement() {
    $counter = new Counter();
    $counter->disableIncrement();
    $this->expectException(\LogicException::class);
    $this->expectExceptionMessage('No ::increment() permission on this object.');
    $counter->increment();
  }

  /**
   * @covers ::disableSet
   */
  public function testDisableSet() {
    $counter = new Counter();
    $counter->disableSet();
    $this->expectException(\LogicException::class);
    $this->expectExceptionMessage('No ::set() permission on this object.');
    $counter->set(5);
  }

  /**
   * @covers ::get
   *
   * @dataProvider providerTestGet()
   */
  public function testGet($value) {
    $counter = new Counter($value);
    $this->assertEquals($value, $counter->get());
    $this->assertTrue(is_float($counter->get()));
    $this->assertFalse(is_int($counter->get()));
  }

  /**
   * Provides test data for testGet().
   */
  public function providerTestGet() {
    return [
      [0],
      [5],
      [1.3],
      [8.9],
    ];
  }

  /**
   * @covers ::getInteger
   *
   * @dataProvider providerTestGetInteger()
   */
  public function testGetInteger($value) {
    $counter = new Counter($value);
    $this->assertEquals((int) $value, $counter->getInteger());
    $this->assertFalse(is_float($counter->getInteger()));
    $this->assertTrue(is_int($counter->getInteger()));
  }

  /**
   * Provides test data for testGetInteger().
   */
  public function providerTestGetInteger() {
    return [
      [0],
      [5],
      [1.3],
      [8.9],
    ];
  }

  /**
   * @covers ::disableSet
   * @dataProvider providerTestSetNotFloatOrInt()
   */
  public function testSetNotFloatOrInt($value) {
    $counter = new Counter();
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $value is not a integer or float.');
    $counter->set($value);
  }

  /**
   * Provides test data for testSetNotFloatOrInt().
   */
  public function providerTestSetNotFloatOrInt() {
    return [
      [FALSE],
      ["0"],
      [NULL],
    ];
  }

  /**
   * @covers ::disableSet
   */
  public function testSetNegative() {
    $counter = new Counter();
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $value can only be zero or positive.');
    $counter->set(-0.000001);
  }

  /**
   * @covers ::set
   *
   * @dataProvider providerTestSet()
   */
  public function testSet($value) {
    $counter = new Counter();
    $counter->set($value);
    $this->assertEquals($value, $counter->get());
  }

  /**
   * Provides test data for testSet().
   */
  public function providerTestSet() {
    return [
      [0],
      [5],
      [1.3],
      [8.9],
    ];
  }

  /**
   * @covers ::decrement
   *
   * @dataProvider providerTestDecrement()
   */
  public function testDecrement($start, $subtract, $result) {
    $counter = new Counter($start);
    $counter->decrement($subtract);
    $this->assertEquals($result, $counter->get());
  }

  /**
   * Provides test data for testDecrement().
   */
  public function providerTestDecrement() {
    return [
      [4.0, 0.2, 3.8],
      [2, 1, 1],
      [1, 1, 0],
    ];
  }

  /**
   * @covers ::decrement
   * @dataProvider providerTestDecrementInvalidValue()
   */
  public function testDecrementInvalidValue($value) {
    $counter = new Counter(10);
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $amount is zero or negative.');
    $counter->decrement($value);
  }

  /**
   * Provides test data for testDecrementInvalidValue().
   */
  public function providerTestDecrementInvalidValue() {
    return [
      [0],
      [0.0],
      [-1],
    ];
  }

  /**
   * @covers ::decrement
   * @dataProvider providerTestDecrementNotFloatOrInt()
   */
  public function testDecrementNotFloatOrInt($value) {
    $counter = new Counter(10);
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $amount is not a integer or float.');
    $counter->decrement($value);
  }

  /**
   * Provides test data for testDecrementNotFloatOrInt().
   */
  public function providerTestDecrementNotFloatOrInt() {
    return [
      [FALSE],
      ["0"],
      [NULL],
    ];
  }

  /**
   * @covers ::increment
   *
   * @dataProvider providerTestIncrement()
   */
  public function testIncrement($start, $add, $result) {
    $counter = new Counter($start);
    $counter->increment($add);
    $this->assertEquals($result, $counter->get());
  }

  /**
   * Provides test data for testIncrement().
   */
  public function providerTestIncrement() {
    return [
      [4.0, 0.2, 4.2],
      [0.1, 1, 1.1],
      [2, 1, 3],
    ];
  }

  /**
   * @covers ::increment
   * @dataProvider providerTestIncrementInvalidValue()
   */
  public function testIncrementInvalidValue($value) {
    $counter = new Counter(10);
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $amount is zero or negative.');
    $counter->increment($value);
  }

  /**
   * Provides test data for testIncrementInvalidValue().
   */
  public function providerTestIncrementInvalidValue() {
    return [
      [0],
      [0.0],
      [-1],
    ];
  }

  /**
   * @covers ::increment
   * @dataProvider providerTestIncrementNotFloatOrInt()
   */
  public function testIncrementNotFloatOrInt($value) {
    $counter = new Counter(10);
    $this->expectException(BadBehaviorException::class);
    $this->expectExceptionMessage('Given $amount is not a integer or float.');
    $counter->increment($value);
  }

  /**
   * Provides test data for testIncrementNotFloatOrInt().
   */
  public function providerTestIncrementNotFloatOrInt() {
    return [
      [FALSE],
      ["0"],
      [NULL],
    ];
  }

  /**
   * @covers ::setWriteCallback
   *
   * @dataProvider providerTestSetWriteCallback()
   */
  public function testSetWriteCallback($value_start, $call, $value_end) {
    $counter = new Counter($value_start);

    // Pass a callback that modifies the local $passed_value.
    $passed_value = NULL;
    $callback = function ($_value) use (&$passed_value) {
      $passed_value = $_value;
    };
    $counter->setWriteCallback($callback);

    // Call the requested callback and verify that the results match.
    $method = array_shift($call);
    call_user_func_array([$counter, $method], $call);
    $this->assertEquals($passed_value, $value_end);
  }

  /**
   * Provides test data for testSetWriteCallback().
   */
  public function providerTestSetWriteCallback() {
    return [
      [0, ['set', 5], 5],
      [1.8, ['increment', 2.3], 4.1],
      [1.6, ['decrement', 0.3], 1.3],
    ];
  }

}
