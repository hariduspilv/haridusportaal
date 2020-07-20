<?php
namespace Drupal\htm_custom_oska\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Drupal\Core\Cache\Cache;

/**
 * Class DeleteNodeForm.
 *
 * @package Drupal\batch_example\Form
 */
class OskaMapImportDataForm extends FormBase {

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
        return 'oska_map_import';
    }
    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        $form['file'] = [
            '#type' => 'file',
            '#title' => 'CSV file upload',
            '#upload_validators' => [
                'file_validate_extensions' => ['csv']
            ],
            #'#required' => TRUE,
        ];
        $form['submit'] = [
            '#type' => 'submit',
            '#value' => $this->t('Import'),
        ];

        return $form;
    }

    public function validateForm(array &$form, FormStateInterface $form_state){
        $required_headers = [
            'naitaja', 'valdkond', 'maakond', 'valdlinn', 'vaartus', 'jaotus', 'algus', 'lopp'
        ];
        $all_files = $this->getRequest()->files->get('files', []);
        if (!empty($all_files['file'])) {
            $file_upload = $all_files['file'];
            if ($file_upload->isValid()) {
                $header_info = $this->detectCSVFileDelimiter($file_upload->getRealPath());
                foreach($header_info['keys'] as $key => $value) {
                    $header_info['keys'][cleanString($key)] = cleanString($value);
                }

                $delimiter = $header_info['delimiter'];
                //check delimiter
                if($delimiter != ';'){
                    $form_state->setErrorByName('file', $this->t("delimiter: '$delimiter' not allowed!"));
                }
                //check headers
                foreach($required_headers as $required_header){
                    if(!in_array($required_header, $header_info['keys'])){
                        $form_state->setErrorByName('file', $this->t("$required_header header is wrongly spelled or missing"));
                    }
                }

                $form_state->setValue('file', $file_upload->getRealPath());
                return;
            }
        }else{
            $form_state->setErrorByName('file', $this->t('No CSV uploaded!'));
        }
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        $encoders = new CsvEncoder();

        $file_array = $encoders->decode(file_get_contents($form_state->getValue('file')), 'csv', ['csv_delimiter' => ';']);

        $batch = [
            'title' => t('Processing Oska Map data ....--'),
            'operations' => [
                [
                    '\Drupal\htm_custom_oska\ProcessOskaMapData::ValidateFile',
                    [$file_array]
                ],
                [
                    '\Drupal\htm_custom_oska\ProcessOskaMapData::ProcessOskaMapData',
                    [$file_array]
                ]
            ],
            'error_message' => t('The migration process has encountered an error.'),
            'finished' => '\Drupal\htm_custom_oska\ProcessOskaMapData::ProcessOskaMapDataFinishedCallback'
        ];

        batch_set($batch);

        Cache::invalidateTags(['oska_map_csv']);
    }
    public function detectCSVFileDelimiter($csvFile) {
        $delimiters = array(',' => 0, ';' => 0, "\t" => 0, '|' => 0);
        $firstLine = '';
        $handle = fopen($csvFile, 'r');
        if ($handle) {
            $firstLine = fgets($handle); fclose($handle);
        }
        if ($firstLine) {
            foreach ($delimiters as $delimiter => &$count) {
                $count = count(str_getcsv($firstLine, $delimiter));
            }
            return [
                'delimiter' => array_search(max($delimiters), $delimiters),
                'keys' => explode(array_search(max($delimiters), $delimiters), preg_replace('/\s+/', '',$firstLine))
            ];
        } else {
            return key($delimiters);
        }
    }

}
