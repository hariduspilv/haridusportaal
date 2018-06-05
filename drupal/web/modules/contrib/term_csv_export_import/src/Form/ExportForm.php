<?php

namespace Drupal\term_csv_export_import\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\term_csv_export_import\Controller\ExportController;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ExportForm.
 *
 * @package Drupal\term_csv_export_import\Form
 */
class ExportForm extends FormBase {
  /**
   * Set a var to make stepthrough form.
   *
   * @var step
   */
  protected $step = 1;

  /**
   * Set a var for export values.
   *
   * @var getExport
   */
  protected $getExport = '';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'export_form';
  }

  /**
   * {@inheritdoc}
   */
   protected $container;

  /**
   * {@inheritdoc}
   */
  public function __construct(ContainerInterface $container) {
    $this->container = $container;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container);
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    switch ($this->step) {
      case 1:
        $form['vocabulary'] = [
          '#type' => 'select',
          '#title' => $this->t('Taxonomy'),
          '#options' => taxonomy_vocabulary_get_names(),
        ];
        $form['include_ids'] = [
          '#type' => 'checkbox',
          '#title' => $this->t('Include Term Ids in export.'),
        ];
        $form['include_headers'] = [
          '#type' => 'checkbox',
          '#title' => $this->t('Include Term Headers in export.'),
        ];
        $form['include_additional_fields'] = [
          '#type' => 'checkbox',
          '#title' => $this->t('Include extra fields in export.'),
          '#description' => $this->t('Note that fields are stringified using <a href="http://www.php.net/http_build_query">http_build_query</a>'),
        ];
        $form['submit'] = [
          '#type' => 'submit',
          '#value' => $this->t('Export'),

        ];
        break;

      case 2:
        $form['input'] = [
          '#type' => 'textarea',
          '#title' => $this->t('CSV Data'),
          '#description' => $this->t('The formatted term data'),
          '#value' => $this->getExport,
        ];
        break;
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->step++;
    $export = new ExportController(
      $this->container->get('entity_type.manager')->getStorage('taxonomy_term'),
      $form_state->getValue('vocabulary')
    );
    $this->getExport = $export->execute($form_state->getValue('include_ids'), $form_state->getValue('include_headers'), $form_state->getValue('include_additional_fields'));
    $form_state->setRebuild();
  }

}
