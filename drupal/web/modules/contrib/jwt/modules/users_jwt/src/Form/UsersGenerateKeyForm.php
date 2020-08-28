<?php

namespace Drupal\users_jwt\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\user\UserInterface;
use Drupal\users_jwt\UsersJwtKeyRepositoryInterface;
use Drupal\users_jwt\UsersKey;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

/**
 * Class UsersKeyForm.
 */
class UsersGenerateKeyForm extends FormBase {

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
  public function buildForm(array $form, FormStateInterface $form_state, UserInterface $user = NULL) {
    if (!$user) {
      return $form;
    }

    $new_id = $user->id() . '-' . $this->getRequest()->server->get('REQUEST_TIME');
    $key = new UsersKey($user->id(), $new_id, 'RS256');

    $form['key'] = [
      '#type' => 'value',
      '#value' => $key,
    ];
    $form['user'] = [
      '#type' => 'value',
      '#value' => $user,
    ];
    $form['instructions'] = [
      '#type' => 'item',
      '#markup' => $this->t('When you click the button, a new key will be generated with ID %key_id. You will save the private key, the public key will be added to your account. If you lose the private key, it cannot be recovered.', ['%key_id' => $key->id]),
    ];
    $form['alg'] = [
      '#type' => 'select',
      '#title' => $this->t('Key Type'),
      '#description' => $this->t('The type of key to generate.'),
      '#options' => $this->keyRepository->algorithmOptions(),
      '#size' => 1,
      '#default_value' => $key->alg,
      '#weight' => 10,
      '#required' => TRUE,
    ];
    $form['actions'] = [
      '#type' => 'actions',
      '#weight' => 30,
    ];
    $form['actions']['save'] = [
      '#type' => 'submit',
      '#value' => $this->t('Generate'),
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
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $key = $form_state->getValue('key');
    $alg = $form_state->getValue('alg');
    if ($alg === 'RS256') {
      $config = [
        'private_key_bits' => 4096,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
      ];
      $private_key = openssl_pkey_new($config);
      $pub = openssl_pkey_get_details($private_key);
      $pubkey = $pub['key'];
      openssl_pkey_export($private_key, $out);
    }
    else {
      throw new \InvalidArgumentException(sprintf('Unknown alg %s', $alg));
    }
    $this->keyRepository->saveKey($key->uid, $key->id, $alg, $pubkey);
    /** @var \Drupal\user\UserInterface $user */
    $user = $form_state->getValue('user');
    $filename = $user->getAccountName() . '__private-key__' . $key->id . '.key';
    $response = Response::create($out);
    $response->setPrivate();
    $disposition = $response->headers->makeDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $filename);
    $response->headers->set('Content-Disposition', $disposition);
    $form_state->setResponse($response);
  }

}
