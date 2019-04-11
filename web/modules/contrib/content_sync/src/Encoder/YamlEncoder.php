<?php

namespace Drupal\content_sync\Encoder;

use Drupal\Component\Serialization\Yaml;
use Symfony\Component\Serializer\Encoder\DecoderInterface;
use Symfony\Component\Serializer\Encoder\EncoderInterface;
use Symfony\Component\Serializer\Encoder\scalar;


/**
 * Class YamlEncoder.
 *
 * @package Drupal\yaml_serialization
 */
class YamlEncoder implements EncoderInterface, DecoderInterface{

  /**
   * The formats that this Encoder supports.
   *
   * @var string
   */
  protected $format = 'yaml';

  protected $yaml;

  /**
   * Constructor.
   */
  public function __construct(Yaml $yaml) {
    $this->yaml = $yaml;
  }

  public function decode($data, $format, array $context = array()) {
    return $this->yaml->decode($data);
  }

  public function supportsDecoding($format) {
    return $format == $this->format;
  }

  public function encode($data, $format, array $context = array()) {
    return $this->yaml->encode($data);
  }

  public function supportsEncoding($format) {
    return $format == $this->format;
  }
}
