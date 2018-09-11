<?php
/**
 * @file
 * Contains \Drupal\taxonomy_import\Form\ImportForm.
 */

namespace Drupal\taxonomy_import\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\UrlHelper;
use Drupal\file\Entity\File;
use Drupal\Core\Render\Element;
use Drupal\file\Entity;
use Drupal\node\Entity\ENTITY_NAME;
use Symfony\Component\DependencyInjection\SimpleXMLElement;
use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\Core\Entity\EntityInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Contribute form.
 */
class ImportForm extends FormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
	  return 'import_taxonomy_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['field_vocabulary_name'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Vocabulary name'),
      '#required' => TRUE,
      '#maxlength_js' => TRUE,		
	  '#maxlength' => 30,		
	  '#description' => t('Not more than 30 characters please!'),
    );
    $form['taxonomy_file'] = array(
        '#type' => 'managed_file',
        '#title' => $this->t('Import file'),
        '#required' => TRUE,
        '#upload_validators'  => array(
            'file_validate_extensions' => array('csv xml'),
            'file_validate_size' => array(25600000),
        ),
        '#upload_location' => 'public://taxonomy_files/',
        '#description' => t('Upload a file to Import taxonomy!'),
    );    
    $form['actions']['#type'] = 'actions';    
    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Import'),
      '#button_type' => 'primary',      
   );   
    return $form;
  }
  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
  }
  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
	// Display result.
    foreach ($form_state->getValues() as $key => $value) {		
		if($key == 'field_vocabulary_name')
		{
			$voc_name = $value;
		}     
    }
    create_taxonomy($voc_name);
  }
}
/**
 * Function to implement import taxonomy functionality
 */
function create_taxonomy($voc_name)
{   
	global $base_url;
	$loc = db_query('SELECT file_managed.uri FROM file_managed ORDER BY file_managed.fid DESC limit 1', array());
    foreach($loc as $val){
		$location = $val->uri; // get location of the file
	}		
    $name = $voc_name;
	if(function_exists('mime_content_type')){ 
		$mimetype = mime_content_type($location); 
	}
	else { 
		return 'application/octet-stream'; 
    }
    $machine_readable = strtolower($voc_name);//converting to machine name
    $vid  = preg_replace('@[^a-z0-9_]+@','_',$machine_readable);//Vocabulary machine name
    //creating new vocabulary with the field value 
    $vocabularies = \Drupal\taxonomy\Entity\Vocabulary::loadMultiple();
    if (!isset($vocabularies[$vid])) {
      $vocabulary = \Drupal\taxonomy\Entity\Vocabulary::create(array(
            'vid' => $vid,
            'machine_name' => $vid,
            'name' => $name,
      ));
      $vocabulary->save();     
    }
	if($mimetype == "text/plain"){ //Code for fetch and save csv file
		if (($handle = fopen($location, "r")) !== FALSE) {
			$data1 = fgetcsv($handle); // Read all data including title
			while (($data = fgetcsv($handle)) !== FALSE) 
			{				     
				$termid = 0;
				$term_id =0;
				//Get tid of term with same name 
				$termid = db_query('SELECT n.tid FROM {taxonomy_term_field_data} n WHERE n.name  = :uid AND n.vid  = :vid', array(':uid' =>  $data[0], ':vid' => $vid));
				foreach($termid as $val){
					$term_id = $val->tid; // get tid
				}  
				//finding parent of new item
				$parent = 0;
				if(!empty($data[1])){
					$parent_id =db_query('SELECT n.tid FROM {taxonomy_term_field_data} n WHERE n.name  = :uid AND n.vid  = :vid', array(':uid' =>  $data[1], ':vid' => $vid));
					
					foreach($parent_id as $val){
						if(!empty($val)){
							$parent = $val->tid; // get tid
						}
						else{
							$parent =0;
						}
					}
				}
				if(empty($term_id)){ //Check whether term already exists or not
					//Create  new term
					$term = Term::create(array(
					'parent' => array($parent),
					'name' => $data[0],
					'vid' => $vid,
					 ))->save();
				}
				else{//Code to update existing term field(s)
					$term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($term_id);
					$term->parent->setValue($parent);
					$term->Save();	
				}       
			} 
			fclose($handle);
			//redirecting to taxonomy term overview page
			$url = $base_url."/admin/structure/taxonomy/manage/".$vid."/overview";
			header('Location:'.$url);exit;			
		}
		else{
			drupal_set_message('File contains no data');
		}
	}
	else if($mimetype == "application/xml"){ //Code for fetch and save xml file
		if (file_exists($location)) {
			$feed = file_get_contents($location);
			$items = simplexml_load_string($feed);
			
			if(!empty($items)){
				
				$item = $items->children();
				foreach($item as $child){
					$records = $child;
					$array =  (array) $records;
					$j = 0;					
					foreach($array as $val)
					{  
						if($j == 0){
						   $terms = $val;
					    }
					    if($j == 1)
					    {
							$parents = $val;
						}						
						$j++;
						if($j>=2)
							break;
					}
					$parent = 0;
					$term_id = 0;
					//checks if parent tag exists
					if(isset($parents) && !empty($parents))
					{
						$data = $parents;
						$parent_id =db_query('SELECT n.tid FROM {taxonomy_term_field_data} n WHERE n.name  = :uid AND n.vid  = :vid', array(':uid' =>  $data, ':vid' => $vid));
						foreach($parent_id as $val){
							if(!empty($val)){
								$parent = $val->tid; // get tid
							}
							else{
								$parent =0;
							}
						}
					}
					$termid = db_query('SELECT n.tid FROM {taxonomy_term_field_data} n WHERE n.name  = :uid AND n.vid  = :vid', array(':uid' =>  $terms, ':vid' => $vid));
					foreach($termid as $val){
						$term_id = $val->tid; // get tid
					}
					if(empty($term_id)){ //Check whether term already exists or not
					//Create  new term				
						$term = Term::create(array(
						'parent' => array($parent),
						'name' => $terms,
						'vid' => $vid,
						 ))->save();
					}
					else{//Code to update existing term field(s)
						$term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($term_id);
						$term->parent->setValue($parent);
						$term->Save();	
					}
				}
				//redirecting to taxonomy term overview page
				$url = $base_url."/admin/structure/taxonomy/manage/".$vid."/overview";
				header('Location:'.$url);exit;
			}
			else{
				drupal_set_message('File contains no data'); 				
			}
		}
	}
	else if($mimetype == "application/octet-stream"){
		drupal_set_message('File contains no data');
	}
	else{
		drupal_set_message('Failed to open the file');
	}
}
?>
