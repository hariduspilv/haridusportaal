<?php

namespace Drupal\monolog\Logger\Processor;

use Drupal\Core\Session\AccountProxyInterface;

/**
 * Class UidProcessor.
 */
class CurrentUserProcessor {

  /**
   * \Drupal\Core\Session\AccountProxyInterface $account_proxy.
   * 
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $accountProxy;

  /**
   * Constructs a Default object.
   * 
   * @param \Drupal\Core\Session\AccountProxyInterface $account_proxy
   *  The AccountProxyInterface definition.
   */
  public function __construct(AccountProxyInterface $account_proxy) {
    $this->accountProxy = $account_proxy;
  }

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record) {
    $record['extra']['uid'] = $this->accountProxy->id();
    $record['extra']['user'] = $this->accountProxy->getAccountName();

    return $record;
  }

}
