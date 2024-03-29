<?php

namespace Drupal\htm_custom_entity_autocomplete\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

class AutocompleteRouteSubscriber extends RouteSubscriberBase {

    public function alterRoutes(RouteCollection $collection) {
        if ($route = $collection->get('system.entity_autocomplete')) {
            $route->setDefault('_controller', '\Drupal\htm_custom_entity_autocomplete\Controller\EntityAutocompleteController::handleAutocomplete');
        }
    }

}