<?php

namespace Drupal\htm_custom_ehis_connector;

use Drupal\Component\Datetime\DateTimePlus;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Site\Settings;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\redis\ClientFactory;
use Drupal\rest\ModifiedResourceResponse;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class EhisConnectorService.
 */
class EhisConnectorService {

  protected $loime_url;
  /**
   * Drupal\Core\Session\AccountProxyInterface definition.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * @var \Redis
   */
  protected $client;

  /**
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;


  /**
   * @var \Drupal\htm_custom_authentication\CustomRoleSwitcher;
   */
  protected $currentRole;

  var $ed_map = [
    'ownerType' => 'pidajaLiigid',
    'ownershipType' => 'oppeasutuseOmandivormid',
    'studyInstitutionType' => 'oppeasutuseLiigid'
  ];
  /**
   * @var xJsonService
   */
  protected $xJsonService;


  /**
   * EhisConnectorService constructor.
   *
   * @param AccountProxyInterface         $current_user
   * @param ClientFactory                 $client_factory
   * @param LoggerChannelFactoryInterface $logger
   */
  public function __construct(
    AccountProxyInterface $current_user,
    ClientFactory $client_factory,
    LoggerChannelFactoryInterface $logger) {
    $this->currentUser = $current_user;
    $this->client = $client_factory->getClient();
    $this->logger = $logger->get('ehis_connector_service');
    $this->currentRole = \Drupal::service('current_user.role_switcher')->getCurrentRole();
    $this->loime_url = settings::get('loime_default_url');
  }

  /**
   * @param      $service_name
   * @param      $params
   * @param bool $poll
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  private function invokeWithRedis ($service_name, $params, $poll = TRUE) {
    switch ($poll){
      case TRUE:
        $start_time = DateTimePlus::createFromDateTime(new \Datetime());
        do {
          $current_time = DateTimePlus::createFromDateTime(new \Datetime());
          $diff_sec = $start_time->diff($current_time, TRUE)->s;
          if(is_array($params['hash'])) {
            $redis_response = [];
            $redis_hits = 0;
            foreach($params['hash'] as $hash) {
              if($response = $this->getValue($params['key'], $hash)){
                $redis_hits++;
                $redis_response = array_merge_recursive($redis_response, $response);
              }
            }
            if(!empty($redis_response) && $redis_hits === count($params['hash'])) {
              $redis_response['redis_hit'] = TRUE;
              return $redis_response;
            }
          } else {
            if($redis_response = $this->getValue($params['key'], $params['hash'])){
              $redis_response['redis_hit'] = TRUE;
              return $redis_response;
            }
          }
        } while ($diff_sec < 3 && empty($redis_response));

        return ['found' => NULL];

        break;
      default:
        if(is_array($params['hash'])) {
          $redis_response = [];
          $redis_hits = 0;
          foreach($params['hash'] as $hash) {
            if($response = $this->getValue($params['key'], $hash) && $hash !== 'OLT'){
              $redis_hits++;
              $redis_response = array_merge_recursive($redis_response, $response);
            } else {
              return $this->invoke($service_name, $params);
            }
          }
          if(!empty($redis_response) && $redis_hits === count($params['hash'])) {
            $redis_response['redis_hit'] = TRUE;
            return $redis_response;
          }
        } else {
          if($redis_response = $this->getValue($params['key'], $params['hash'])){
            $redis_response['redis_hit'] = TRUE;
            return $redis_response;
          } else {
            return $this->invoke($service_name, $params);
          }
        }
        break;
    }

  }

  /**
   * @param $service_name
   * @param $params
   * @return mixed|\Psr\Http\Message\ResponseInterface
   */
  private function invoke($service_name, $params, $type = 'get'){
    $client = \Drupal::httpClient();
    try {
      /*TODO make post URL configurable*/
      if($type === 'get'){
        if($service_name === 'getDocument' || $service_name === 'changeDocument'){
          $response = $client->get($this->loime_url.$service_name . '/' . $params['form_name'].'/'.$params['idcode'].'?'. implode($params['url'], '&'));
        } else {
          $response = $client->get($this->loime_url.$service_name . '/' . implode($params['url'], '/') . '?'. implode($params['params'], '&'));
        }
      }elseif($type === 'post'){
        $params['headers'] = [
          'Content-Type' => 'application/json'
        ];
        \Drupal::logger('xjson')->notice('<pre><code>Post request: ' . print_r(['url' => $this->loime_url.$service_name, 'params' => $params ], TRUE) . '</code></pre>' );
        #dump('lõime url', $this->loime_url.$service_name);
        #dump('parameetrid', $params);
        $response = $client->post($this->loime_url.$service_name, $params);
      }else{
        //TODO throw error
      }
      $response = json_decode($response->getBody()->getContents(), TRUE);
      #dump('liidese vastus', $response);
      return $response;
    }catch (RequestException $e){
      \Drupal::logger('xjson')->notice('<pre><code>ehis response error' . print_r($e->getMessage(), TRUE) . '</code></pre>' );
      return false;
    }
  }

  /**
   * @param $key
   * @param $hash
   * @return array|mixed
   */
  private function getValue($key, $hash){
    $response = [];
    if(is_array($hash)) {
      foreach($hash as $value) {
        if($data = $this->client->hGet($key, $value)){
          $response = array_merge($response, json_decode($data, TRUE));
        }
      }
    } else {
      if($data = $this->client->hGet($key, $hash)){
        $response = json_decode($data, TRUE);
      }
    }
    return $response;
  }

  /**
   * @param Base64Image $img
   * @param             $key
   * @return bool|int
   */
  public function saveFileToRedis(Base64Image $img, $key){
    return $this->client->hset($key, $img->getFileIdentifier(), $img->getRawData());
  }

  public function deleteFromRedis($key, $hash){
    $response = $this->client->hDel($key, $hash);
    return $response;
  }

  public function deleteKeyFromredis($key){
    $this->client->del($key);
  }


  /**
   * @param bool $idcode
   *  If true return IDcode
   * @return mixed
   */
  public function getCurrentUserIdRegCode($idcode = FALSE){
    #dump($this->currentRole);
    if($this->useReg() && !$idcode){
      return $this->currentRole['current_role']['data']['reg_kood'];
    }else{
      #return '37112110025';
      return $this->currentUser->getIdCode();
    }
  }

  public function getCurrentUserName(){
    #dump($this->currentRole);
    if($this->useReg()){
      return $this->currentRole['current_role']['data']['nimi'];
    }else{
      return null;
    }
  }

  /**
   * @return bool
   */
  public function useReg(){
    if($this->currentRole['current_role']['type'] === 'juridical_person') return true;
    return false;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getProfessionalCertificate(array $params = []){
    // build url params for GET request
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), 'true', time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'kodanikKutsetunnistus';
    return $this->invokeWithRedis('kodanikKutsetunnistus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  // Get the main test information
  public function getTestSessions(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'testsessioonidKod';
    \Drupal::logger('xjson')->notice('<pre><code>EIS response: '. print_r($params['value'], TRUE). '</code></pre>' );

    return $this->invokeWithRedis('testsessioonidKod', $params, FALSE);

  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getTeisKod(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'teisAndmedKod';
    return $this->invokeWithRedis('teisAndmedKod', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  // Get detailed information about a specific exam and pass it an extra variable if it is EST language exam
  public function gettestidKod(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), $params['session_id'], time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'testidKod_'.$params['session_id'];
    // get detailed information about any exam
    $testid_request = $this->invokeWithRedis('testidKod', $params, FALSE);
    // get exam's certificate id
    $exam_cert_id = $testid_request['value']['tunnistus_id'];
    // get language exam's certificate id-s and check if they match with $testid_request id
    $lang_ex_cert_id = $this->getTeisKod()['value']['tunnistus_jada'];
    foreach($lang_ex_cert_id as $sequence){
      if($exam_cert_id === $sequence['tunnistus_id']) {
        // if it is an EST language exam, pass it an extra variable
        $testid_request['lang_cert_nr'] = $sequence['nbr'];
      }
    }
    return $testid_request;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getGdprLogs(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE)];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'eeIsikukaartGDPR';
    return $this->invokeWithRedis('GDPRLog', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  // Download a certificate
  public function getCertificate(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), $params['certificate_id'], time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'eTunnistusKod_'.$params['certificate_id'];
    return $this->invokeWithRedis('eTunnistusKod', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function deleteDocument(array $params = []){
    $params['url'] = [$params['form_name'], $params['id'], $this->getCurrentUserIdRegCode()];

    $this->deleteKeyFromredis($this->getCurrentUserIdRegCode());
    return $this->invoke('deleteDocument', $params);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getCertificatePublic(array $params = []){
    $params['url'] = [$params['id_code'], $params['certificate_id'], time()];
    $params['key'] = $params['id_code'];
    $params['hash'] = 'eTunnistuskehtivus_'.$params['certificate_id'];
    return $this->invokeWithRedis('eTunnistusKehtivus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getDigiSigned(array $params = []){
    $id_code = $this->getCurrentUserIdRegCode(TRUE);
    $service_name = 'eeIsikukaartBdoc/'.$id_code;
    return $this->invoke($service_name, ['json' => $params], 'post');
  }

  /**
   * @param array $params
   * @return mixed
   */
  // Get Isikukaart data from EHIS and forward it to front-end according to the tab that is open
  public function getPersonalCard(array $params = []){
    $tab = $params['tab'];
    switch ($tab){
      case 'studies':
        $keys = ['OPPIMINE_ALUS', 'OPPIMINE_HUVI', 'OPPIMINE_POHI', 'OPPIMINE_KUTSE_2', 'OPPIMINE_KORG_2', 'OPPELAENUOIGUSLIK', 'HTD_KVALIFIKATSIOON'];
        break;
      case 'teachings':
        $keys = ['TOOTAMINE_HUVI', 'TOOTAMINE_ALUS', 'TOOTAMINE_POHI', 'TOOTAMINE_KUTSE', 'TOOTAMINE_KORG', 'TAIENDKOOLITUS', 'TASEMEKOOLITUS', 'KVALIFIKATSIOON'];
        break;
      case 'personal_data':
        $keys = ['ELUKOHAANDMED'];
        break;
      case 'digital_sign_data':
        $keys = ['OPPIMINE_ALUS', 'OPPIMINE_HUVI', 'OPPIMINE_POHI', 'OPPIMINE_KUTSE_2', 'OPPIMINE_KORG_2', 'OPPELAENUOIGUSLIK', 'HTD_KVALIFIKATSIOON',
          'TOOTAMINE_HUVI', 'TOOTAMINE_ALUS', 'TOOTAMINE_POHI', 'TOOTAMINE_KUTSE', 'TOOTAMINE_KORG', 'TAIENDKOOLITUS', 'TASEMEKOOLITUS', 'KVALIFIKATSIOON'];
        break;
      default:
        $keys = [];
        break;
    }

    $andmeblokk = implode(',', array_values($keys));
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), time(), $tab, $andmeblokk];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'eeIsikukaart';
    $response = $this->invokeWithRedis('eeIsikukaart', $params, FALSE);
    \Drupal::logger('xjson')->notice('<pre><code>Personal card response: '. print_r($response, TRUE). '</code></pre>' );
    if($params['tab'] !== 'eeIsikukaartGDPR') {
      return $response;
    } else {
      return $this->getGdprLogs();
    }
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  /*@TODO something wrong here*/
  public function getDocument(array $params = [], $regcode = false){
    if(!$regcode) {
      $params['idcode'] = $this->getCurrentUserIdRegCode();
    }
    return $this->invokeWithRedis('getDocument', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  /*@TODO something wrong here*/
  public function changeDocument(array $params = [], $regcode = false){
    if(!$regcode) {
      $params['idcode'] = $this->getCurrentUserIdRegCode();
    }
    return $this->invokeWithRedis('changeDocument', $params, FALSE);
  }

  /**
   * @param array $params
   * @return mixed|\Psr\Http\Message\ResponseInterface
   */
  public function postDocument(array $params = []){
    return $this->invoke('postDocument', $params, 'post');
  }

  public function addInstitution(array $params = []){
    $data = $this->buildInstitutionData($params['data']);
    $post_data = [
      'json' => $data
    ];

    return $this->invoke('postEducationalInstitution/'.$this->getCurrentUserIdRegCode(TRUE) , $post_data, 'post');
  }

  public function editInstitution(array $params = []){
    #$params['edId'] = '7274';
    $institution = $this->getEducationalInstitution(['id' => $params['data']['edId']]);
    $params['data']['existing']['institution'] = $institution;

    $data = $this->buildInstitutionData($params['data'], true);

    $post_data = [
      'json' => $data
    ];
    $return = $this->invoke('postEducationalInstitution/'.$this->getCurrentUserIdRegCode(TRUE) , $post_data, 'post');

    //everything is fine delete cache
    if(!isset($return['error'])){
      $key = $this->getCurrentUserIdRegCode();
      $hash = 'educationalInstitution_'.$params['data']['edId'];
      $this->deleteFromRedis($key, $hash);
    }

    return $return;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getDocumentFile(array $params = []){
    $params['url'] = [$params['file_id'], $this->getCurrentUserIdRegCode(TRUE)];
    if(isset($params['doc_id'])) {
      $params['params'][] = 'identifier='.$params['doc_id'];
    }
    return $this->invokeWithRedis('getDocumentFile', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getDocumentFileFromRedis(array $params = []){
    $params['key'] = $this->getCurrentUserIdRegCode();
    return $this->client->hGet($params['key'], $params['hash']);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getUserRoles(array $params = []){
    /* @TODO $lang_code later as variable */
    $lang_code = 'EST';
    $params['url'] = [$this->getCurrentUserIdRegCode(true), $lang_code, time()];
    $params['key'] = $this->getCurrentUserIdRegCode(true);
    $params['hash'] = 'esindusOigus';
    return $this->invokeWithRedis('esindusOigus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getEducationalInstitutionName(array $params = []){
    $params['key'] = 'klassifikaator';
    $return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);
    if(!$return['redis_hit']){

      return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
    }
    unset($return['redis_hit']);
    return $return;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getOptionsTaxonomy(array $params = []){
    $params['key'] = 'klassifikaator';
    $return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);

    if(!$return['redis_hit']){
      return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
    }
    $processedArray = [];
    foreach($return as $key => $value) {
      if($key !== 'redis_hit' && (!$value['valid'] || isset($value['okLiik']))){
        $processedArray[] = [
          'key' => $value['et'],
          'value' => $key,
        ];
      }
    }
    return $processedArray;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getEducationalInstitution(array $params = []){
    $params['url'] = [$params['id'], $this->getCurrentUserIdRegCode(), $this->getCurrentUserIdRegCode(TRUE)];
    $params['key'] = $this->getCurrentUserIdRegCode();
    $params['hash'] = 'educationalInstitution_'.$params['id'];
    $response = $this->invokeWithRedis('getEducationalInstitution', $params, FALSE);
    if(isset($params['addTitle']) && $params['addTitle']){
      $this->addTitles($response);
    }
    return $response;
  }

  public function getEducationalInstitutionClassificators(array $params = []){
    $taxonomy = [];
    foreach($this->ed_map as $key => $value){
      $taxonomy[$key] = $this->getAllClassificators(['hash' => $value]);
    }

    return $taxonomy;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getApplications(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode()];
    $params['key'] = $this->getCurrentUserIdRegCode();

    if($this->useReg()) $params['hash'] = 'mtsys';
    if(!$this->useReg()) $params['hash'] = ['OLT', 'vpTaotlus'];

    $response = $this->invokeWithRedis('vpTaotlus', $params);

    // we need to start getDocument service
    if($params['init'] && !isset($response['redis_hit'])){
      $queryparams = $params;
      $queryparams['hash'] = 'getDocuments';
      $init = $this->invokeWithRedis('getDocuments', $queryparams, FALSE);
      if(!isset($init['MESSAGE']) && $init['MESSAGE'] != 'WORKING') {
        throw new RequestException('Service down');
      }
    }

    $workedResponse = $this->applicationPathWorker($response);
    if(isset($workedResponse['educationalInstitutions'])){
      foreach($workedResponse['educationalInstitutions'] as &$institution){
        $institution = $this->applicationPathWorker($institution);
      }
    }

    if(is_array($params['hash'])) {
      foreach($params['hash'] as $hash) {
        $this->getFormDefinitionTitle($workedResponse, $hash);
      }
    } else {
      $this->getFormDefinitionTitle($workedResponse, $params['hash']);
    }
    if(isset($params['get_edi_data']) && $params['get_edi_data']){
      $this->addInstitutionData($workedResponse);
    }
    return $workedResponse;
  }

  private function applicationPathWorker($datafields){
    $workedValues = [];
    foreach($datafields as &$field){
      if(is_array($field)){
        foreach($field as &$values){
          if(isset($values['form_name'])){
            $values['form_path'] = isset($workedValues[$values['form_name']]) ? $workedValues[$values['form_name']] : $this->getEntityFormPath($values['form_name']);
          }
        }
      }
    }
    return $datafields;
  }

  private function getEntityFormPath ($form_name)
  {
    $entityStorage = \Drupal::entityTypeManager()->getStorage('x_json_entity');
    $connection = \Drupal::database();
    $query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition->'header'->>'form_name' = :id ", [':id' => $form_name]);
    $result = $query->fetchField();
    if ($result) {
      $entity = $entityStorage->load($result);
      $response = urldecode($entity->toUrl()->toString());
      return $response;
    }
    return false;
  }

  /**
   * @param array $params
   * @return mixed
   */
  private function getAllClassificators(array $params = []){
    $params['key'] = 'klassifikaator';
    return json_decode($this->client->hGet($params['key'], $params['hash']), TRUE);
  }

  /**
   * @return mixed
   */
  private function getxJsonService(){
    return \Drupal::service('htm_custom_xjson_services.default');
  }

  /**
   * @param $response
   * @param $type
   * @return mixed
   */
  private function getFormDefinitionTitle(&$response, $type){
    $form_topics = ['documents', 'drafts', 'acceptable_forms'];

    switch ($type){
      case 'mtsys':
        foreach($response['educationalInstitutions'] as &$educationalInstitution){
          $this->appendFormTitle($educationalInstitution, $form_topics);
        }
        break;
      case 'vpTaotlus':
      case 'OLT':
        $this->appendFormTitle($response, $form_topics);
        break;
    }

    return $response;
  }

  private function addInstitutionData(&$response){
    if(isset($response['educationalInstitutions'])){
      foreach($response['educationalInstitutions'] as &$institution){
        $institution_data  = $this->getEducationalInstitution(['id' => $institution['id'], 'addTitle' => true]);
        if(isset($institution_data['educationalInstitution']) && !empty($institution_data['educationalInstitution'])) $institution['institutionInfo'] = $institution_data['educationalInstitution'];
      }
    }
    return $response;
  }

  /**
   * @param $obj
   * @param $form_topics
   * @return mixed
   */
  private function appendFormTitle(&$obj, $form_topics){
    array_walk($obj, function (&$value, $key, $form_topics){
      if(in_array($key, $form_topics)){
        foreach($value as &$item){
          $d = self::getxJsonService()->getEntityJsonObject($item['form_name']);
          if($d){
            $item['title'] = $d['body']['title'];
          }else{
            $item['title'] = ['et' => 'Puudub', 'en' => 'Not Found'];
          }
        }
      }
    }, $form_topics);

    return $obj;
  }

  /**
   * @param $response
   * @return mixed
   */
  private function addTitles(&$response){
    if(isset($response['educationalInstitution'])){
      array_walk($response['educationalInstitution'], function(&$item, $key, $data){
        $elm_topics = array_keys($data['topics']);
        foreach($item as $value_key => &$value ){
          if(in_array($value_key, $elm_topics)){
            $redis_value = self::getAllClassificators(['hash' => $data['topics'][$value_key]]);
            $item[$value_key.'Type'] = ($d = $redis_value[$value]) ? $d : ['et' => 'Puudub', 'valid' => false];
          }
        }
      }, ['topics' => $this->ed_map]);
    }

    return $response;
  }

  private function buildInstitutionData($data, $edit = FALSE){

    if($edit){
      $existing_institution = $data['existing']['institution']['educationalInstitution'];
    }

    $map = [
      'educationalInstitutionId'  => ($edit) ? (int) $data['edId'] : NULL,
      'ownerId'  => (int) $this->getCurrentUserIdRegCode(),
      'ownerName'  => $this->currentRole['current_role']['data']['nimi'],
      'educationalInstitution'  => [
        'generalData'  => [
          'owner' => ($edit) ? $existing_institution['generalData']['owner'] : '', //optional, uue õppeasutuse lisamiseks ei ole vaja, õppeasutuse andmete muutmisel saab väärtuse REST /api/getEducationalInstitution/ endpointist
          'name'  => ($edit) ? $existing_institution['generalData']['name'] : $data['general']['name'],
          'nameENG'  => ($edit) ? $existing_institution['generalData']['nameENG'] : $data['general']['nameENG'], //optional
          'ownerType'  => ($edit) ? $existing_institution['generalData']['ownerType'] : $data['general']['ownerType'],
          'ownershipType'  => ($edit) ? $existing_institution['generalData']['ownershipType'] : $data['general']['ownershipType'],
          'studyInstitutionType' => ($edit) ? $existing_institution['generalData']['studyInstitutionType'] : $data['general']['studyInstitutionType']
        ],
        'address' => [
          'seqNo' => $data['address']['seqNo'],
          'adsId' => $data['address']['adsId'],
          'adsOid' => $data['address']['adsOid'],
          'klElukoht' => $data['address']['klElukoht'],
          'county' => $data['address']['county'],
          'localGovernment' => $data['address']['localGovernment'] ,
          'settlementUnit' => $data['address']['settlementUnit'] ,
          'address' => $data['address']['address'] ,
          'addressFull' => $data['address']['addressFull'] ,
          'addressHumanReadable' => $data['address']['addressHumanReadable']
        ],
        'contacts'  => [
          'contactPhone'  => $data['contacts']['contactPhone'],
          'contactEmail'  => $data['contacts']['contactEmail'],
          'webpageAddress'  => $data['contacts']['webpageAddress']
        ]
      ]
    ];

    return $map;
  }

}
