<?php

namespace Drupal\config_split\Command;

use Drupal\config_split\ConfigSplitCliService;
use Drupal\Console\Core\Command\Shared\CommandTrait;
use Drupal\Console\Core\Style\DrupalStyle;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class SplitCommandBase for shared functionality.
 */
abstract class SplitCommandBase extends Command {

  use CommandTrait;

  /**
   * The cli service doing all the work.
   *
   * @var \Drupal\config_split\ConfigSplitCliService
   */
  protected $cliService;

  /**
   * The io interface composed of a commands input and output.
   *
   * @var \Symfony\Component\Console\Style\StyleInterface
   */
  protected $io;

  /**
   * Constructor with cli service injection.
   *
   * @param \Drupal\config_split\ConfigSplitCliService $cliService
   *   The cli service to delegate all actions to.
   */
  public function __construct(ConfigSplitCliService $cliService) {
    parent::__construct();
    $this->cliService = $cliService;
  }

  /**
   * Set up the io interface.
   *
   * @param \Symfony\Component\Console\Input\InputInterface $input
   *   The input interface.
   * @param \Symfony\Component\Console\Output\OutputInterface $output
   *   The output interface.
   */
  protected function setupIo(InputInterface $input, OutputInterface $output) {
    $this->io = new DrupalStyle($input, $output);
  }

  /**
   * Get the io interface.
   *
   * @return \Symfony\Component\Console\Style\StyleInterface
   *   The io interface.
   */
  protected function getIo() {
    return $this->io;
  }

  /**
   * The translation function akin to Drupal's t().
   *
   * @param string $string
   *   The string to translate.
   * @param array $args
   *   The replacements.
   *
   * @return string
   *   The translated string.
   */
  public function t($string, array $args = []) {
    $c = 'commands.' . strtr($this->getName(), [':' => '.']) . '.messages.';
    $translations = [
      'Configuration successfully exported.' => $c . 'success',
    ];
    if (array_key_exists($string, $translations)) {
      $string = $translations[$string];
    }

    // Translate with consoles translations.
    return strtr($this->trans($string), $args);
  }

}
