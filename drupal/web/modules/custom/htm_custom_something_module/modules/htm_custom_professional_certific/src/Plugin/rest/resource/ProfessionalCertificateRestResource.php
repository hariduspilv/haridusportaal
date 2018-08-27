<?php

namespace Drupal\htm_custom_professional_certific\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Drupal\user\Entity\User;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "professional_certificate_rest_resource",
 *   label = @Translation("Professional certificate rest resource"),
 *   uri_paths = {
 *     "canonical" = "/professional-certificate"
 *   }
 * )
 */
class ProfessionalCertificateRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new ProfessionalCertificateRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('htm_custom_professional_certific'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to GET requests.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {
		#dump($this->getCurrentUserIdCode());
		$json = $this->dummyJson($this->getCurrentUserIdCode());
		#dump($json);
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    return new ResourceResponse($json, 200);
  }

  private function dummyJson($id_code){
  	$json = '[
  						{
							"38405175216" : {
								"request_timestamp" : '.strtotime('now').',
								"response_timestamp" : '.strtotime('+1min').',
								"key" : "kutsetunnistused_38405175216",
								"value" : {
									"kirjeid" : 2,
									"teade" : "",
									"kutsetunnistused": [
											{	
													"registrinumber" : "85774",
													"nimi" : "nimi10498744",
													"isikukood" : "38405175216",
													"synniaeg" : "DD.MM.YYYY",
													"tyyp" : "Kutsetunnistused",
													"standard" : "Abitreener, tase 3",
													"ekrtase" : "3",
													"eqftase" : "3",
													"spetsialiseerumine" : "Ujumine",
													"osakutse" : "",
													"lisavali" : "",
													"kompetentsid" : "",
													"valdkond" : "Haridus ja kultuur",
													"kutseala" : "Sport",
													"hariduslikkval" : "",
													"keel" : "eesti keel",
													"valjastaja" : "Eesti Olümpiakomitee",
													"valjaantud" : "27.11.2013",
													"kehtibalates": "27.11.2013",
													"kehtibkuni" : "26.11.2017",
													"isco": "3 Tehnikud ja keskastme spetsialistid, 34 Õigus-, sotsiaal-, kultuuri- jms valdkonna keskastme spetsialistid",
													"reaid" : "1",
													"duplikaat" : false,
													"kehtetu" : false,
													"kustutatud" : false
										},
										{	
													"registrinumber" : "127102",
													"nimi" : "nimi10610534",
													"isikukood" : "38405175216",
													"synniaeg" : "DD.MM.YYYY",
													"tyyp" : "Kutsetunnistused",
													"standard" : "Keevitaja, tase 3",
													"ekrtase" : "3",
													"eqftase" : "3",
													"spetsialiseerumine" : "",
													"osakutse" : "",
													"lisavali" : "",
													"kompetentsid" : "",
													"valdkond" : "",
													"kutseala" : "",
													"hariduslikkval" : "",
													"keel" : "Inglise keel",
													"valjastaja" : "KOO-MET OÜ",
													"valjaantud" : "13.06.2016",
													"kehtibalates": "13.06.2016",
													"kehtibkuni" : "12.06.2021",
													"isco": "",
													"reaid" : "2",
													"duplikaat" : true,
													"kehtetu" : false,
													"kustutatud" : false
										}
									]
								}
							}
					},
					{
							"39505090897" : {
								"request_timestamp" : '.strtotime('now').',
								"response_timestamp" : '.strtotime('+1min').',
								"key" : "kutsetunnistused_39505090897",
								"value" : {
									"kirjeid" : 1,
									"teade" : "",
									"kutsetunnistused": [
									{	"registrinumber" : "106697",
													"nimi" : "nimi10587570",
													"isikukood" : "39505090897",
													"synniaeg" : "DD.MM.YYYY",
													"tyyp" : "Kutsetunnistus",
													"standard" : "Turvasüsteemide tehnik, tase 5",
													"ekrtase" : "5",
													"eqftase" : "5",
													"spetsialiseerumine" : "",
													"osakutse" : "",
													"lisavali" : "",
													"kompetentsid" : "Turvasüsteemide paigaldamine ja hooldamine; Tulekahjusignalisatsioonisüsteemi paigaldamine ja hooldamine",
													"valdkond" : "Valdkond",
													"kutseala" : "",
													"hariduslikkval" : "",
													"keel" : "Eesti keel",
													"valjastaja" : "Eesti Turvaettevõtete Liit",
													"valjaantud" : "28.01.2016",
													"kehtibalates": "28.01.2016",
													"kehtibkuni" : "27.01.2019",
													"isco": "",
													"reaid" : "",
													"duplikaat" : false,
													"kehtetu" : false,
													"kustutatud" : false
													}
									]
								}
							}
					}
					]';
		$error = '
  	{
				"request_timestamp" : "unix_timestamp",
				"response_timestamp" : "unix_timestamp",
				"key" : "kutsetunnistused + personalcode",
				"value" : {},
				"error":  {
					"message_type" : "ERROR",
					"message_text" : {
						"et" : "Tehniline viga!"
					}
				}
			}
  	';
		$decoded = json_decode($json, TRUE);
		$error = json_decode($error, TRUE);
		foreach ($decoded as $item){
			if($item[$id_code]){
				return $item[$id_code];
			}
		}
		return $error;
	}

	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

}
