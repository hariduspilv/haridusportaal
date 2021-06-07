<?php

namespace Drupal\sitemap\Plugin\Sitemap;

use Drupal\sitemap\SitemapBase;
use Drupal\Core\Url;
use Drupal\Core\Template\Attribute;
use Drupal\Core\Link;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a link to the front page for the sitemap.
 *
 * @Sitemap(
 *   id = "frontpage",
 *   title = @Translation("Site front page"),
 *   description = @Translation("Displays a sitemap link for the site front page."),
 *   settings = {
 *     "title" = "Front page",
 *     "rss" = "/rss.xml",
 *   },
 *   enabled = TRUE,
 * )
 */
class Frontpage extends SitemapBase {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    // Provide a default title.
    $form['title']['#default_value'] = $this->settings['title'] ?: $this->t('Front page');

    //@TODO: Convert to route instead of relative html path.
    $form['rss'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Feed URL'),
      '#default_value' => $this->settings['rss'],
      '#description' => $this->t('Specify the RSS feed for the front page. If you do not wish to display a feed, leave this field blank.'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function view() {
    $title = $this->settings['title'];

    $content[] = [
      '#theme' => 'sitemap_frontpage_item',
      '#text' => $this->t('Front page of %sn', ['%sn' => \Drupal::config('system.site')->get('name')]),
      '#url' => Url::fromRoute('<front>', [], ['html' => TRUE])->toString(),
      '#feed' => $this->settings['rss'],
    ];

    return [
      '#theme' => 'sitemap_item',
      '#title' => $title,
      '#content' => $content,
      '#sitemap' => $this,
    ];
  }

}
