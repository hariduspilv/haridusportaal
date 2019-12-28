<?php

namespace Drupal\svg_image_field\Plugin\media\Source;

use Drupal\media\MediaTypeInterface;
use Drupal\media\Plugin\media\Source\File;

/**
 * Provides media type plugin for SVG image field.
 *
 * @MediaSource(
 *   id = "svg",
 *   label = @Translation("SVG"),
 *   description = @Translation("Provides business logic and metadata for SVG files."),
 *   allowed_field_types = {"svg_image_field"},
 *   default_thumbnail_filename = "generic.png",
 * )
 */
class SVG extends File {

  /**
   * {@inheritdoc}
   */
  public function createSourceField(MediaTypeInterface $type) {
    return parent::createSourceField($type)->set('settings', ['file_extensions' => 'svg']);
  }

}
