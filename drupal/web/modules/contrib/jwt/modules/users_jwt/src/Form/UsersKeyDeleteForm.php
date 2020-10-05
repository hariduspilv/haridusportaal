<?php

namespace Drupal\users_jwt\Form;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\user\UserInterface;
use Drupal\users_jwt\UsersJwtKeyRepositoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class UsersKeyForm.
 */
class UsersKeyDeleteForm extends ConfirmFormBase {

  /**
   * The user key repository service.
   *
   * @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface
   */
  protected $keyRepository;

  protected $key;

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
    return 'users_jwt_key_delete_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $key_id = NULL, UserInterface $user = NULL) {
    if (!$user) {
      return $form;
    }
    $key = $this->keyRepository->getKey($key_id);
    if (!$key || $key->uid != $user->id()) {
      return $form;
    }
    // Make key available to ::getCancelUrl().
    $this->key = $key;

    $form['key'] = [
      '#type' => 'value',
      '#value' => $key,
    ];
    $header = [
      $this->t('Key ID'),
      $this->t('Key Type'),
      $this->t('Key'),
    ];
    $options = $this->keyRepository->algorithmOptions();
    $row = [
      'id' => $key->id,
      'alg' => $options[$key->alg] ?? $key->alg,
      'pubkey' => Unicode::truncate($key->pubkey, 40, FALSE, TRUE),
    ];
    $rows[] = $row;
    $form['key_display'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];

    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete this key?');
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return t('This operation cannot be undone.');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return Url::fromRoute('users_jwt.key_list', ['user' => $this->key->uid]);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $key = $form_state->getValue('key');
    $this->keyRepository->deleteKey($key->id);
    $this->messenger()->addMessage($this->t('They key %key_id has been deleted', ['%key_id' => $key->id]));
    $form_state->setRedirect('users_jwt.key_list', ['user' => $key->uid]);
  }

}
