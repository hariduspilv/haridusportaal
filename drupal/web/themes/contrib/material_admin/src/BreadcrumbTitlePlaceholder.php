<?php

namespace Drupal\material_admin;

use Drupal\Core\Security\TrustedCallbackInterface;

class BreadcrumbTitlePlaceholder implements TrustedCallbackInterface {

    /**
     * {@inheritdoc}
     */
    public static function trustedCallbacks() {
        return ['render'];
    }

    /**
     * Return values for the breadcrumb title placeholder.
     *
     * @return array
     *   The render array.
     */
    public static function render() {
        $request = \Drupal::request();
        $route_match = \Drupal::routeMatch();
        $title = \Drupal::service('title_resolver')->getTitle($request, $route_match->getRouteObject());
        return [
            '#theme' => 'page_title__breadcrumb',
            '#title' => $title,
        ];
    }

}
