<?php

/**
 * @file
 * Contains \Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget\JsonbWidget.
 */

namespace Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\Unicode as Unicode;
use Drupal\Component\Serialization\Json as Json;
use Drupal\Core\Language\LanguageManager;
use Symfony\Component\Validator\ConstraintViolationInterface;

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

	var $errormessages = [];
	var $langs = [];

	/**
	 * {@inheritdoc}
	 */
	public function formElement (FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
		$id = $items->getName();
		#dump($items[$delta]->value);
		$element['value'] = $element + [
				'#type' => 'textarea',
				'#suffix' => new FormattableMarkup("<div id='$id' style='width: 100%; height: 800px;'></div>", []),
				'#attached' => [
					'library' => ['htm_custom_xjson_services/myform'],
					'drupalSettings' => [
						"$id" =>
							isset($form_state->getUserInput()[$items->getName()])
								? $form_state->getUserInput()[$items->getName()][0]['value']
								: $items[$delta]->value
					]

				],
				'#element_validate' => [[$this, 'validateJsonStructure']],
				'#attributes' => [
					'style' => 'display:none',
				],
			];
		if (preg_match("/test/", $id)) {
			unset($element['value']['#element_validate']);
		}

		return $element;
	}

	/**
	 * Validates the input to see if it is a properly formatted JSON object. If not, PgSQL will throw fatal errors upon insert.
	 *
	 * @param                                      $element
	 * @param \Drupal\Core\Form\FormStateInterface $form_state
	 * @param                                      $form
	 */
	public function validateJsonStructure (&$element, FormStateInterface $form_state, $form) {
		$error_messages = [];
		$this->langs = \Drupal::languageManager()->getLanguages();

		if (Unicode::strlen($element['#value'])) {
			$value = Json::decode($element['#value']);
			if (json_last_error() !== JSON_ERROR_NONE) {
				$form_state->setError($element, t('@name must contain a valid JSON object.', ['@name' => $element['#title']]));
			}

			if (!isset($value['header']) || empty($value['header'])) {
				$this->setErrorMessage(t('Header element missing or empty'));
			} else {
				// header excists now check header items here
				if (!isset($value['header']['form_name']) || empty($value['header']['form_name'])) $this->setErrorMessage(t('header.form_name field missing or empty'));
				if (!isset($value['header']['endpoint']) || empty($value['header']['endpoint'])) $this->setErrorMessage(t('header.endpoint field missing or empty'));
				if (!isset($value['header']['number_of_steps']) || (empty($value['header']['number_of_steps']) || !is_numeric($value['header']['number_of_steps']))) $this->setErrorMessage(t('header.number_of_steps field missing or not numeric'));
			}


			if (isset($value['body']) && !empty($value['body'])) {
				(isset($value['body']['title'])) ? $this->checkTextLanguages($value['body']['title'], 'body.title') : $this->setErrorMessage(t("body.title missing or not array"));
				if (isset($value['body']['introduction'])) $this->checkTextLanguages($value['body']['introduction'], 'body.introduction');
				if(isset($value['body']['hide_steps']) && !is_bool($value['body']['hide_steps'])) $this->setErrorMessage(t("body.hide_steps must be bool"));
				if (isset($value['body']['steps']) && !empty($value['body']['steps'])) {
					$steps = array_keys($value['body']['steps']);
					$steps_count = count($steps);
					if (isset($value['header'])) {
						if ($steps_count != $value['header']['number_of_steps']) $this->setErrorMessage(t('header.number_of_steps and body.steps count is different'));
					}

					foreach ($steps as $step) {
						if (!empty($value['body']['steps'][$step])) {
							$step_item = $value['body']['steps'][$step];

							(isset($step_item['title'])) ? $this->checkTextLanguages($step_item['title'], "body.steps.$step.title") : $this->setErrorMessage(t("body.steps.$step.title missing"));
							if (isset($step_item['introduction'])) $this->checkTextLanguages($step_item['introduction'], "body.steps.$step.introduction");

							if (isset($step_item['data_elements']) && !empty($step_item['data_elements'])) {
								foreach ($step_item['data_elements'] as $key => $data_element) {
									$this->validateDataElement($data_element, $step, $key, null);
								}
							} else {
								$this->setErrorMessage(t("body.steps.$step.data_elements is missing or empty"));
							}

						} else {
							$this->setErrorMessage(t("body.steps.$step is empty"));
						}
					}
				} else {
					$this->setErrorMessage(t('body.steps missing or empty'));
				}

			} else {
				$this->setErrorMessage(t('body element missing or empty'));
			}

			if (isset($value['messages'])) {
				foreach ($value['messages'] as $key => $message) {
					if (isset($message['message_type'])) {
						$available_message_types = ['NOTICE', 'WARNING', 'ERROR'];
						if (!in_array($message['message_type'], $available_message_types)) $this->setErrorMessage("message $key message_type not allowed");
					} else {
						$this->setErrorMessage("message $key type missing");
					}
					(isset($message['message_text'])) ? $this->checkTextLanguages($message['message_text'], "message $key") : $this->setErrorMessage("Message $key message_text required");
				}
			}

			if (!empty($this->getErrorMessages())) $form_state->setError($element, $this->getErrorMessages());
		}
	}


	private function setErrorMessage ($string) {
		$this->errormessages[] = $string;
	}


	private function getErrorMessages () {
		$string = '';
		foreach ($this->errormessages as $message) {
			$string .= $message . " - ";
		}
		return $string;
	}

	/**
	 * Check if definition langcode is enabled in Drupal
	 *
	 * @param array $langcodes
	 * @param array $availableLangcodes
	 * @return bool
	 */
	private function checkLanguages (array $langcodes, array $availableLangcodes) {
		$valid = false;
		foreach ($langcodes as $langcode => $value) {
			if ($langcode === 'et') $valid = true;
			if (!in_array($langcode, $availableLangcodes, true)) $valid = false;
			if (!is_string($value)) $valid = false;
		}
		return $valid;
	}

	private function checkTextLanguages ($element, $element_name) {
		if ($element && is_array($element)) {
			if (isset($element['options'])) unset($element['options']);
			if (!$this->checkLanguages($element, array_keys($this->langs))) $this->setErrorMessage(t("$element_name langcode not recognized or et langcode missing or not text"));
		} else {
			$this->setErrorMessage(t("$element_name missing or not array"));
		}
	}

	private function validateDataElement ($element, $step = 0, $parent_key = null, $key, $table = false) {

		#$step =

		if (is_array($element) && isset($element['type'])) {
			$type = $element['type'];
			if (isset($element['title']) && !isset($element['hidden'])) {
				$this->checkTextLanguages($element['title'], "$step.data_elements.$parent_key.$key title");
			} elseif (isset($element['hidden'])) {
				if (is_bool($element['hidden'])) {
					if (!$element['hidden']) $this->checkTextLanguages($element['title'], "$step.data_elements.$parent_key.$key title");
				} else {
					$this->setErrorMessage("$step.data_elements.$parent_key.$key.hidden has to be bool");
				}
			} else {
				$this->setErrorMessage(t("$step.data_elements.$parent_key.$key title on required"));
			}


			if (isset($element['heading'])) $this->checkTextLanguages($element['heading'], "$step.data_elements.$parent_key.$key.heading has no translation");
			if (isset($element['helpertext'])) $this->checkTextLanguages($element['helpertext'], "$step.data_elements.$parent_key.$key.helpertext has no translation");
			if (isset($element['required']) && !is_bool($element['required'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.required has to be bool");
			if (isset($element['readonly']) && !is_bool($element['readonly'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.readonly has to be bool");
			if (isset($element['width']) && !is_numeric($element['width'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.width has to be numeric");
			if (isset($element['height']) && !is_numeric($element['height'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.height has to be numeric");

			if ($type != 'date') {
				if (isset($element['min']) && !is_numeric($element['min'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.min has to be numeric");
				if (isset($element['max']) && !is_numeric($element['max'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.max has to be numeric");
			} else {
				if (isset($element['min']) && !$this->validateDate($element['min'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.min format has to be YYYY-MM-DD");
				if (isset($element['max']) && !$this->validateDate($element['max'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.max format has to be YYYY-MM-DD");
			}
			if (isset($element['minlength']) && !is_numeric($element['minlength'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.minlength has to be numeric");
			if (isset($element['maxlength']) && !is_numeric($element['maxlength'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.maxlength has to be numeric");
			if (isset($element['multiple']) && !is_bool($element['multiple'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.multiple has to be bool");

			$default_acceptable_keys = ['type', 'title', 'helpertext', 'required', 'hidden', 'readonly', 'default_value'];
			switch ($type) {
				case 'heading':
				case 'helpertext':
					$acceptable_keys = ['type', 'title'];
					(isset($element['title'])) ? $this->checkTextLanguages($element['title'], 'Headingu title format wrong') : $this->setErrorMessage("$step.data_elements.$parent_key.$key.title required");
					break;
				case 'text':
					$additional_keys = ['width', 'maxlength', 'minlength'];
					break;
				case 'textarea':
					$additional_keys = ['width', 'height', 'maxlength', 'minlength'];
					break;
				case 'date':
					if ($table) {
						$additional_keys = ['width', 'min', 'max'];
					} else {
						$additional_keys = ['min', 'max'];
					}
					if (isset($element['default_value']) && !$this->validateDate($element['default_value'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.date format has to be YYYY-MM-DD");
					break;
				case 'number':
					if ($table) {
						$additional_keys = ['width', 'min', 'max'];
					} else {
						$additional_keys = ['min', 'max'];
					}
					if (isset($element['default_value']) && !is_numeric($element['default_value'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.number default_value has to be numeric");
					break;
				case 'selectlist':
					if ($table) {
						$additional_keys = ['width', 'multiple', 'empty_option', 'options'];
					} else {
						$additional_keys = ['multiple', 'empty_option', 'options', 'options_list'];
					}
					if (isset($element['options']) && isset($element['options_list'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.selectlist cannot have both options and options_list attribute");
					if (isset($element['options']) && is_array($element['options']) && count($element['options']) >= 1) {
						$option_keys = $this->ValidateOptionElement($element['options'], null, $step, $parent_key, $key);
						if (isset($element['default_value']) && !in_array($element['default_value'], $option_keys)) $this->setErrorMessage("$step.data_elements.$parent_key.$key.default_value does not match options");
					} elseif (isset($element['options_list'])) {
						// its fine
					} else {
						$this->setErrorMessage("$step.data_elements.$parent_key.$key.selectlist missing options or options_list attribute");
					}
					break;
				case 'file':
					if ($step !== 'step_submit_result') {
						if (!isset($element['acceptable_extensions']) || !is_array($element['acceptable_extensions'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.file acceptable_extensions attribute missing or not array");
					}
					if ($table) {
						$additional_keys = ['width', 'acceptable_extensions'];
					} else {
						$additional_keys = ['multiple', 'acceptable_extensions'];
					}
					break;
				case 'table':
					$additional_keys = ['add_del_rows', 'table_columns'];
					if (isset($element['add_del_rows']) && !is_bool($element['add_del_rows'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.add_del_rows has to be bool");
					if (isset($element['table_columns'])) {
						foreach ($element['table_columns'] as $key => $column_element) {
							if (($is_table = $column_element['type'] === 'table') || ($is_textarea = $column_element['type'] === 'textarea')) {
								if (isset($is_table) && $is_table) $this->setErrorMessage("$step.data_elements.$parent_key.table_columns.$key table type not allowed");
								if (isset($is_textarea) && $is_textarea) $this->setErrorMessage("$step.data_elements.$parent_key.table_columns.$key. textarea type not allowed");
							} else {
								$this->validateDataElement($column_element, $step, $parent_key, 'table_columns.' . $key, true);
							}
						}
					} else {
						$this->setErrorMessage("$step.data_elements.$parent_key.$key.table_columns missing");
					}
					break;
				case 'address':
					$additional_keys = ['multiple', 'appartment', 'ihist', 'results'];
					break;
				case 'checkbox':
					$additional_keys = ['width'];
					if (isset($element['default_value']) && !is_bool($element['default_value'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.checkbox default_value has to be bool");
					break;
				case 'email':
					$additional_keys = [];
					if (isset($element['default_value']) && !\Drupal::service('email.validator')->isValid($element['default_value'])) $this->setErrorMessage("$step.data_elements.$parent_key.$key.email not valid");
					break;
				default:
					$additional_keys = [];
					$this->setErrorMessage("$step.data_elements.$parent_key.$key.DATAELEMENT type not found ($type)");
					break;
			}
			if (!isset($acceptable_keys)) $acceptable_keys = array_merge($default_acceptable_keys, $additional_keys);
			$element_keys = array_keys($element);
			#dump($element_keys);
			foreach ($element_keys as $element_key) {
				if (!in_array($element_key, $acceptable_keys, true)) $this->setErrorMessage("$step.data_elements.$parent_key.$key.$element_key not acceptable");
			}

		} else {
			$this->setErrorMessage("$step.data_elements.$parent_key.$key type missing");
		}
	}

	protected function validateOptionElement ($options, $option_keys = [], $step, $parent_key, $key) {
		foreach ($options as $option_key => $option) {
			$option_keys[] = $option_key;
			$this->checkTextLanguages($option, "$step.data_elements.$parent_key.$key Option text");
			if (isset($option['options'])) $this->validateOptionElement($option['options'], $option_keys, $step, $parent_key, $key);
		}
		return $option_keys;
	}

	private function validateDate ($date, $format = 'Y-m-d') {
		try {
			$d = DrupalDateTime::createFromFormat($format, $date);
			// The Y ( 4 digits year ) returns TRUE for any integer with any number of digits so changing the comparison from == to === fixes the issue.
			return $d && $d->format($format) === $date;
		} catch (\Exception $e) {
			return false;
			#$this->setErrorMessage('date format not recognized');
		}

	}

}
