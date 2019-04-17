<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Form\FormStateInterface;

/**
 * Base formatter trait for computed fields.
 *
 * This trait provides the "cache" formatter (Cache lifetime, Units)
 *
 * @class FormatterBase;
 */
trait ComputedCacheFormatterTrait {

  /**
   * List of time options and their factor in seconds to calculate cache seconds
   * @param $mode string 'singular' or 'plural'
   * @return array
   */
  private static function unitOptions($mode) {
    switch ($mode) {

      case 'plural':
        return [
          -1 => t('default'),
          0 => t('off'),
          1 => t('seconds'),
          60 => t('minutes'),
          3600 => t('hours'),
          84400 => t('days'),
        ];
        break;

      case 'singular':
        return [
          1 => t('second'),
          60 => t('minute'),
          3600 => t('hour'),
          84400 => t('day'),
        ];
        break;

      default:
        return [];
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'cache_unit' => -1,
      'cache_duration' => 1,
    ] + parent::defaultSettings();
  }


  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [
      'cache_unit' => [
        '#title' => t('Cache'),
        '#type' => 'select',
        '#default_value' => $this->getSetting('cache_unit'),
        '#options' => $this->unitOptions('plural'),
        '#description' => t('Here you can change the caching of the formatted value: "default" means until it is saved again, "off" no caching, others are units to cache the value according to the duration entered below. If you select a value different from "default", the formatted value will be recomputed as necessary, <b>but he saved value will not be changed</b>, so the displayed value may be different from the saved value!</br><b>You should not change the default unless the computed value consists of volatile components like current time/date/user!</b>'),
        '#weight' => 99,
      ],
      'cache_duration' => [
        '#title' => t('Cache duration'),
        '#type' => 'number',
        '#min' => 1,
        '#default_value' => $this->getSetting('cache_duration'),
        '#description' => t('This value is valid only when you select a unit above'),
        '#weight' => 99,
      ],
    ] + parent::settingsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $cache_duration = (int)$this->getSetting('cache_duration');
    $cache_unit = $this->getSetting('cache_unit');
    $mode = ($cache_duration == 1) ? 'singular' : 'plural';

    $summary = parent::settingsSummary();
    if ($cache_unit < 0) {
      $summary[] = t('Cache: default');
    }
    elseif ($cache_unit == 0) { // off
      $summary[] = t('Cache: <b>off</b>');
    }
    elseif ($cache_unit == 1) { // seconds
      $summary[] = t('Cache: @duration @unit',
        $args = [
          '@duration' => $cache_duration,
          '@unit' => $this->unitOptions($mode)[$cache_unit],
        ]
      );
    }
    else {
      $summary[] = t('Cache: @duration @unit (@seconds seconds)',
        $args = [
          '@duration' => $cache_duration,
          '@unit' => $this->unitOptions($mode)[$cache_unit],
          '@seconds' => $cache_duration * $cache_unit,
        ]
      );
    }

    return $summary;
  }

}