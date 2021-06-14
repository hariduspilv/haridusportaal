<?php

namespace Drupal\htm_custom_video_field\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'custom_video_widget_type' widget.
 *
 * @FieldWidget(
 *   id = "custom_video_widget_type",
 *   label = @Translation("Custom video widget type"),
 *   field_types = {
 *     "custom_video_field_type"
 *   }
 * )
 */
class CustomVideoWidgetType extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'size' => 60,
      'placeholder' => '',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
		$elements = parent::settingsForm($form, $form_state);

    $elements['placeholder'] = [
      '#type' => 'textfield',
      '#title' => t('Placeholder'),
      '#default_value' => $this->getSetting('placeholder'),
      '#description' => t('Text that will be shown inside the field until a value is entered. This hint is usually a sample value or a brief description of the expected format.'),
    ];

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
	public function settingsSummary() {
		$summary = array();

		$placeholder_url = $this->getSetting('placeholder_url');
		if (empty($placeholder_url)) {
			$summary[] = t('No placeholders');
		}
		else {
			if (!empty($placeholder_url)) {
				$summary[] = t('URL placeholder: @placeholder_url', array('@placeholder_url' => $placeholder_url));
			}
		}

		return $summary;
	}

	/**
	 * {@inheritdoc}
	 */
	public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
		$instance_delta = $items->getName() . '-' . $delta;
		$element += [
				'#type' => 'fieldset',
				'#title' => $this->t('Map'),
		];
		$element['input'] = [
            '#title' => $this->t('URL link'),
			'#type' => 'textfield',
			'#placeholder' => $this->getSetting('placeholder_url'),
			'#default_value' => isset($items[$delta]->input) ? $items[$delta]->input : NULL,
			'#maxlength' => 255,
			'#element_validate' => array(array($this, 'validateInput')),
		];

		#if ($element['input']['#description'] == '') {
			$element['input']['#description'] = t('Enter a video url');
		#}

		$element['video_description'] = [
			'#title' => $this->t('Video description'),
			'#size' => 60,
			'#type' => 'textfield',
			'#default_value' => isset($items[$delta]->video_description) ? $items[$delta]->video_description : NULL,
		];

		// For youtube video validation
		if (isset($items->get($delta)->video_id)) {
			$element['video_id'] = array(
				'#prefix' => '<span><strong>' . t('Video id  -  ') . '</strong></span>',
				'#markup' => t('@video_id', array('@video_id' => $items->get($delta)->video_id)),
				'#weight' => 1,
			);
		}

		return $element;
	}

	/**
	 * Validate video URL.
	 */
	public function validateInput(&$element, FormStateInterface &$form_state, $form)
  {
    $input = $element['#value'];

    // validate URL for content types that allow only youtube videos
    $video_id = youtube_get_video_id($input);

    // Get current content type
    $node = \Drupal::routeMatch()->getParameter('node');
    $typeName = $node->bundle();

    // If the content type is news then allow any video URL
    if($typeName === 'news') {
      if (!UrlHelper::isValid($input, TRUE)) {
        $form_state->setErrorByName('video', $this->t("The video url '%url' is invalid.", array('%url' => $input)));
      }
      // Else allow only youtube videos
    } else {
      if ($video_id && strlen($video_id[1]) <= 20) {
        $video_id_element = array(
          '#parents' => $element['#parents'],
        );
        array_pop($video_id_element['#parents']);
        $video_id_element['#parents'][] = 'video_id';
        $form_state->setValueForElement($video_id_element, $video_id[1]);

        array_pop($video_id_element['#parents']);
        $video_id_element['#parents'][] = 'video_domain';
        $form_state->setValueForElement($video_id_element, $video_id[0]);
      }
      elseif (!empty($input)) {
        $form_state->setError($element, t('Please provide a valid YouTube URL.'));
      }
    }
  }
}
