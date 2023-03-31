<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_translations_new\translationHelper;

/**
 * Class TranslationFormList.
 */
class TranslationFormList extends ConfigFormBase {
	public function __construct(ConfigFactoryInterface $config_factory)
	{
		parent::__construct($config_factory);
		$this->formatter = new translationHelper();
    $this->pagerManager = \Drupal::service('pager.manager');
	}

	/**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'htm_custom_translations_new.translation',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'translation_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('htm_custom_translations_new.translation');

		$config_values = $config->get();
    $state_keys = \Drupal::state()->get('translation_keys');
    $header = [
    	'key' => $this->t('Translation key'),
			'translation_languages' => $this->t('Languages'),
			'translation_value' => $this->t('Translation'),
			'operations' => $this->t('Operations'),
		];
    $form['#method'] = 'GET';
    $form['filters']['key'] = [
      '#type' => 'textfield',
      '#title' => 'Key otsing'
    ];
    $form['filters']['term'] = [
      '#type' => 'textfield',
      '#title' => 'Tõlke otsing'
    ];
    $form['actions']['search'] = [
      '#type' => 'submit',
      '#value' => t('Search'),
    ];
    $form['table'] = [
			'#type' => 'table',
			'#header' => $header,
			'#empty' => t('No translations found. <a href="@add-url">Add translation.</a>', [
					'@add-url' => Url::fromRoute('htm_custom_translations_new.add_translation')->toString(),
			]),

		];
    $form['pager'] = [
      '#type' => 'pager',
      '#theme' => 'pager'
    ];
   $page =  $this->getRequest()->get('page');
   $key =  $this->getRequest()->get('key');
   $term =  $this->getRequest()->get('term');
   if (!empty($key)) {
     $form['filters']['key']['#default_value'] = $key;
     $state_keys = $this->filterKeys($key,$state_keys);
   }
   if (!empty($term)) {
     $form['filters']['term']['#default_value'] = $term;
     $state_keys = $this->filterTranslations($term,$state_keys);
   }
   $paged_state_keys = $this->pagerArray($state_keys,50);
    $languages = \Drupal::languageManager()->getLanguages();
    $rows = [];
    foreach ($paged_state_keys as $state_key => $state_key_value){
      $translation_type = 'textfield';
      $form['table'][$state_key]['key'] = [
        '#plain_text' => str_replace('htm_translations.','',$state_key)
      ];
      foreach ($languages as $language) {
        $form['table'][$state_key]['translation_languages'][] = [
          '#type' => 'item',
          '#title' => $language->getId(),
        ];
      foreach ($state_key_value as $state_translation) {
        if (str_contains($state_translation,'translation_type')) {
          $translation_type = \Drupal::state()->get($state_translation);
        }
        else {
          if (str_contains($state_translation, '.' . $language->getId())) {
            $translation_value = \Drupal::state()->get($state_translation);
            if (is_array($translation_value)) {
              $translation_value = $translation_value['value'];
            }

            $form['table'][$state_key]['translation_value'][] = [
              '#type' => 'item',
              '#title' => !empty($translation_value) ? $translation_value : 'MISSING',
            ];
          }
        }
        }
      }

      $form['table'][$state_key]['operations'] = [
        '#type' => 'operations',
       '#links' => []
      ];
      $form['table'][$state_key]['operations']['#links']['edit'] = [
        'title' => $this->t('Edit'),
        'url' => Url::fromRoute('htm_custom_translations_new.edit_translation', ['translation_key' => $state_key, 'translation_type'=>$translation_type]),
      ];
      $form['table'][$state_key]['operations']['#links']['delete'] = [
        'title' => $this->t('Delete'),
        'url' => Url::fromRoute('htm_custom_translations_new.delete_translation', ['translation_key' => $state_key, 'translation_type'=>$translation_type]),
      ];

    }
//    dump($rows);
//    exit();
//    return $form;

//    $languages = \Drupal::languageManager()->getLanguages();
//		$mapped_config = $this->formatter->flatten($config_values);
//    $form['table2'] = [
//      '#type' => 'table',
//      '#header' => $header,
//      '#empty' => t('No translations found. <a href="@add-url">Add translation.</a>', [
//        '@add-url' => Url::fromRoute('htm_custom_translations_new.add_translation')->toString(),
//      ]),
//    ];
//    foreach($mapped_config as $key => $data){
//
//	    if($key === 'langcode') continue;
//
//			$form['table2'][$key]['key'] = [
//				'#plain_text' => $key,
//			];
//			foreach($languages as $lang_key => $value){
//				$form['table2'][$key]['translation_languages'][] = [
//					'#type' => 'item',
//					'#title' => $lang_key,
//				];
//				$translation_value = (is_array($data[$lang_key]))? $data[$lang_key]['value'] : $data[$lang_key];
//				$form['table2'][$key]['translation_value'][] = [
//					'#type' => 'item',
//					'#title' => ($translation_value) ? $translation_value : 'MISSING',
//				];
//			}
//
//			$form['table2'][$key]['operations'] = [
//				'#type' => 'operations',
//				'#links' => []
//			];
//			$form['table2'][$key]['operations']['#links']['edit'] = [
//				'title' => $this->t('Edit'),
//				'url' => Url::fromRoute('htm_custom_translations_new.edit_translation', ['translation_key' => $key]),
//			];
//			$form['table2'][$key]['operations']['#links']['delete'] = [
//				'title' => $this->t('Delete'),
//				'url' => Url::fromRoute('htm_custom_translations_new.delete_translation', ['translation_key' => $key]),
//			];
//
//		}
    $form['#cache']['tags'] = ['config:htm_custom_translations_new.translation'];
    return $form;
  }
  /**
   * Returns pager array.
   */
  public function pagerArray($items, $itemsPerPage) {
    // Get total items count.
    $total = count($items);
    // Get the number of the current page.
    $currentPage = $this->pagerManager->createPager($total, $itemsPerPage)->getCurrentPage();
    // Split an array into chunks.
    $chunks = array_chunk($items, $itemsPerPage,TRUE);
    // Return current group item.
    $currentPageItems = $chunks[$currentPage];
    return $currentPageItems;
  }
  private function filterKeys($key,$keys) {
    $output = [];
    foreach ($keys as $state_key => $state_key_values){
      if (str_contains($state_key,'htm_translations.'.$key)) {
        $output[$state_key] = $state_key_values;
      }
    }
    return $output;
  }
  private function filterTranslations($term,$keys) {
    $output = [];
    foreach ($keys as $state_key => $state_value) {
      foreach ($state_value as $translation_key){
        $state_translation = \Drupal::state()->get($translation_key);
        if (is_array($state_translation)) {
          $state_translation = $state_translation['value'];
        }
        if (str_contains($state_translation,$term)){
          $output[$state_key] = $state_value;
        }
      }
    }
    return $output;

  }

}
