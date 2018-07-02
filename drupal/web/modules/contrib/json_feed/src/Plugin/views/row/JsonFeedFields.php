<?php

namespace Drupal\json_feed\Plugin\views\row;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\views\Plugin\views\row\RowPluginBase;

/**
 * Plugin which displays fields for a JSON feed.
 *
 * @ViewsRow(
 *   id = "json_feed_fields",
 *   title = @Translation("JSON fields"),
 *   help = @Translation("Display fields as JSON items."),
 *   display_types = {"json_feed"}
 * )
 */
class JsonFeedFields extends RowPluginBase {

  /**
   * Does the row plugin support to add fields to it's output.
   *
   * @var bool
   */
  protected $usesFields = TRUE;

  /**
   * {@inheritdoc}
   */
  protected function defineOptions() {
    $options = parent::defineOptions();
    $options['id'] = ['default' => ''];
    $options['url'] = ['default' => ''];
    $options['title'] = ['default' => ''];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    parent::buildOptionsForm($form, $form_state);

    $initial_labels = ['' => $this->t('- None -')];
    $view_fields_labels = $this->displayHandler->getFieldLabels();
    $view_fields_labels = array_merge($initial_labels, $view_fields_labels);

    $form['id_field'] = [
      '#type' => 'select',
      '#title' => $this->t('id attribute'),
      '#description' => $this->t('Unique identifier for this item over time.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['id_field'],
      '#required' => TRUE,
    ];

    $form['url_field'] = [
      '#type' => 'select',
      '#title' => $this->t('url attribute'),
      '#description' => $this->t('Permanent link to this item.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['url_field'],
      '#required' => TRUE,
    ];

    $form['external_url_field'] = [
      '#type' => 'select',
      '#title' => $this->t('external_url attribute'),
      '#description' => $this->t('URL of a page elsewhere that this item is referencing.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['external_url_field'],
    ];

    $form['title_field'] = [
      '#type' => 'select',
      '#title' => $this->t('title attribute'),
      '#description' => $this->t('JSON title attribute. This must be plain text, not linked to the content.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['title_field'],
    ];

    $form['content_html_field'] = [
      '#type' => 'select',
      '#title' => $this->t('content_html attribute'),
      '#description' => $this->t('JSON content_html attribute. This is the only attribute in the JSON Feed spec that allows HTML.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['content_html_field'],
    ];

    $form['content_text_field'] = [
      '#type' => 'select',
      '#title' => $this->t('content_text attribute'),
      '#description' => $this->t('JSON content_text attribute.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['content_text_field'],
    ];

    $form['summary_field'] = [
      '#type' => 'select',
      '#title' => $this->t('summary attribute'),
      '#description' => $this->t('JSON summary attribute. This must be plain text.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['summary_field'],
    ];

    $form['image_field'] = [
      '#type' => 'select',
      '#title' => $this->t('image attribute'),
      '#description' => $this->t('The URL of the main image for the item. Feed readers may use the image as a preview.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['image_field'],
    ];

    $form['banner_image_field'] = [
      '#type' => 'select',
      '#title' => $this->t('banner image attribute'),
      '#description' => $this->t('The URL of an image to use as a banner. A feed reader with a detail view may choose to show this banner image at the top of the detail view, possibly with the title overlaid.'),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['banner_image_field'],
    ];

    $form['date_published_field'] = [
      '#type' => 'select',
      '#title' => $this->t('date_published attribute'),
      '#description' => $this->t("JSON date_published attribute, formatted as RFC 3339 (Y-m-d\\TH:i:sP)"),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['date_published_field'],
    ];

    $form['date_modified_field'] = [
      '#type' => 'select',
      '#title' => $this->t('date_modified attribute'),
      '#description' => $this->t("JSON date_modified attribute, formatted as RFC 3339 (Y-m-d\\TH:i:sP)"),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['date_modified_field'],
    ];

    $form['tags_field'] = [
      '#type' => 'select',
      '#title' => $this->t('tags attribute'),
      '#description' => $this->t("JSON tags attribute. Accepts a comma separated list of tag names."),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['tags_field'],
    ];

    $form['author'] = [
      '#type' => 'details',
      '#title' => $this->t('Author'),
      '#open' => TRUE,
    ];

    $form['author_name_field'] = [
      '#fieldset' => 'author',
      '#type' => 'select',
      '#title' => $this->t('item author name attribute'),
      '#description' => $this->t("JSON author name attribute."),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['author_name_field'],
    ];

    $form['author_url_field'] = [
      '#fieldset' => 'author',
      '#type' => 'select',
      '#title' => $this->t('item author url attribute'),
      '#description' => $this->t("The URL of a site owned by the item's author."),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['author_url_field'],
    ];

    $form['author_avatar_field'] = [
      '#fieldset' => 'author',
      '#type' => 'select',
      '#title' => $this->t('item author avatar attribute'),
      '#description' => $this->t("The URL for an image for the item's author."),
      '#options' => $view_fields_labels,
      '#default_value' => $this->options['author_avatar_field'],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function validate() {
    $errors = parent::validate();
    $required_options = ['id_field', 'url_field'];
    foreach ($required_options as $required_option) {
      if (empty($this->options[$required_option])) {
        $errors[] = $this->t('Row style plugin requires specifying which views fields to use for JSON feed item.');
        break;
      }
    }

    // Ensure either content_html_field or content_text_field is set, one or the
    // other is required.
    if (empty($this->options['content_html_field']) && empty($this->options['content_text_field'])) {
      $errors[] = $this->t('Either content_html or content_text must have a value.');
    }

    return $errors;
  }

  /**
   * {@inheritdoc}
   */
  public function render($row) {
    // Create the JSON item.
    $item = [];
    $row_index = $this->view->row_index;
    $item['id'] = strip_tags($this->getField($row_index, $this->options['id_field']));
    $item['url'] = strip_tags($this->getAbsoluteUrlForField($row_index, 'url_field'));
    $item['external_url'] = strip_tags($this->getAbsoluteUrlForField($row_index, 'external_url_field'));
    $item['title'] = strip_tags($this->getField($row_index, $this->options['title_field']));
    $item['content_html'] = $this->getField($row_index, $this->options['content_html_field']);
    $item['content_text'] = strip_tags($this->getField($row_index, $this->options['content_text_field']));
    $item['summary'] = strip_tags($this->getField($row_index, $this->options['summary_field']));
    $item['image'] = strip_tags($this->getAbsoluteUrlForField($row_index, 'image_field'));
    $item['banner_image'] = strip_tags($this->getAbsoluteUrlForField($row_index, 'banner_image_field'));
    $item['date_published'] = strip_tags($this->getField($row_index, $this->options['date_published_field']));
    $item['date_modified'] = strip_tags($this->getField($row_index, $this->options['date_modified_field']));

    $item['author'] = array_map('strip_tags', $this->getAuthor($row_index, $this->options));
    $item['tags'] = array_map('strip_tags', $this->getTags($row_index, $this->options['tags_field']));

    // Remove empty attributes.
    $item['author'] = array_filter($item['author']);
    $item = array_filter($item);

    return $item;
  }

  /**
   * Retrieves a views field value from the style plugin.
   *
   * @param int $index
   *   The index count of the row as expected by views_plugin_style::getField().
   * @param string $field_id
   *   The ID assigned to the required field in the display.
   *
   * @return string
   *   The rendered field value.
   */
  public function getField($index, $field_id) {
    if (empty($this->view->style_plugin) || !is_object($this->view->style_plugin) || empty($field_id)) {
      return '';
    }
    return (string) $this->view->style_plugin->getField($index, $field_id);
  }

  /**
   * If the field value exists, return it as an absolute URL.
   *
   * @param int $row_index
   *   The index count of the row as expected by views_plugin_style::getField().
   * @param string $field_id
   *   The ID assigned to the required field in the display.
   *
   * @return null|string
   *   The absolute URL for the field's value.
   */
  protected function getAbsoluteUrlForField($row_index, $field_id) {
    if (isset($this->options[$field_id])) {
      $field_value = $this->getField($row_index, $this->options[$field_id]);
      if (strpos($field_value, '/') !== 0) {
        $field_value = '/' . $field_value;
      }
      return Url::fromUserInput($field_value)->setAbsolute()->toString();
    }
    return NULL;
  }

  /**
   * Retrieve and format tag attribute values.
   *
   * @param int $row_index
   *   The index count of the row as expected by views_plugin_style::getField().
   * @param string $field_id
   *   The ID assigned to the required field in the display.
   *
   * @return array
   *   An array of tag strings.
   */
  protected function getTags($row_index, $field_id) {
    $tags_csv = $this->getField($row_index, $field_id);
    return array_map('trim', explode(',', $tags_csv));
  }

  /**
   * Retrieve and format author attribute values.
   *
   * @param int $row_index
   *   The index count of the row as expected by views_plugin_style::getField().
   * @param array $options
   *   The full options array which contains author field configurations.
   *
   * @return array
   *   An array of author attributes.
   */
  protected function getAuthor($row_index, array $options) {
    return [
      'name' => $this->getField($row_index, $options['author_name_field']),
      'url' => $this->getAbsoluteUrlForField($row_index, $options['author_url_field']),
      'avatar' => $this->getField($row_index, $options['author_avatar_field']),
    ];
  }

}
