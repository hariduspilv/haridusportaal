<?php

namespace Drupal\custom_subscription_administration\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface;

/**
 * Class SubscriptionEntityController.
 *
 *  Returns responses for Subscription entity routes.
 */
class SubscriptionEntityController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Displays a Subscription entity  revision.
   *
   * @param int $subscription_entity_revision
   *   The Subscription entity  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($subscription_entity_revision) {
    $subscription_entity = $this->entityManager()->getStorage('subscription_entity')->loadRevision($subscription_entity_revision);
    $view_builder = $this->entityManager()->getViewBuilder('subscription_entity');

    return $view_builder->view($subscription_entity);
  }

  /**
   * Page title callback for a Subscription entity  revision.
   *
   * @param int $subscription_entity_revision
   *   The Subscription entity  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($subscription_entity_revision) {
    $subscription_entity = $this->entityManager()->getStorage('subscription_entity')->loadRevision($subscription_entity_revision);
    return $this->t('Revision of %title from %date', ['%title' => $subscription_entity->label(), '%date' => format_date($subscription_entity->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a Subscription entity .
   *
   * @param \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface $subscription_entity
   *   A Subscription entity  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(SubscriptionEntityInterface $subscription_entity) {
    $account = $this->currentUser();
    $langcode = $subscription_entity->language()->getId();
    $langname = $subscription_entity->language()->getName();
    $languages = $subscription_entity->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $subscription_entity_storage = $this->entityManager()->getStorage('subscription_entity');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $subscription_entity->label()]) : $this->t('Revisions for %title', ['%title' => $subscription_entity->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all subscription entity revisions") || $account->hasPermission('administer subscription entity entities')));
    $delete_permission = (($account->hasPermission("delete all subscription entity revisions") || $account->hasPermission('administer subscription entity entities')));

    $rows = [];

    $vids = $subscription_entity_storage->revisionIds($subscription_entity);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\custom_subscription_administration\SubscriptionEntityInterface $revision */
      $revision = $subscription_entity_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $subscription_entity->getRevisionId()) {
          $link = $this->l($date, new Url('entity.subscription_entity.revision', ['subscription_entity' => $subscription_entity->id(), 'subscription_entity_revision' => $vid]));
        }
        else {
          $link = $subscription_entity->link($date);
        }

        $row = [];
        $column = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '{% trans %}{{ date }} by {{ username }}{% endtrans %}{% if message %}<p class="revision-log">{{ message }}</p>{% endif %}',
            '#context' => [
              'date' => $link,
              'username' => \Drupal::service('renderer')->renderPlain($username),
              'message' => ['#markup' => $revision->getRevisionLogMessage(), '#allowed_tags' => Xss::getHtmlTagList()],
            ],
          ],
        ];
        $row[] = $column;

        if ($latest_revision) {
          $row[] = [
            'data' => [
              '#prefix' => '<em>',
              '#markup' => $this->t('Current revision'),
              '#suffix' => '</em>',
            ],
          ];
          foreach ($row as &$current) {
            $current['class'] = ['revision-current'];
          }
          $latest_revision = FALSE;
        }
        else {
          $links = [];
          if ($revert_permission) {
            $links['revert'] = [
              'title' => $this->t('Revert'),
              'url' => $has_translations ?
              Url::fromRoute('entity.subscription_entity.translation_revert', ['subscription_entity' => $subscription_entity->id(), 'subscription_entity_revision' => $vid, 'langcode' => $langcode]) :
              Url::fromRoute('entity.subscription_entity.revision_revert', ['subscription_entity' => $subscription_entity->id(), 'subscription_entity_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.subscription_entity.revision_delete', ['subscription_entity' => $subscription_entity->id(), 'subscription_entity_revision' => $vid]),
            ];
          }

          $row[] = [
            'data' => [
              '#type' => 'operations',
              '#links' => $links,
            ],
          ];
        }

        $rows[] = $row;
      }
    }

    $build['subscription_entity_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
