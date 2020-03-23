<?php

namespace Drupal\htm_custom_authentication;

use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Password\PasswordInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

use Drupal\htm_custom_authentication\Plugin\DigiDocService;

/**
* Validates user authentication credentials.
*/
class UserAuth implements UserAuthInterface {

  /**
  * The entity manager.
  *
  * @var \Drupal\Core\Entity\EntityManagerInterface
  */
  protected $entityManager;

  /**
  * The password hashing service.
  *
  * @var \Drupal\Core\Password\PasswordInterface
  */
  protected $passwordChecker;

  /**
  * Constructs a UserAuth object.
  *
  * @param \Drupal\Core\Entity\EntityManagerInterface $entity_manager
  *   The entity manager.
  * @param \Drupal\Core\Password\PasswordInterface $password_checker
  *   The password service.
  */
  public function __construct(EntityManagerInterface $entity_manager, PasswordInterface $password_checker) {
    $this->entityManager = $entity_manager;
    $this->passwordChecker = $password_checker;
  }

  /**
  * {@inheritdoc}
  */
  public function authenticate($username, $password) {
    $uid = FALSE;

    if (!empty($username) && strlen($password) > 0) {
      $account_search = $this->entityManager->getStorage('user')->loadByProperties(['name' => $username]);

      if ($account = reset($account_search)) {
        dump($this->passwordChecker->check($password, $account->getPassword()));
        if ($this->passwordChecker->check($password, $account->getPassword())) {
          // Successful authentication.
          $uid = $account->id();

          // Update user to new password scheme if needed.
          if ($this->passwordChecker->needsRehash($account->getPassword())) {
            $account->setPassword($password);
            $account->save();
          }
        }
      }
    }

    dump($uid);

    return $uid;
  }

  public function authenticateMobileId($session_code, $id_code){
    $uid = FALSE;

    $result = [];

    $dds = DigiDocService::Instance();
    $params = array(
      "Sesscode" => $session_code,
      "UserIDCode" => $id_code,
      "WaitSignature" => false
    );
    while($result['Status'] != 'USER_AUTHENTICATED' && $result['Status'] != 'error'){
      try{
        $result = $dds->GetMobileAuthenticateStatus($params);
      } catch (\Exception $e){
        switch($e->getMessage()){
          case 'SIM_ERROR':
          $message = 'login.mobile_id_sim_error';
          break;
          case 'PHONE_ABSENT':
          $message = 'login.mobile_id_coverage';
          break;
          case 'NOT_VALID':
          $message = 'login.mobile_id_not_valid';
          break;
          case 'SENDING_ERROR':
          $message = 'login.mobile_id_sending_error';
          break;
          case 'USER_CANCEL':
          $message = 'login.mobile_id_user_cancel';
          break;
          case 'EXPIRED_TRANSACTION':
          $message = 'login.mobile_id_expired_transaction';
          break;
          default:
          $message = $e->getMessage();
          \Drupal::logger('htm_custom_authentication')->error($message);
          $message = 'login.mobile_id_authorizing_failed';
          throw new HttpException(500, $message);
        }
        throw new HttpException(400, $message);
      }
    }
    if($result['Status'] === 'USER_AUTHENTICATED'){
      $users = \Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['field_user_idcode' => $params['UserIDCode']]);
      if(empty($users)){
        $values = array(
          'name' => user_password(20),
          'pass' => user_password(50),
          'field_user_idcode' => $params['UserIDCode'],
          'status' => 1,
        );
        $account = entity_create('user', $values);
        $account->save();
      }else{
        $account = reset($users);
      }
      return $account->id();
    }
  }

}
