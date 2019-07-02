<?php
namespace Drupal\htm_custom_elasticsearch_reindex\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Cache\Cache;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Serializer\Serializer;

/**
 * Class DeleteNodeForm.
 *
 * @package Drupal\batch_example\Form
 */
class IndexesForm extends FormBase {

    public function __construct(Serializer $serializer)
    {
        $this->serializer = $serializer;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('serializer')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'elasticsearch_reindex_form';
    }
    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {

        $indexes = \Drupal::entityTypeManager()->getStorage('search_api_index')->loadMultiple();

        $radio_fields = [];

        foreach($indexes as $index){
            $radio_fields[$index->getServerInstance()->id()][$index->id()] = $index->get('name');
        }

        foreach($radio_fields as $field => $options){
            $form[$field] = [
                '#type' => 'checkboxes',
                '#title' => $field,
                '#options' => $options,
                '#multiple' => TRUE
            ];
        }

        $form['submit'] = [
            '#type' => 'submit',
            '#value' => $this->t('Import'),
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $user_input = array_diff_key($form_state->getUserInput(), array_flip($form_state->getCleanValueKeys()));

        #remove indexes that were not selected
        foreach($user_input as $server => $indexes){
            foreach($indexes as $index => $value){
                if(!$value){
                    unset($user_input[$server][$index]);
                }
            }
        }

        $batch = [
            'title' => t('Rebuilding indexes ....--'),
            'operations' => [
                [
                    '\Drupal\htm_custom_elasticsearch_reindex\ProcessIndexes::ResaveIndexes',
                    [$user_input]
                ],
                #[
                #    '\Drupal\htm_custom_elasticsearch_reindex\ProcessIndexes::RebuildIndexes',
                #    [$user_input]
                #]
            ],
            'error_message' => t('The rebuilding process has encountered an error.'),
            'finished' => '\Drupal\htm_custom_elasticsearch_reindex\ProcessIndexes::ProcessIndexesFinishedCallback'
        ];

        batch_set($batch);

    }
}