<?php

namespace Drupal\htm_custom_contribution_projects\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface;

/**
 * Class ContributionProjectEntityController.
 *
 *  Returns responses for Contribution project routes.
 */
class ContributionProjectEntityController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Displays a Contribution project  revision.
   *
   * @param int $contribution_project_entity_revision
   *   The Contribution project  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($contribution_project_entity_revision) {
    $contribution_project_entity = $this->entityTypeManager()->getStorage('contribution_project_entity')->loadRevision($contribution_project_entity_revision);
    $view_builder = $this->entityTypeManager()->getViewBuilder('contribution_project_entity');

    return $view_builder->view($contribution_project_entity);
  }

  /**
   * Page title callback for a Contribution project  revision.
   *
   * @param int $contribution_project_entity_revision
   *   The Contribution project  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($contribution_project_entity_revision) {
    $contribution_project_entity = $this->entityTypeManager()->getStorage('contribution_project_entity')->loadRevision($contribution_project_entity_revision);
    return $this->t('Revision of %title from %date', ['%title' => $contribution_project_entity->label(), '%date' => format_date($contribution_project_entity->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a Contribution project .
   *
   * @param \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface $contribution_project_entity
   *   A Contribution project  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(ContributionProjectEntityInterface $contribution_project_entity) {
    $account = $this->currentUser();
    $langcode = $contribution_project_entity->language()->getId();
    $langname = $contribution_project_entity->language()->getName();
    $languages = $contribution_project_entity->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $contribution_project_entity_storage = $this->entityTypeManager()->getStorage('contribution_project_entity');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $contribution_project_entity->label()]) : $this->t('Revisions for %title', ['%title' => $contribution_project_entity->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all contribution project revisions") || $account->hasPermission('administer contribution project entities')));
    $delete_permission = (($account->hasPermission("delete all contribution project revisions") || $account->hasPermission('administer contribution project entities')));

    $rows = [];

    $vids = $contribution_project_entity_storage->revisionIds($contribution_project_entity);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\htm_custom_contribution_projects\ContributionProjectEntityInterface $revision */
      $revision = $contribution_project_entity_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $contribution_project_entity->getRevisionId()) {
          $link = $this->l($date, new Url('entity.contribution_project_entity.revision', ['contribution_project_entity' => $contribution_project_entity->id(), 'contribution_project_entity_revision' => $vid]));
        }
        else {
          $link = $contribution_project_entity->link($date);
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
              Url::fromRoute('entity.contribution_project_entity.translation_revert', ['contribution_project_entity' => $contribution_project_entity->id(), 'contribution_project_entity_revision' => $vid, 'langcode' => $langcode]) :
              Url::fromRoute('entity.contribution_project_entity.revision_revert', ['contribution_project_entity' => $contribution_project_entity->id(), 'contribution_project_entity_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.contribution_project_entity.revision_delete', ['contribution_project_entity' => $contribution_project_entity->id(), 'contribution_project_entity_revision' => $vid]),
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

    $build['contribution_project_entity_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
