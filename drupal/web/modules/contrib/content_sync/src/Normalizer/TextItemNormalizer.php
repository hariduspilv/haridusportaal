<?php

namespace Drupal\content_sync\Normalizer;

use Drupal\serialization\Normalizer\NormalizerBase;

/**
 * Converts TextItem fields to an array including computed values.
 */
class TextItemNormalizer extends NormalizerBase {

  /**
   * The interface or class that this Normalizer supports.
   *
   * @var string
   */
  protected $supportedInterfaceOrClass = 'Drupal\text\Plugin\Field\FieldType\TextItemBase';

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = []) {
    $attributes = [];
    foreach ($object->getProperties(TRUE) as $name => $field) {
      $value = $this->serializer->normalize($field, $format, $context);
      if (is_object($value)) {
        $value = $this->serializer->normalize($value, $format, $context);
      }
      $attributes[$name] = $value;
    }
    return $attributes;
  }

}
