<?php

namespace Drupal\kafka\Controller;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\kafka\ClientFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ReportController contains the admin/reports/status/kafka controller.
 */
class ReportController implements ContainerInjectionInterface {

  /**
   * The kafka.client_factory service.
   *
   * @var \Drupal\kafka\ClientFactory
   */
  protected $clientFactory;

  /**
   * The settings related to Kafka.
   *
   * @var array
   */
  protected $settings;

  /**
   * The string_translation service.
   *
   * @var \Drupal\Core\StringTranslation\TranslationInterface
   */
  protected $translation;

  /**
   * ReportController constructor.
   *
   * @param array $settings
   *   The part of the settings related to Kafka.
   * @param \Drupal\Core\StringTranslation\TranslationInterface $translation
   *   The translation service.
   * @param \Drupal\kafka\ClientFactory $clientFactory
   *   The kafka.client_factory service.
   */
  public function __construct(array $settings, TranslationInterface $translation, ClientFactory $clientFactory) {
    $this->clientFactory = $clientFactory;
    $this->settings = $settings;
    $this->translation = $translation;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $clientFactory = $container->get('kafka.client_factory');
    $settings = $container->get('settings')->get('kafka');
    $translation = $container->get('string_translation');
    return new static($settings, $translation, $clientFactory);
  }

  /**
   * The Kafka report controller. It lists topics.
   */
  public function action() {
    $header = [
      new TranslatableMarkup('Property', [], [], $this->translation),
      new TranslatableMarkup('Value', [], [], $this->translation),
    ];
    $rows = [];

    $rows[] = [
      new TranslatableMarkup('Consumer brokers', [], [], $this->translation),
      ['data' => json_encode($this->settings['consumer']['brokers'])],
    ];
    $rows[] = [
      new TranslatableMarkup('Producer brokers', [], [], $this->translation),
      ['data' => json_encode($this->settings['producer']['brokers'])],
    ];
    $topics = $this->clientFactory->getTopics();
    $rows[] = [
      new TranslatableMarkup('Topics', [], [], $this->translation), [
        'data' => [
          '#theme' => 'item_list',
          '#items' => $topics,
        ],
      ],
    ];

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];
  }

}
