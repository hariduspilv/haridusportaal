<?php

namespace Drupal\htm_custom_translations_new\Plugin\rest\resource;

use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "translations_rest_resource",
 *   label = @Translation("Translations rest resource"),
 *   uri_paths = {
 *     "canonical" = "translations"
 *   }
 * )
 */
class TranslationsNewRestResource extends ResourceBase {

	/**
	 * The language manager.
	 *
	 * @var \Drupal\Core\Language\LanguageManagerInterface
	 */
	protected $languageManager;
  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new BaseSettingsRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
		LanguageManagerInterface $languageManager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->languageManager = $languageManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('graphql_custom_translation'),
      $container->get('current_user'),
			$container->get('language_manager')
    );
  }

  /**
   * Responds to GET requests.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {
		$config = \Drupal::config('htm_custom_translations_new.translation');
		$values = $config->get();
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $current_lang = $this->languageManager->getCurrentLanguage()->getId();
    $state_values= $this->getStateValues();
		$values = $this->flatten($values, '', $current_lang);
		$response = new ResourceResponse($state_values, 200);
    $response->addCacheableDependency($config);

    return $response;
  }

	private function flatten($array, $prefix = '', $lang_code) {
		$result = array();
		foreach($array as $key => $value) {
			if($key === 'langcode') continue;
			if(is_array($value) && !isset($value['translation_type'])) {
				$result[$key] = $this->flatten($value, $key, $lang_code);
			}
			else {
				$translation_value = ($value['translation_type'] === 'text_format') ? $value[$lang_code]['value'] : $value[$lang_code];
				$result[$key] = $translation_value;
			}
		}
		#dump($result);
		return $result;
	}
  private function getStateValues(){
    $state_keys = \Drupal::state()->get('translation_keys');
    $lang = $this->languageManager->getCurrentLanguage()->getId();
    $values = [];
    foreach ($state_keys as $state_key => $state_key_value) {
      $state_val = \Drupal::state()->get($state_key.'.'.$lang);
      if (!empty($state_val)) {
        $values[$state_key] = $state_val;
      }
    }
    $output= [];
    foreach ($values as $value_key => $value) {
      $value_field = '';
      $context = '';
     $value_key = str_replace('htm_translations.','',$value_key);
     $value_key_exploded = explode('.',$value_key);
     if (!empty($value_key_exploded[0])){
       $context = $value_key_exploded[0];
     }
     if (!empty($value_key_exploded[1])){
       $value_field = $value_key_exploded[1];
     }
     if (!empty($context) && !empty($value_field)) {
       $output[$context][$value_field] = $value;
     }
     elseif (!empty($context) && empty($value_field)) {
       $output[$context] = $value;
     }
    }
    return $output;
  }
}
