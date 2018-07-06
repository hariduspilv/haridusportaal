<?php

/**
 * @file
 * Contains \Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget\JsonbWidget.
 */

namespace Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\Unicode as Unicode;
use Drupal\Component\Serialization\Json as Json;

/**
 * Plugin implementation of the 'jsonb_textarea' widget.
 *
 * @FieldWidget(
 *   id = "jsonb_textarea",
 *   label = @Translation("JSONB Object"),
 *   field_types = {
 *     "jsonb",
 *     "json",
 *   }
 * )
 */
class JsonbWidget extends StringTextareaWidget {

	/**
	 * {@inheritdoc}
	 */
	public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
		$widget = parent::formElement($items, $delta, $element, $form, $form_state);

		$widget[1]['value']['test'] = [
			'#markup' => new FormattableMarkup('<div id="jsoneditor" style="width: 100%; height: 800px;"></div>', []),
			'#prefix' => '<div class="test">',
			'#suffix' => '</div>',
		];

		$widget[1]['value']['#attached']['library'] = [
				'htm_custom_xjson_services/myform',
		];
		#dump(json_decode($items->value, TRUE));
		$widget[1]['#attached']['drupalSettings']['json_object'] = $items->value;

		$widget[1]['value']['validate'] = array(
				'#type' => 'button',
				'#value' => $this->t('validate'),
				'#attributes' => [
					'id' => 'getJSON'
				]
		);


		#$entity = $this->entity;

		$widget['#element_validate'][] = array(get_called_class(), 'validateJsonStructure');
		return $widget;
	}

	/**
	 * Validates the input to see if it is a properly formatted JSON object. If not, PgSQL will throw fatal errors upon insert.
	 *
	 * @param $element
	 * @param \Drupal\Core\Form\FormStateInterface $form_state
	 * @param $form
	 */
	public static function validateJsonStructure(&$element, FormStateInterface $form_state, $form) {
		if (Unicode::strlen($element['value']['#value'])) {
			$value = Json::decode($element['value']['#value']);

			if (json_last_error() !== JSON_ERROR_NONE) {
				$form_state->setError($element['value'], t('!name must contain a valid JSON object.', array('!name' => $element['value']['#title'])));
			}
		}
	}
}
