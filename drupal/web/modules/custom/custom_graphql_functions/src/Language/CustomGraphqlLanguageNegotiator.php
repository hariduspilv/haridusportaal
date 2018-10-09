<?php

namespace Drupal\custom_graphql_functions\Language;

use Drupal\graphql\GraphQLLanguageContext;
use Drupal\language\LanguageNegotiator;
use Drupal\Core\Session\AccountInterface;

/**
 * Custom language negotiator. used in the overriden Menu graphql fields to set the site language to retrieve translated menu links.
 *
 * Class responsible for performing language negotiation.
 */
class CustomGraphqlLanguageNegotiator extends LanguageNegotiator {

	/**
	 * The current active user.
	 *
	 * @var \Drupal\Core\Session\AccountInterface
	 */
	protected $currentUser;

	/**
	 * The graphql language context.
	 *
	 * @var \Drupal\graphql\GraphQLLanguageContext
	 */
	protected $languageContext;

	var $languageCode = NULL;

	/**
	 * Constructs a new LanguageNegotiator object.
	 *
	 * @param \Drupal\language\ConfigurableLanguageManagerInterface $language_manager
	 *   The language manager.
	 * @param \Drupal\Component\Plugin\PluginManagerInterface $negotiator_manager
	 *   The language negotiation methods plugin manager
	 * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
	 *   The configuration factory.
	 * @param \Drupal\Core\Site\Settings $settings
	 *   The settings instance.
	 * @param \Drupal\Core\Session\AccountInterface $current_user
	 *   The user instance.
	 */
	public function __construct($language_manager, $negotiator_manager, $config_factory, $settings, $requestStack, AccountInterface $current_user, GraphQLLanguageContext $languageContext) {
		parent::__construct($language_manager, $negotiator_manager, $config_factory, $settings, $requestStack);
		$this->currentUser = $current_user;
		$this->languageContext = $languageContext;
	}

	/**
   * {@inheritdoc}
   */
  public function initializeType($type) {

		$request = $this->requestStack->getCurrentRequest();
		if($request->attributes->get('_graphql') || $request->attributes->get('_graphql_subrequest')){
			$this->languageCode = $this->languageContext->getCurrentLanguage();
			$language = NULL;
			$method_id = static::METHOD_ID;
			$availableLanguages = $this->languageManager->getLanguages();

			if ($this->languageCode && isset($availableLanguages[$this->languageCode])) {
				$language = $availableLanguages[$this->languageCode];
			}

			if (!$language) {
				// If no other language was found use the default one.
				$language = $this->languageManager->getDefaultLanguage();
				$method_id = static::METHOD_ID;
			}
			return [$method_id => $language];
		}else{
  		return parent::initializeType($type);
		}





  }

  /**
   * @param string $languageCode
   */
  public function setLanguageCode($languageCode) {
    $this->languageCode = $languageCode;
  }
}