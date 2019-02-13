<?php

namespace Drupal\htm_custom_variables\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\htm_custom_variables\variableHelper;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class VariableFormBase.
 */
abstract class VariableFormBase extends ConfigFormBase {
    /**
     * The Messenger service.
     *
     * @var \Drupal\Core\Messenger\MessengerInterface
     */
    protected $messenger;

    /**
     * TranslationFormBase constructor.
     *
     * @param \Drupal\Core\Messenger\MessengerInterface $messenger
     *   The messenger service.
     */
    public function __construct(MessengerInterface $messenger) {
        $this->messenger = $messenger;
        $this->keyformatter = new variableHelper();
    }

    /**
     * @param ContainerInterface $container
     */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('messenger')
        );
    }

    /**
     * @return mixed
     */
    abstract function actionType();

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return [
            'htm_custom_variables.variable',
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'variable_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $variable_key = NULL) {
        $form['#tree'] = TRUE;

        $config = $this->config('htm_custom_variables.variable');
        $this->buildFormData($form, $form_state, $config, $variable_key);

        return parent::buildForm($form, $form_state);

    }

    /**
     * @param array              $form
     * @param FormStateInterface $form_state
     * @param Config             $config
     * @param                    $variable_key
     * @return mixed
     */
    abstract public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $variable_key);

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state) {

        parent::validateForm($form, $form_state);
    }


    /**
     * @param array              $form
     * @param FormStateInterface $form_state
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $redirect = FALSE;

        $config_key = 'htm_custom_variables.variable';

        switch ($this->actionType()){
            case 'add':
            case 'edit':
                $variable = $form_state->getValues()['variable'];
                $variable_key = $variable['key'];

                if($form_state->get('delete_old_key')){
                    $variableKeyDefaultValue = $form['variable']['key']['#default_value'];
                    $this->config($config_key)->clear($variableKeyDefaultValue);
                    $redirect = TRUE;
                }

                $this->config($config_key)->set($variable_key, $variable['variables'])->save();

                $message = ($this->actionType() === 'add') ? $this->t('Variable saved') : $this->t('Variable updated');
                $this->messenger->addMessage($message);
                if($redirect){
                    $form_state->setRedirect('htm_custom_variables.edit_variable', ['type'=> 'edit', 'variable_key' => $variable_key]);
                }
                break;
            case 'import':
                #$this->config($config_key)->delete();
                $json = json_decode(file_get_contents($form_state->getValue('upload')), true);
                $flatten = $this->keyformatter->flattenImportJson($json);

                $result = array_map(function($v){
                    $elem = [
                        'translation_type' => 'textarea',
                    ];
                    return $elem;
                }, $flatten);

                foreach($result as $key => $value){
                    $this->config($config_key)->set($key, $value)->save();
                }

                break;
            default:
                $this->messenger->addError('Action type not recognized');
                break;
        }
    }
    protected function SaveConfig(){

    }
}
