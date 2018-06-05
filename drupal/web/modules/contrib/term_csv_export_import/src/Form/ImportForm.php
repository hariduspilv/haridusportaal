<?php

namespace Drupal\term_csv_export_import\Form;

use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\term_csv_export_import\Controller\ImportController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\VocabularyStorageInterface;

/**
 * Class ImportForm.
 *
 * @package Drupal\term_csv_export_import\Form
 */
class ImportForm extends FormBase implements FormInterface {
  /**
   * Set a var to make stepthrough form.
   *
   * @var step
   */
  protected $step = 1;

  /**
   * Keep track of user input.
   *
   * @var userInput
   */
  protected $userInput = [];

  /**
   * The vocabulary storage.
   *
   * @var \Drupal\taxonomy\VocabularyStorageInterface
   */
  protected $vocabularyStorage;

  /**
   * Constructs a new vocabulary form.
   *
   * @param \Drupal\taxonomy\VocabularyStorageInterface $vocabulary_storage
   *   The vocabulary storage.
   */
  public function __construct(VocabularyStorageInterface $vocabulary_storage) {
    $this->vocabularyStorage = $vocabulary_storage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity.manager')->getStorage('taxonomy_vocabulary')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#title'] = $this->t('CSV Term Import');
    switch ($this->step) {
      case 1:
        $form['input'] = [
          '#type' => 'textarea',
          '#title' => $this->t('Input'),
          '#description' => $this->t('<p><strong>See CSV Export for an example.</strong></p><p>Enter in the form of: <pre>"name,description,format,weight,parent_name,[any_additional_fields];</pre><pre>name,description,format,weight,parent_name[;parent_name1;parent_name2;...],[any_additional_fields]"</pre> or <pre>"tid,uuid,name,description,format,weight,parent_name[;parent_name1;parent_name2;...],parent_tid[;parent_tid1;parent_tid2;...],[any_additional_fields];</pre><pre>tid,uuid,name,description,format,weight,parent_name,parent_tid,[any_additional_fields]"</pre> Note that <em>[any_additional_fields]</em> are optional and are stringified using <a href="http://www.php.net/http_build_query">http_build_query</a>.</p>'),
        ];
        $vocabularies = taxonomy_vocabulary_get_names();
        $vocabularies['create_new'] = 'create_new';
        $form['vocabulary'] = [
          '#type' => 'select',
          '#title' => $this->t('Taxonomy'),
          '#options' => $vocabularies,
        ];
        $value = $this->t('Next');
        break;

      case 2:
        $form['name'] = [
          '#type' => 'textfield',
          '#title' => $this->t('Name'),
          '#maxlength' => 255,
          '#required' => TRUE,
        ];
        $form['vid'] = [
          '#type' => 'machine_name',
          '#maxlength' => EntityTypeInterface::BUNDLE_MAX_LENGTH,
          '#machine_name' => [
            'exists' => [$this, 'exists'],
            'source' => ['name'],
          ],
        ];
        $form['#title'] .= ' - ' . $this->t('Create New Vocabulary');
        $value = $this->t('Create Vocabulary');
        break;

      case 3:
        $form['#title'] .= ' - ' . $this->t('Are you sure you want to copy @count_terms terms into the vocabulary @vocabulary?',
                                     [
                                       '@count_terms' => count(array_filter(preg_split('/\r\n|\r|\n/', $this->userInput['input']))) - 1,
                                       '@vocabulary' => $this->userInput['vocabulary'],
                                     ]);
        $value = $this->t('Import');
        break;
    }
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $value,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    switch ($this->step) {
      case 1:
        if ($form_state->getValue('vocabulary') != 'create_new') {
          $this->step++;
          $this->userInput['vocabulary'] = $form_state->getValue('vocabulary');
        }
        $this->userInput['input'] = $form_state->getValue('input');
        $form_state->setRebuild();
        break;

      case 2:
        $this->vocabulary = $this->createVocab($form_state->getValue('vid'), $form_state->getValue('name'));
        $this->userInput['vocabulary'] = $this->vocabulary;
        $form_state->setRebuild();
        break;

      case 3:
        $import = new ImportController(
        $this->userInput['input'],
        $this->userInput['vocabulary']
        );
        $import->execute();
        break;
    }
    $this->step++;
  }

  /**
   * {@inheritdoc}
   */
  public function createVocab($vid, $name) {
    $vocabulary = Vocabulary::create([
      'vid' => $vid,
      'machine_name' => $vid,
      'name' => $name,
    ]);
    $vocabulary->save();
    return $vocabulary->id();
  }

  /**
   * Determines if the vocabulary already exists.
   *
   * @param string $vid
   *   The vocabulary ID.
   *
   * @return bool
   *   TRUE if the vocabulary exists, FALSE otherwise.
   */
  public function exists($vid) {
    $action = $this->vocabularyStorage->load($vid);
    return !empty($action);
  }

}
