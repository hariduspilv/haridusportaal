<?php

namespace Drupal\Tests\duration_field\Unit\Service;

use Drupal\Tests\UnitTestCase;
use Drupal\duration_field\Service\DurationService;

/**
 * @coversDefaultClass \Drupal\duration_field\Service\DurationService
 * @group duration_field
 */
class DurationServiceTest extends UnitTestCase {

  /**
   * @covers ::checkDurationInvalid
   * @dataProvider checkDurationInvalidDataProvider
   */
  public function testCheckDurationInvalid($pattern, $expectedResponse, $message) {
    $duration_service = new DurationService();
    $duration_service->setStringTranslation($this->getStringTranslationStub());
    $response = $duration_service->checkDurationInvalid($pattern);
    $this->assertTrue((bool) $response == $expectedResponse, $message);
  }

  /**
   * Data provider for testCheckDurationInvalid.
   */
  public function checkDurationInvalidDataProvider() {
    return [
      ['PY1D', TRUE, 'PY1D correctly tested as invalid'],
      ['P1Y2M3DT4H', FALSE, 'P1Y2M3DT4H correctly tested as valid'],
    ];
  }

  /**
   * @covers ::convertValue
   * @dataProvider convertValueDataProvider
   */
  public function testConvertValue($input, $expectedResponse, $message) {
    $response = DurationService::convertValue($input);
    $this->assertSame($response, $expectedResponse, $message);
  }

  /**
   * Data provider for testConvertValue.
   */
  public function convertValueDataProvider() {
    return [
      [
        [
          'year' => 1,
          'month' => 2,
          'day' => 3,
          'hour' => 4,
          'minute' => 5,
          'second' => 6,
        ],
        'P1Y2M3DT4H5M6S',
        'P1Y2M3DT4H5M6S was correctly validated',
      ],
      [
        [
          'year' => 1,
          'month' => 2,
          'day' => 3,
        ],
        'P1Y2M3D', '
        P1Y2M3D was correctly validated',
      ],
      [
        [
          'hour' => 4,
          'minute' => 5,
          'second' => 6,
        ],
        'PT4H5M6S',
        'PT4H5M6S was correctly validated',
      ],
      [['year' => 1, 'hour' => 4], 'P1YT4H', 'P1YT4H was correctly validated'],
      [[], '', 'empty string was correctly validated'],
    ];
  }

}
