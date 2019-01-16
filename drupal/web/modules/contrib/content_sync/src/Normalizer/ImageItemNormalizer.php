<?php

namespace Drupal\content_sync\Normalizer;


use Drupal\image\Plugin\Field\FieldType\ImageItem;
use Drupal\serialization\Normalizer\EntityReferenceFieldItemNormalizer;

class ImageItemNormalizer extends EntityReferenceFieldItemNormalizer {

  /**
   * The interface or class that this Normalizer supports.
   *
   * @var string
   */
  protected $supportedInterfaceOrClass = ImageItem::class;

  /**
   * {@inheritdoc}
   */
  protected function constructValue($data, $context) {
    $denormalized_data =  parent::constructValue($data, $context);
    foreach (['alt', 'title'] as $field) {
      if(!empty($data[$field])) {
        $denormalized_data[$field] = $data[$field];
      }
    }
    return $denormalized_data;
  }

}