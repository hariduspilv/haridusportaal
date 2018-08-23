<?php
namespace Drupal\htm_custom_subsidy_projects\Form;
use Consolidation\AnnotatedCommand\Parser\Internal\CsvUtils;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
/**
 * Class DeleteNodeForm.
 *
 * @package Drupal\batch_example\Form
 */
class ImportSubsidyProjectsForm extends FormBase {

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
		return 'delete_node_form';
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
			]
		];
		$form['submit'] = [
			'#type' => 'submit',
			'#value' => $this->t('Import'),
		];

		return $form;
	}

	public function validateForm(array &$form, FormStateInterface $form_state){
		$all_files = $this->getRequest()->files->get('files', []);
		if (!empty($all_files['file'])) {
			$file_upload = $all_files['file'];
			if ($file_upload->isValid()) {
				$form_state->setValue('file', $file_upload->getRealPath());
				return;
			}
		}
	}

	/**
	 * {@inheritdoc}
	 */
	public function submitForm(array &$form, FormStateInterface $form_state) {
		$encoders = new CsvEncoder();

		$file_array = $encoders->decode(file_get_contents($form_state->getValue('file')), 'csv', ['csv_delimiter' => ';']);
		/*foreach($file_array as $item){
			dump($item);
			foreach($item as $value){
				#dump($value);
			}
		}*/
		$batch = [
			'title' => t('Processing Subsidies ....--'),
			'operations' => [
				[
					'\Drupal\htm_custom_subsidy_projects\ProcessSubsidy::ValidateFile',
					[$file_array]
				],
				[
					'\Drupal\htm_custom_subsidy_projects\ProcessSubsidy::ProcessSubsidy',
					[$file_array]
				]
			],
			'error_message' => t('The migration process has encountered an error.'),
			'finished' => '\Drupal\htm_custom_subsidy_projects\ProcessSubsidy::ProcessSubsidyFinishedCallback'
		];

		batch_set($batch);
	}
}