<?php

namespace Drupal\editor_file\Form;

use Drupal\Component\Utility\Bytes;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\BaseFormIdInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\filter\Entity\FilterFormat;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\editor\Ajax\EditorDialogSave;
use Drupal\Core\Ajax\CloseModalDialogCommand;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Component\Utility\Environment;

/**
 * Provides a link dialog for text editors.
 */
class EditorFileDialog extends FormBase implements BaseFormIdInterface {

  /**
   * The file storage service.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $fileStorage;

  /**
   * The entity repository service.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs a form object for image dialog.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $file_storage
   *   The file storage service.
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $entity_repository
   *   The entity repository service.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   */
  public function __construct(EntityStorageInterface $file_storage, EntityRepositoryInterface $entity_repository, RendererInterface $renderer) {
    $this->fileStorage = $file_storage;
    $this->entityRepository = $entity_repository;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')->getStorage('file'),
      $container->get('entity.repository'),
      $container->get('renderer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'editor_file_dialog';
  }

  /**
   * {@inheritdoc}
   */
  public function getBaseFormId() {
    // Use the EditorLinkDialog form id to ease alteration.
    return 'editor_link_dialog';
  }

  /**
   * {@inheritdoc}
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\filter\Entity\FilterFormat $filter_format
   *   The filter format for which this dialog corresponds.
   *
   * @return array
   *   The form structure.
   */
  public function buildForm(array $form, FormStateInterface $form_state, FilterFormat $filter_format = NULL) {
    // This form is special, in that the default values do not come from the
    // server side, but from the client side, from a text editor. We must cache
    // this data in form state, because when the form is rebuilt, we will be
    // receiving values from the form, instead of the values from the text
    // editor. If we don't cache it, this data will be lost.
    if (isset($form_state->getUserInput()['editor_object'])) {
      // By convention, the data that the text editor sends to any dialog is in
      // the 'editor_object' key. And the image dialog for text editors expects
      // that data to be the attributes for an <img> element.
      $file_element = $form_state->getUserInput()['editor_object'];
      $form_state->set('file_element', $file_element);
      $form_state->setCached(TRUE);
    }
    else {
      // Retrieve the image element's attributes from form state.
      $file_element = $form_state->get('file_element') ?: [];
    }

    $form['#tree'] = TRUE;
    $form['#attached']['library'][] = 'editor/drupal.editor.dialog';
    $form['#prefix'] = '<div id="editor-file-dialog-form">';
    $form['#suffix'] = '</div>';

    // Load dialog settings.
    $editor = editor_load($filter_format->id());
    $file_upload = $editor->getThirdPartySettings('editor_file');
    $max_filesize = isset($file_upload['max_size']) ? min(Bytes::toInt($file_upload['max_size']), Environment::getUploadMaxSize()) : Environment::getUploadMaxSize();

    $existing_file = isset($file_element['data-entity-uuid']) ? $this->entityRepository->loadEntityByUuid('file', $file_element['data-entity-uuid']) : NULL;
    $fid = $existing_file ? $existing_file->id() : NULL;

    $form['fid'] = [
      '#title' => $this->t('File'),
      '#type' => 'managed_file',
      '#upload_location' => $file_upload['scheme'] . '://' . $file_upload['directory'],
      '#default_value' => $fid ? [$fid] : NULL,
      '#upload_validators' => [
        'file_validate_extensions' => !empty($file_upload['extensions']) ? [$file_upload['extensions']] : ['txt'],
        'file_validate_size' => [$max_filesize],
      ],
      '#required' => TRUE,
    ];

    $file_upload_help = [
      '#theme' => 'file_upload_help',
      '#description' => '',
      '#upload_validators' => $form['fid']['#upload_validators'],
      '#cardinality' => 1,
    ];
    $form['fid']['#description'] = $this->renderer->renderPlain($file_upload_help);

    $form['attributes']['href'] = [
      '#title' => $this->t('URL'),
      '#type' => 'textfield',
      '#default_value' => isset($file_element['href']) ? $file_element['href'] : '',
      '#maxlength' => 2048,
      '#required' => TRUE,
    ];

    if ($file_upload['status']) {
      $form['attributes']['href']['#access'] = FALSE;
      $form['attributes']['href']['#required'] = FALSE;
    }
    else {
      $form['fid']['#access'] = FALSE;
      $form['fid']['#required'] = FALSE;
    }

    $form['actions'] = [
      '#type' => 'actions',
    ];
    $form['actions']['save_modal'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
      // No regular submit-handler. This form only works via JavaScript.
      '#submit' => [],
      '#ajax' => [
        'callback' => '::submitForm',
        'event' => 'click',
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();

    // Convert any uploaded files from the FID values to data-entity-uuid
    // attributes and set data-entity-type to 'file'.
    $fid = $form_state->getValue(['fid', 0]);
    if (!empty($fid)) {
      $file = $this->fileStorage->load($fid);
      $file_url = file_create_url($file->getFileUri());
      // Transform absolute file URLs to relative file URLs: prevent problems
      // on multisite set-ups and prevent mixed content errors.
      $file_url = file_url_transform_relative($file_url);
      $form_state->setValue(['attributes', 'href'], $file_url);
      $form_state->setValue(['attributes', 'filename'], urldecode(basename($file_url)));
      $form_state->setValue(['attributes', 'data-entity-uuid'], $file->uuid());
      $form_state->setValue(['attributes', 'data-entity-type'], 'file');

      $mime_type = $file->getMimeType();
      // Classes to add to the file field for icons.
      $classes = [
        'file',
        // Add a specific class for each and every mime type.
        'file--mime-' . strtr($mime_type, ['/' => '-', '.' => '-']),
        // Add a more general class for groups of well known MIME types.
        'file--' . file_icon_class($mime_type),
      ];
      // Merge with existing classes (eg: those added w/ Editor Advanced Link).
      if (!empty($form_state->getValue('attributes')['class'])) {
        $existing_classes = preg_split('/\s+/', $form_state->getValue('attributes')['class']);
        $classes = array_unique(array_merge($existing_classes, $classes));
      }
      $form_state->setValue(['attributes', 'class'], implode(' ', $classes));
    }

    if ($form_state->getErrors()) {
      unset($form['#prefix'], $form['#suffix']);
      $form['status_messages'] = [
        '#type' => 'status_messages',
        '#weight' => -10,
      ];
      $response->addCommand(new HtmlCommand('#editor-file-dialog-form', $form));
    }
    else {
      $response->addCommand(new EditorDialogSave($form_state->getValues()));
      $response->addCommand(new CloseModalDialogCommand());
    }

    return $response;
  }

}
