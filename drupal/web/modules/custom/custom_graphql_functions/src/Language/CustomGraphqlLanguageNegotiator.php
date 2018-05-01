<?php

namespace Drupal\custom_graphql_functions\Language;

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
	public function __construct($language_manager, $negotiator_manager, $config_factory, $settings, $requestStack, AccountInterface $current_user) {
		parent::__construct($language_manager, $negotiator_manager, $config_factory, $settings, $requestStack);
		$this->currentUser = $current_user;
	}

	/**
	 * {@inheritdoc}
	 */
	/*public static function create(ContainerInterface $container, $language_manager, $negotiator_manager, $config_factory, $requestStack) {
		return new static(
				$language_manager,
				$negotiator_manager,
				$config_factory,
				$requestStack,
				$container->get('current_user')
		);
	}*/


	/**
   * {@inheritdoc}
   */
  public function initializeType($type) {
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

    return array($method_id => $language);
  }

  /**
   * @param string $languageCode
   */
  public function setLanguageCode($languageCode) {
    $this->languageCode = $languageCode;
  }
}