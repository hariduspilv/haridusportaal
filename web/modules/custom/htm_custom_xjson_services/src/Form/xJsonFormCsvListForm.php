<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonFormCsvListForm extends FormBase {

    /**
     * Returns a unique string identifying the form.
     *
     * The returned ID should be a unique string that can be a valid PHP function
     * name, since it's used in hook implementation names such as
     * hook_form_FORM_ID_alter().
     *
     * @return string
     *   The unique string identifying the form.
     */
    public function getFormId() {
        return 'xjson_form_csv_list';
    }

    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $directory = "/app/drupal/web/sites/default/files/private/xJsonCSVs";

        $csv_list = array_diff(scandir($directory), array('.', '..'));

        $header = [
            'xjson_form_entity' => $this->t('xJson Form'),
            'file' => $this->t('File'),
        ];

        $form['table'] = [
            '#type' => 'table',
            '#header' => $header,
            '#empty' => t('No CSVs found.'),
        ];

        foreach($csv_list as $key => $csv_name){

            $entity_id = preg_replace('/\\.[^.\\s]{3,4}$/', '', $csv_name);
            $entity = \Drupal::entityTypeManager()->getStorage('x_json_form_entity')->load($entity_id);

            $form['table'][$key]['xjson_form_entity'] = [
                '#type' => 'link',
                '#title' => $entity->label(),
                '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/'.$entity->toUrl()->getInternalPath())
            ];

            $form['table'][$key]['file'] = [
                '#type' => 'link',
                '#title' => $this->t('Download'),
                '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/sites/default/files/private/xJsonCSVs/'.$csv_name),
            ];
        }

        return $form;
    }

    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        // TODO: Implement submitForm() method.
    }

}