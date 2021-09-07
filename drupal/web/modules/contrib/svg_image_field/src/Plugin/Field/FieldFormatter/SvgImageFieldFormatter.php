<?php

namespace Drupal\svg_image_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'svg_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "svg_image_field_formatter",
 *   label = @Translation("SVG Image Field formatter"),
 *   field_types = {
 *     "svg_image_field"
 *   }
 * )
 */
class SvgImageFieldFormatter extends FormatterBase implements ContainerFactoryPluginInterface {
  /**
   * Logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  public $logger;

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      // Implement default settings.
      'inline' => FALSE,
      'apply_dimensions' => TRUE,
      'width' => 25,
      'height' => 25,
      'enable_alt' => TRUE,
      'enable_title' => TRUE,
      'link' => '',
    ] + parent::defaultSettings();
  }

  /**
   * Link types.
   *
   * @return array
   *   Link type options for formatter setting
   */
  private function getLinkTypes() {
    return [
      'content' => $this->t('Content'),
      'file' => $this->t('File'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    $form['inline'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Output SVG inline'),
      '#default_value' => $this->getSetting('inline'),
      '#description' => $this->t('Check this option if you want to manipulate the SVG image with CSS and JavaScript.
       Notice only trusted users should use fields with this option enabled because of 
       <a href="@svg_security_link">inline svg security</a>', ['@svg_security_link' => 'https://www.w3.org/wiki/SVG_Security']),
    ];
    $form['apply_dimensions'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Apply dimensions.'),
      '#default_value' => $this->getSetting('apply_dimensions'),
    ];
    $form['width'] = [
      '#type' => 'number',
      '#title' => $this->t('Image width.'),
      '#default_value' => $this->getSetting('width'),
    ];
    $form['height'] = [
      '#type' => 'number',
      '#title' => $this->t('Image height.'),
      '#default_value' => $this->getSetting('height'),
    ];
    $form['enable_alt'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable alt attribute.'),
      '#default_value' => $this->getSetting('enable_alt'),
    ];
    $form['enable_title'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable title attribute.'),
      '#default_value' => $this->getSetting('enable_title'),
    ];
    $form['notice'] = [
      '#type' => 'markup',
      '#markup' => '<div><small>' . $this->t('Alt and title attributes will be created from an image filename by removing file extension and replacing eventual underscores and dashes with spaces.') . '</small></div>',
    ];
    $form['link'] = [
      '#title' => $this->t('Link image to'),
      '#type' => 'select',
      '#default_value' => $this->getSetting('link'),
      '#empty_option' => $this->t('Nothing'),
      '#options' => $this->getLinkTypes(),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    // Implement settings summary.
    if ($this->getSetting('inline')) {
      $summary[] = $this->t('Inline SVG');
    }
    if ($this->getSetting('apply_dimensions') && $this->getSetting('width')) {
      $summary[] = $this->t('Image width: @width', ['@width' => $this->getSetting('width')]);
    }
    if ($this->getSetting('apply_dimensions') && $this->getSetting('width')) {
      $summary[] = $this->t('Image height: @height', ['@height' => $this->getSetting('height')]);
    }
    if ($this->getSetting('enable_alt')) {
      $summary[] = $this->t('Alt enabled');
    }
    if ($this->getSetting('enable_title')) {
      $summary[] = $this->t('Title enabled');
    }
    $link_types = $this->getLinkTypes();
    // Display this setting only if image is linked.
    $image_link_setting = $this->getSetting('link');
    if (isset($link_types[$image_link_setting])) {
      $summary[] = $link_types[$image_link_setting];
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    $attributes = [];
    if ($this->getSetting('apply_dimensions')) {
      $attributes['width'] = $this->getSetting('width');
      $attributes['height'] = $this->getSetting('height');
    }

    $url = NULL;
    $image_link_setting = $this->getSetting('link');
    // Check if the formatter involves a link.
    if ($image_link_setting == 'content') {
      $entity = $items->getEntity();
      if (!$entity->isNew()) {
        $url = $entity->toUrl();
      }
    }

    foreach ($items as $delta => $item) {
      if (!$item->entity) {
        continue;
      }
      $uri = $item->entity->getFileUri();
      if (file_exists($uri) === FALSE) {
        $this->logger->error('The specified file %file could not be displayed by image formatter due file not exists.', ['%file' => $uri]);
        continue;
      }
      $filename = $item->entity->getFilename();
      $alt = !empty($item->alt) ? $item->alt : $this->generateAltAttribute($filename);
      if ($this->getSetting('enable_alt')) {
        $attributes['alt'] = $alt;
      }
      if ($this->getSetting('enable_title')) {
        $attributes['title'] = $alt;
      }
      $svg_data = NULL;

      if ($this->getSetting('inline')) {
        $svg_file = file_get_contents($uri);
        $dom = new \DOMDocument();
        libxml_use_internal_errors(TRUE);
        $dom->loadXML($svg_file);
        $svg_data = $dom->saveXML();
        if ($this->getSetting('apply_dimensions') && isset($dom->documentElement)) {
          $dom->documentElement->setAttribute('height', $attributes['height']);
          $dom->documentElement->setAttribute('width', $attributes['width']);
          $svg_data = $dom->saveXML();
        }
      }

      $cache_contexts = [];
      if ($image_link_setting == 'file') {
        // @todo Wrap in file_url_transform_relative(). This is currently
        // impossible. As a work-around, we currently add the 'url.site' cache
        // context to ensure different file URLs are generated for different
        // sites in a multisite setup, including HTTP and HTTPS versions of the
        // same site. Fix in https://www.drupal.org/node/2646744.
        $url = Url::fromUri(file_create_url($uri));
        $cache_contexts[] = 'url.site';
      }

      $elements[$delta] = [
        '#theme' => 'svg_image_field_formatter',
        '#inline' => $this->getSetting('inline') ? TRUE : FALSE,
        '#attributes' => $attributes,
        '#uri' => $this->getSetting('inline') ? NULL : $uri,
        '#svg_data' => $svg_data,
        '#link_url' => $url,
        '#cache' => [
          'tags' => $item->entity->getCacheTags(),
          'contexts' => $cache_contexts,
        ],
      ];
    }

    return $elements;
  }

  /**
   * Generate alt attribute from an image filename.
   */
  private function generateAltAttribute($filename) {
    $alt = str_replace(['.svg', '-', '_'], ['', ' ', ' '], $filename);
    $alt = ucfirst($alt);
    return $alt;
  }

  /**
   * Constructs a SvgImageFieldFormatter object.
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
   *   Any third party settings.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   Logger.
   */
  public function __construct(
    $plugin_id,
    $plugin_definition,
    FieldDefinitionInterface $field_definition,
    array $settings,
    $label,
    $view_mode,
    array $third_party_settings,
    LoggerChannelFactoryInterface $logger
  ) {
    $this->logger = $logger->get('svg_image_field');
    parent::__construct($plugin_id, $plugin_definition, $field_definition,
      $settings, $label, $view_mode, $third_party_settings);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition
  ) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('logger.factory')
    );
  }

}
