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
	public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

		$element['value'] = $element + [
			'#type' => 'textarea',
			'#suffix' => new FormattableMarkup('<div id="jsoneditor" style="width: 100%; height: 800px;"></div>', []),
			'#attached' => [
				'library' => ['htm_custom_xjson_services/myform'],
				'drupalSettings' => ['json_object' => isset($form_state->getUserInput()[$items->getName()]) ? $form_state->getUserInput()[$items->getName()][0]['value'] : $items[$delta]->value]
			],
			'#element_validate' => [[$this, 'validateJsonStructure']],
			'#attributes' => [
				'style' => 'display:none',
			],
		];

		return $element;
	}

	/**
	 * Validates the input to see if it is a properly formatted JSON object. If not, PgSQL will throw fatal errors upon insert.
	 *
	 * @param $element
	 * @param \Drupal\Core\Form\FormStateInterface $form_state
	 * @param $form
	 */
	public function validateJsonStructure(&$element, FormStateInterface $form_state, $form) {
		$error_messages = [];
		$this->langs = \Drupal::languageManager()->getLanguages();

		if (Unicode::strlen($element['#value'])) {
			$value = Json::decode($element['#value']);
			if (json_last_error() !== JSON_ERROR_NONE) {
				$form_state->setError($element, t('@name must contain a valid JSON object.', ['@name' => $element['#title']]));
			}

			if(!isset($value['header']) || empty($value['header'])){
				$this->setErrorMessage(t('Header element missing or empty'));
			} else {
					// header excists now check header items here
					if(!isset($value['header']['form_name']) || empty($value['header']['form_name'])) $this->setErrorMessage(t('header.form_name field missing or empty'));
					if(!isset($value['header']['endpoint']) || empty($value['header']['endpoint'])) $this->setErrorMessage(t('header.endpoint field missing or empty'));
					if(!isset($value['header']['number_of_steps']) || (empty($value['header']['number_of_steps']) || !is_numeric($value['header']['number_of_steps']))) $this->setErrorMessage(t('header.number_of_steps field missing or not numeric'));
			}


			if(isset($value['body']) && !empty($value['body'])){
				(isset($value['body']['title'])) ? $this->checkTextLanguages($value['body']['title'], 'body.title') : $this->setErrorMessage(t("body.title missing or not array"));
				(isset($value['body']['introduction'])) ? $this->checkTextLanguages($value['body']['introduction'], 'body.introduction') : $this->setErrorMessage(t("body.introduction missing or not array")) ;

				if(isset($value['body']['steps']) && !empty($value['body']['steps'])){
					$step_keys = array_keys($value['body']['steps']);
					$valid_steps = preg_grep('/step_\d/', $step_keys);
					$steps_count = count($valid_steps);

					if($steps_count != $value['header']['number_of_steps']) $this->setErrorMessage(t('header.number_of_steps and body.steps count is different'));

					foreach($valid_steps as $step){
						if(!empty($value['body']['steps'][$step])){
							$step_item = $value['body']['steps'][$step];

							(isset($step_item['title'])) ? $this->checkTextLanguages($step_item['title'], "body.steps.$step.title") :  $this->setErrorMessage(t("body.steps.$step.title"));
							(isset($step_item['introduction'])) ? $this->checkTextLanguages($step_item['introduction'], "body.steps.$step.introduction") : $this->setErrorMessage(t("body.steps.$step.introduction"))  ;

							if(isset($step_item['data_elements']) && !empty($step_item['data_elements'])){
								foreach($step_item['data_elements'] as $key => $data_element){
									$this->validateDataElement($data_element);
								}
							}else{
								$this->setErrorMessage(t("body.steps.$step.data_elements is missing or empty"));
							}

						}else{
							$this->setErrorMessage(t("body.steps.$step is empty"));
						}
						#dump($step);
					}
					#dump($value['body']['steps']);
				}else{
					$this->setErrorMessage(t('body.steps missing or empty'));
				}

			}else{
				$this->setErrorMessage(t('body element missing or empty'));
			}

			/*if(isset($value['body']) || empty($value['body'])){
				$this->setErrorMessage(t('Body element missing or empty');
			} else {
				dump($value['body']['title']);
				if(self::checkLanguages(array_keys($value['body']['title']), array_keys($this->langs)))
				if(!isset($value['body']['title']) || (empty($value['body']['title']))){
					$this->setErrorMessage(t('body title missing');
				}
				#if(!isset($value['body']['title']))
				// body excists now check body items here
			}*/
			/*if(!empty($error_messages))*/ $form_state->setError($element, $this->getErrorMessages());
		}
	}


	private function setErrorMessage($string){
		$this->errormessages[] = $string;
	}



	private function getErrorMessages(){
		$string = '';
		foreach($this->errormessages as $message){
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
	private function checkLanguages(array $langcodes, array $availableLangcodes){
		foreach($langcodes as $langcode => $value){
			if(!in_array($langcode, $availableLangcodes, TRUE)) return FALSE;
		}

		return TRUE;
	}

	private function checkTextLanguages($element, $element_name){
		if($element && is_array($element)){
			if(!$this->checkLanguages($element, array_keys($this->langs))) $this->setErrorMessage(t("$element_name langcode not recognized"));
		}else{
			$this->setErrorMessage(t("$element_name missing or not array"));
		}
	}

	private function validateDataElement($element){
		dump($element);
		if(is_array($element) && isset($element['type'])){
			// BASE VALIDATIONS

			if(isset($element['hidden']) ){
				if(is_bool($element['hidden'])){
					if(!$element['hidden']){
						(isset($element['title']))  ? $this->checkTextLanguages($element['title'], 'error vaja kirjutada text vale formaat') : $this->setErrorMessage(t("Tiitel on required")) ;
					}
				}else{
					$this->setErrorMessage('hidden has to be bool');
				}
			}

			if(isset($element['heading'])) $this->checkTextLanguages($element['heading'], 'Heading katki');
			if(isset($element['helpertext'])) $this->checkTextLanguages($element['helpertext'], 'helpertext katki');
			if(isset($element['required']) && !is_bool($element['required'])) $this->setErrorMessage('Required has to be bool');
			if(isset($element['readonly']) && !is_bool($element['readonly'])) $this->setErrorMessage('Readonly has to be bool');
			if(isset($element['width']) && !is_numeric($element['width'])) $this->setErrorMessage('Width has to be numeric');
			if(isset($element['height']) && !is_numeric($element['height'])) $this->setErrorMessage('Height has to be numeric');

			if(isset($element['min']) && !is_numeric($element['min'])) $this->setErrorMessage('Min has to be numeric');
			if(isset($element['max']) && !is_numeric($element['max'])) $this->setErrorMessage('Max has to be numeric');
			if(isset($element['minlength']) && !is_numeric($element['minlength'])) $this->setErrorMessage('Minlength has to be numeric');
			if(isset($element['maxlenght']) && !is_numeric($element['maxlenght'])) $this->setErrorMessage('Maxlength has to be numeric');
			if(isset($element['multiple']) && !is_bool($element['multiple'])) $this->setErrorMessage('Multiple has to be bool');


			if(isset($element['heading'])) $this->checkTextLanguages($element['heading'], 'Heading katki');
			if(isset($element['heading'])) $this->checkTextLanguages($element['heading'], 'Heading katki');
			if(isset($element['heading'])) $this->checkTextLanguages($element['heading'], 'Heading katki');




			$type = $element['type'];
			switch ($element['type']){
				case 'heading':
				case 'helpertext':
					(isset($element['title'])) ? $this->checkTextLanguages($element['title'], 'Headingu title format wrong') : $this->setErrorMessage("$type element title required") ;
					return TRUE;
					break;
				case 'text':
					return TRUE;
					break;
				case 'textarea':
					return TRUE;
					break;
				case 'number':
					return TRUE;
					break;
				case 'date':
					return TRUE;
					break;
				case 'checkbox':
					return TRUE;
					break;
				case 'selectlist':
					return TRUE;
					break;
				case 'email':
					return TRUE;
					break;
				case 'file':
					return TRUE;
					break;
				case 'table':
					return TRUE;
					break;
				case 'address':
					return TRUE;
					break;
				default:
					$this->setErrorMessage('DATAELEMENT type not found (' . $element['type'] . ')');
					return FALSE;
					break;
			}
		} else{
			$this->setErrorMessage('DATAELEMENT WRONG');
			return FALSE;
		}
		#dump($element);
	}

}
