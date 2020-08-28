<?php

namespace Drupal\users_jwt\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\user\UserInterface;
use Drupal\users_jwt\UsersJwtKeyRepositoryInterface;
use Drupal\users_jwt\UsersKey;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class UsersKeyForm.
 */
class UsersKeyForm extends FormBase {

  /**
   * The user key repository service.
   *
   * @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface
   */
  protected $keyRepository;

  /**
   * Constructs a key form.
   *
   * @param \Drupal\users_jwt\UsersJwtKeyRepositoryInterface $key_repository
   *   The user key repository service.
   */
  public function __construct(UsersJwtKeyRepositoryInterface $key_repository) {
    $this->keyRepository = $key_repository;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('users_jwt.key_repository'));
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'users_jwt_key_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $key_id = NULL, UserInterface $user = NULL) {
    if (!$user) {
      return $form;
    }
    if ($key_id) {
      $key = $this->keyRepository->getKey($key_id);
      if (!$key || $key->uid != $user->id()) {
        throw new NotFoundHttpException();
      }
    }
    else {
      $new_id = $user->id() . '-' . $this->getRequest()->server->get('REQUEST_TIME');
      $key = new UsersKey($user->id(), $new_id, 'RS256');
    }
    $form['is_new'] = [
      '#type' => 'value',
      '#value' => !$key_id,
    ];
    $form['key'] = [
      '#type' => 'value',
      '#value' => $key,
    ];
    $form['id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Key ID'),
      '#description' => $this->t('The unique key ID'),
      '#maxlength' => 64,
      '#size' => 30,
      '#default_value' => $key->id,
      '#weight' => 0,
      '#required' => TRUE,
      // An administrator is allowed to set the ID for a new key.
      '#disabled' => !$this->currentUser()->hasPermission('administer users') || $key_id,
    ];
    $form['alg'] = [
      '#type' => 'select',
      '#title' => $this->t('Key Type'),
      '#description' => $this->t('The type of public key being added.'),
      '#options' => $this->keyRepository->algorithmOptions(),
      '#size' => 1,
      '#default_value' => $key->alg,
      '#weight' => 10,
      '#required' => TRUE,
    ];
    $form['pubkey'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Public Key'),
      '#description' => $this->t('The public key value.'),
      '#default_value' => $key->pubkey,
      '#weight' => 20,
      '#required' => TRUE,
    ];
    $form['actions'] = [
      '#type' => 'actions',
      '#weight' => 30,
    ];
    $form['actions']['save'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];
    $cancel_url = Url::fromRoute('users_jwt.key_list', ['user' => $user->id()]);
    $form['actions']['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#attributes' => ['class' => ['button']],
      '#url' => $cancel_url,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $is_new = $form_state->getValue('is_new');
    if ($is_new) {
      $id = trim($form_state->getValue('id'));
      if ($this->keyRepository->getKey($id)) {
        $form_state->setErrorByName('id', $this->t('%key is already in use as an ID', ['%id' => $id]));
      }
    }
    $alg = $form_state->getValue('alg');
    $pubkey = trim($form_state->getValue('pubkey'));
    if ($alg === 'RS256') {
      $key_resource = openssl_pkey_get_public($pubkey);
      $details = $key_resource ? openssl_pkey_get_details($key_resource) : FALSE;
      if ($details === FALSE || $details['type'] !== OPENSSL_KEYTYPE_RSA) {
        $form_state->setErrorByName('pubkey', $this->t('This does not look like a PEM formatted RSA public key'));
      }
      else {
        if ($details['bits'] < 2048) {
          $form_state->setErrorByName('pubkey', $this->t('You need to submit at least a 2048 bit key'));
        }
      }
    }
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $key = $form_state->getValue('key');
    $is_new = $form_state->getValue('is_new');
    if ($is_new) {
      $key->id = trim($form_state->getValue('id'));
    }
    $this->keyRepository->saveKey($key->uid, $key->id, $form_state->getValue('alg'), $form_state->getValue('pubkey'));
    $this->messenger()->addStatus('Saved key %key_id', ['%key_id' => $key->id]);
    $form_state->setRedirect('users_jwt.key_list', ['user' => $key->uid]);
  }

}
