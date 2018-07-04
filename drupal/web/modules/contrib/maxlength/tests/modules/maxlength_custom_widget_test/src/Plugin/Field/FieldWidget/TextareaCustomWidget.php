<?php

namespace Drupal\maxlength_custom_widget_test\Plugin\Field\FieldWidget;

use Drupal\text\Plugin\Field\FieldWidget\TextareaWithSummaryWidget;

/**
 * Plugin implementation of the 'text_textarea_custom_widget' widget.
 *
 * @FieldWidget(
 *   id = "text_textarea_custom_widget",
 *   label = @Translation("Text area custom widget for testing purpose"),
 *   field_types = {
 *     "text_with_summary"
 *   }
 * )
 */
class TextareaCustomWidget extends TextareaWithSummaryWidget {}
