<?php

namespace Drupal\htm_custom_variables\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_variables\variableHelper;

/**
 * Class VariableFormList.
 */
class VariableFormList extends ConfigFormBase {
    public function __construct(ConfigFactoryInterface $config_factory)
    {
        parent::__construct($config_factory);
        $this->formatter = new variableHelper();
    }

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
    public function buildForm(array $form, FormStateInterface $form_state) {
        $config = $this->config('htm_custom_variables.variable');
        $config_values = $config->get();

        $header = [
            'key' => $this->t('Variable key'),
            'variable_value' => $this->t('Variable'),
            'operations' => $this->t('Operations'),
        ];

        $form['table'] = [
            '#type' => 'table',
            '#header' => $header,
            '#empty' => t('No variables found. <a href="@add-url">Add variable.</a>', [
                '@add-url' => Url::fromRoute('htm_custom_variables.add_variable')->toString(),
            ]),
        ];

        $mapped_config = $this->formatter->flatten($config_values);
        foreach($mapped_config as $key => $data){

            if($key === 'langcode') continue;

            $form['table'][$key]['key'] = [
                '#plain_text' => $key,
            ];

            $variable_value = $data;
            $form['table'][$key]['variable_value'][] = [
                '#type' => 'item',
                '#title' => ($variable_value) ? $variable_value : 'MISSING',
            ];

            $form['table'][$key]['operations'] = [
                '#type' => 'operations',
                '#links' => []
            ];
            $form['table'][$key]['operations']['#links']['edit'] = [
                'title' => $this->t('Edit'),
                'url' => Url::fromRoute('htm_custom_variables.edit_variable', ['variable_key' => $key]),
            ];
            $form['table'][$key]['operations']['#links']['delete'] = [
                'title' => $this->t('Delete'),
                'url' => Url::fromRoute('htm_custom_variables.delete_variable', ['variable_key' => $key]),
            ];

        }
        return $form;
    }




}
