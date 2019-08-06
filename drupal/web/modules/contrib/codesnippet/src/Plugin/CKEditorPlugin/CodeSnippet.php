<?php

namespace Drupal\codesnippet\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginBase;
use Drupal\ckeditor\CKEditorPluginConfigurableInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\editor\Entity\Editor;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines the "codesnippet" plugin.
 *
 * @CKEditorPlugin(
 *   id = "codesnippet",
 *   label = @Translation("CodeSnippet"),
 *   module = "ckeditor"
 * )
 */
class CodeSnippet extends CKEditorPluginBase implements CKEditorPluginConfigurableInterface {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return base_path() . 'libraries/codesnippet/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    $settings = $editor->getSettings();

    $default_config = \Drupal::config('codesnippet.settings');

    if (!empty($settings['plugins']['codesnippet']['highlight_style'])) {
      $style = $settings['plugins']['codesnippet']['highlight_style'];
    }
    else {
      $style = $default_config->get('style');
    }

    if (!empty($settings['plugins']['codesnippet']['highlight_languages'])) {
      $languages = array_filter($settings['plugins']['codesnippet']['highlight_languages']);
    }
    else {
      $languages = $default_config->get('languages');
    }

    // Before sending along to CKEditor, alpha sort and capitalize the language.
    $languages = array_map(function ($language) {
      return ucwords($language);
    }, $languages);

    asort($languages);

    return [
      'codeSnippet_theme' => $style,
      'codeSnippet_languages' => $languages,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getButtons() {
    return [
      'CodeSnippet' => [
        'label' => $this->t('CodeSnippet'),
        'image' => base_path() . 'libraries/codesnippet/icons/codesnippet.png',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state, Editor $editor) {
    $settings = $editor->getSettings();
    $styles = $this->getStyles();

    $config = \Drupal::config('codesnippet.settings');

    $default_style = $config->get('style');
    $languages = $config->get('languages');
    asort($languages);

    $form['#attached']['library'][] = 'codesnippet/codesnippet.admin';

    $form['highlight_style'] = [
      '#type' => 'select',
      '#title' => 'highlight.js Style',
      '#description' => $this->t('Select a style to apply to all highlighted code snippets. You can preview the styles at @link.', ['@link' => Link::fromTextAndUrl('https://highlightjs.org/static/demo', Url::fromUri('https://highlightjs.org/static/demo/'))->toString()]),
      '#options' => $styles,
      '#default_value' => !empty($settings['plugins']['codesnippet']['highlight_style']) ? $settings['plugins']['codesnippet']['highlight_style'] : $default_style,
    ];

    $form['highlight_languages'] = [
      '#type' => 'checkboxes',
      '#title' => 'Supported Languages',
      '#options' => $languages,
      '#description' => $this->t('Enter languages you want to have as options in the editor dialog. To add a language not in this list, please see the README.txt of this module.'),
      '#default_value' => isset($settings['plugins']['codesnippet']['highlight_languages']) ? $settings['plugins']['codesnippet']['highlight_languages'] : array_map('strtolower', $languages),
    ];

    return $form;
  }

  /**
   * Returns available stylesheets to use for code syntax highlighting.
   */
  private function getStyles() {
    $styles = preg_grep('/\.css/', scandir(DRUPAL_ROOT . '/libraries/codesnippet/lib/highlight/styles'));
    $style_options = [];

    foreach ($styles as $stylesheet) {
      $name = str_replace('.css', '', $stylesheet);
      $style_options[$name] = $name;
    }

    return $style_options;
  }

}
