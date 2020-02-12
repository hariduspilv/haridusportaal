<?php

namespace Drupal\htm_custom_admin\EventSubscriber;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\PostResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AdminSubscriber implements EventSubscriberInterface {

  public function checkForRedirection($event) {
    $safePaths = [
      '/user/login',
      '/user'
    ];
    if(!in_array($event->getRequest()->getPathInfo(), $safePaths) && \Drupal::currentUser()->isAnonymous()){
        $fe_url = \Drupal::config('htm_custom_admin_form.customadmin')->get('general.fe_url');
        $response = new RedirectResponse($fe_url);
        $response->send();
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = array('checkForRedirection');
    return $events;
  }

}
