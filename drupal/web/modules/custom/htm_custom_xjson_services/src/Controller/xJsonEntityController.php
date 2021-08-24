<?php

namespace Drupal\htm_custom_xjson_services\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface;

/**
 * Class xJsonEntityController.
 *
 *  Returns responses for xJson entity routes.
 */
class xJsonEntityController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Displays a xJson entity  revision.
   *
   * @param int $x_json_entity_revision
   *   The xJson entity  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($x_json_entity_revision) {
    $x_json_entity = $this->entityTypeManager()->getStorage('x_json_entity')->loadRevision($x_json_entity_revision);
    $view_builder = $this->entityTypeManager()->getViewBuilder('x_json_entity');

    return $view_builder->view($x_json_entity);
  }

  /**
   * Page title callback for a xJson entity  revision.
   *
   * @param int $x_json_entity_revision
   *   The xJson entity  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($x_json_entity_revision) {
    $x_json_entity = $this->entityTypeManager()->getStorage('x_json_entity')->loadRevision($x_json_entity_revision);
    return $this->t('Revision of %title from %date', ['%title' => $x_json_entity->label(), '%date' => format_date($x_json_entity->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a xJson entity .
   *
   * @param \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface $x_json_entity
   *   A xJson entity  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(xJsonEntityInterface $x_json_entity) {
    $account = $this->currentUser();
    $langcode = $x_json_entity->language()->getId();
    $langname = $x_json_entity->language()->getName();
    $languages = $x_json_entity->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $x_json_entity_storage = $this->entityTypeManager()->getStorage('x_json_entity');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $x_json_entity->label()]) : $this->t('Revisions for %title', ['%title' => $x_json_entity->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all xjson entity revisions") || $account->hasPermission('administer xjson entity entities')));
    $delete_permission = (($account->hasPermission("delete all xjson entity revisions") || $account->hasPermission('administer xjson entity entities')));

    $rows = [];

    $vids = $x_json_entity_storage->revisionIds($x_json_entity);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\htm_custom_xjson_services\xJsonEntityInterface $revision */
      $revision = $x_json_entity_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $x_json_entity->getRevisionId()) {
          $link = $this->l($date, new Url('entity.x_json_entity.revision', ['x_json_entity' => $x_json_entity->id(), 'x_json_entity_revision' => $vid]));
        }
        else {
          $link = $x_json_entity->link($date);
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
              'url' => Url::fromRoute('entity.x_json_entity.revision_revert', ['x_json_entity' => $x_json_entity->id(), 'x_json_entity_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.x_json_entity.revision_delete', ['x_json_entity' => $x_json_entity->id(), 'x_json_entity_revision' => $vid]),
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

    $build['x_json_entity_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
