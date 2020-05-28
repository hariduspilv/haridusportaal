<?php

namespace Drupal\google_map_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;

/**
 * Plugin implementation of the 'google_map_field' formatter.
 *
 * @FieldFormatter(
 *   id = "google_map_field_embed",
 *   label = @Translation("Google Map Field Embed Place"),
 *   field_types = {
 *     "google_map_field"
 *   }
 * )
 */
class GoogleMapFieldEmbedPlaceFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * GoogleMapFieldEmbedPlaceFormatter constructor.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param string $label
   *   The formatter label display setting.
   * @param string $view_mode
   *   The view mode.
   * @param array $third_party_settings
   *   Third party settings.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, ConfigFactoryInterface $config_factory) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);

    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('config.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $api_key = $this->configFactory->get('google_map_field.settings')->get('google_map_field_apikey');

    $elements = [];
    foreach ($items as $delta => $item) {
      $element = [
        '#theme' => 'google_map_field_embed',
        '#name' => $item->name,
        '#lat' => $item->lat,
        '#lon' => $item->lon,
        '#zoom' => $item->zoom,
        '#type' => $item->type,
        '#show_marker' => $item->marker === "1" ? "true" : "false",
        '#show_controls' => $item->controls === "1" ? "true" : "false",
        '#width' => $item->width ? $item->width : '320px',
        '#height' => $item->height ? $item->height : '200px',
        '#api_key' => $api_key,
      ];

      // Handle markup for InfoWindow popup.
      if (!empty($item->infowindow)) {
        $element['#infowindow'] = [
          '#markup' => $item->infowindow,
          '#allowed_tags' => $this->allowedTags(),
        ];
      }
      $elements[$delta] = $element;
    }

    return $elements;
  }

  /**
   * Retrieves list of allowed tags for infowindow popup.
   *
   * @return array
   *   List of allowed tags to use on infowindow popup.
   */
  private function allowedTags() {
    return [
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'span',
      'br',
      'em',
      'strong',
      'a',
      'img',
      'video',
      'ul',
      'ol',
      'li',
    ];
  }

}
