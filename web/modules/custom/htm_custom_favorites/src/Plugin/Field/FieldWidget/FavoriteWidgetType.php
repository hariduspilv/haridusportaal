<?php

namespace Drupal\htm_custom_favorites\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\EntityReferenceAutocompleteWidget;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'favorite_widget_type' widget.
 *
 * @FieldWidget(
 *   id = "favorite_widget_type",
 *   label = @Translation("Favorite widget type"),
 *   field_types = {
 *     "favorite_field_type"
 *   }
 * )
 */
class FavoriteWidgetType extends EntityReferenceAutocompleteWidget {

	public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
		$widget = parent::formElement($items, $delta, $element, $form, $form_state);

		$widget['title'] = [
			'#title' => $this->t('Title'),
			'#type' => 'textfield',
			'#default_value' => isset($items[$delta]->title) ? $items[$delta]->title : '',
			'#weight' => -1,
		];

		return $widget;
	}

}
