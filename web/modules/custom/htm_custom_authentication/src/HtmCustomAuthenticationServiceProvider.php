<?php
namespace Drupal\htm_custom_authentication;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\Core\DependencyInjection\ServiceProviderInterface;
use Symfony\Component\DependencyInjection\Reference;

class HtmCustomAuthenticationServiceProvider extends ServiceProviderBase implements ServiceProviderInterface{
	public function alter(ContainerBuilder $container)
	{
		if ($container->hasDefinition('jwt.authentication.jwt')) {
			$container->getDefinition('jwt.authentication.jwt')
					->setClass('Drupal\htm_custom_authentication\Authentication\Provider\CustomJwtAuth');
					/*->setArguments(
							[
									new Reference('entity_type.manager'),
									new Reference('jwt.transcoder'),
									new Reference('event_dispatcher')
							]
					);*/
		}
	}

}