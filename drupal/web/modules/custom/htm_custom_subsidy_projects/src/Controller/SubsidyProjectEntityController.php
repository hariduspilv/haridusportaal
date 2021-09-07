<?php

namespace Drupal\htm_custom_subsidy_projects\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface;

/**
 * Class SubsidyProjectEntityController.
 *
 *  Returns responses for Subsidy project routes.
 */
class SubsidyProjectEntityController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Displays a Subsidy project  revision.
   *
   * @param int $subsidy_project_entity_revision
   *   The Subsidy project  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($subsidy_project_entity_revision) {
    $subsidy_project_entity = $this->entityTypeManager()->getStorage('subsidy_project_entity')->loadRevision($subsidy_project_entity_revision);
    $view_builder = $this->entityTypeManager()->getViewBuilder('subsidy_project_entity');

    return $view_builder->view($subsidy_project_entity);
  }

  /**
   * Page title callback for a Subsidy project  revision.
   *
   * @param int $subsidy_project_entity_revision
   *   The Subsidy project  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($subsidy_project_entity_revision) {
    $subsidy_project_entity = $this->entityTypeManager()->getStorage('subsidy_project_entity')->loadRevision($subsidy_project_entity_revision);
    return $this->t('Revision of %title from %date', ['%title' => $subsidy_project_entity->label(), '%date' => format_date($subsidy_project_entity->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a Subsidy project .
   *
   * @param \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface $subsidy_project_entity
   *   A Subsidy project  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(SubsidyProjectEntityInterface $subsidy_project_entity) {
    $account = $this->currentUser();
    $langcode = $subsidy_project_entity->language()->getId();
    $langname = $subsidy_project_entity->language()->getName();
    $languages = $subsidy_project_entity->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $subsidy_project_entity_storage = $this->entityTypeManager()->getStorage('subsidy_project_entity');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $subsidy_project_entity->label()]) : $this->t('Revisions for %title', ['%title' => $subsidy_project_entity->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all subsidy project revisions") || $account->hasPermission('administer subsidy project entities')));
    $delete_permission = (($account->hasPermission("delete all subsidy project revisions") || $account->hasPermission('administer subsidy project entities')));

    $rows = [];

    $vids = $subsidy_project_entity_storage->revisionIds($subsidy_project_entity);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\htm_custom_subsidy_projects\SubsidyProjectEntityInterface $revision */
      $revision = $subsidy_project_entity_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $subsidy_project_entity->getRevisionId()) {
          $link = $this->l($date, new Url('entity.subsidy_project_entity.revision', ['subsidy_project_entity' => $subsidy_project_entity->id(), 'subsidy_project_entity_revision' => $vid]));
        }
        else {
          $link = $subsidy_project_entity->link($date);
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
              Url::fromRoute('entity.subsidy_project_entity.translation_revert', ['subsidy_project_entity' => $subsidy_project_entity->id(), 'subsidy_project_entity_revision' => $vid, 'langcode' => $langcode]) :
              Url::fromRoute('entity.subsidy_project_entity.revision_revert', ['subsidy_project_entity' => $subsidy_project_entity->id(), 'subsidy_project_entity_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.subsidy_project_entity.revision_delete', ['subsidy_project_entity' => $subsidy_project_entity->id(), 'subsidy_project_entity_revision' => $vid]),
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

    $build['subsidy_project_entity_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
