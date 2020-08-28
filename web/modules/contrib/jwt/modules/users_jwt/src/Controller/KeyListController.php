<?php

namespace Drupal\users_jwt\Controller;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\user\UserInterface;
use Drupal\users_jwt\UsersJwtKeyRepositoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class KeyListController.
 */
class KeyListController extends ControllerBase {

  /**
   * Drupal\users_jwt\UsersJwtKeyRepositoryInterface definition.
   *
   * @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface
   */
  protected $usersJwtKeyRepository;

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
   * List keys.
   *
   * @return array
   *   Return render array.
   */
  public function listKeys(UserInterface $user) {
    $keys = $this->keyRepository->getUsersKeys($user->id());
    $options = $this->keyRepository->algorithmOptions();
    $header = [
      $this->t('Key ID'),
      $this->t('Key Type'),
      $this->t('Key'),
      $this->t('Operations'),
    ];
    $rows = [];
    foreach ($keys as $key) {
      $row = [
        'id' => $key->id,
        'alg' => $options[$key->alg] ?? $key->alg,
        'pubkey' => Unicode::truncate($key->pubkey, 40, FALSE, TRUE),
      ];
      $row['operations']['data'] = [
        '#type' => 'dropbutton',
        '#links' => [
          'edit' => [
            'title' => $this->t('Edit'),
            'url' => Url::fromRoute('users_jwt.key_edit_form', [
              'user' => $key->uid,
              'key_id' => $key->id,
            ]),
          ],
          'delete' => [
            'title' => $this->t('Delete'),
            'url' => Url::fromRoute('users_jwt.key_delete_form', [
              'user' => $key->uid,
              'key_id' => $key->id,
            ]),
          ],
        ],
      ];
      $rows[] = $row;
    }
    return [
      '#cache' => ['tags' => ['users_jwt:' . $user->id()]],
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No keys found.'),
    ];
  }

}
