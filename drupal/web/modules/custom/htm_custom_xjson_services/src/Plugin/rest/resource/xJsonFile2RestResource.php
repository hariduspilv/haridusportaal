<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Component\Render\PlainTextOutput;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Config\Config;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Lock\LockBackendInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\htm_custom_ehis_connector\Base64Image;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\RequestHandler;
use Drupal\token\Token;
use Hshn\Base64EncodedFile\HttpFoundation\File\Base64EncodedFile;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\MimeType\MimeTypeGuesserInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Route;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "x_json_file2rest_resource",
 *   label = @Translation("X json file2rest resource"),
 *   uri_paths = {
 *     "canonical" = "/xjson_service/documentFile2/{file_id}/{file_name}/{form_key}",
 *     "create" = "/xjson_service/documentFile2/{form_name}/{field_name}"
 *   }
 * )
 */
class xJsonFile2RestResource extends ResourceBase {

  /**
   * The regex used to extract the filename from the content disposition header.
   *
   * @var string
   */
  const REQUEST_HEADER_FILENAME_REGEX = '@\bfilename(?<star>\*?)=\"(?<filename>.+)\"@';

  /**
   * The amount of bytes to read in each iteration when streaming file data.
   *
   * @var int
   */
  const BYTES_TO_READ = 8192;

  /**
   * The file system service.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  protected $xjsonService;

  protected $ehisService;

  protected $token;

  protected $systemFileConfig;

  protected $lock;

  protected $currentUser;

  protected $mimeTypeGuesser;

  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger, FileSystemInterface $file_system, xJsonService $xJsonService, EhisConnectorService $ehisConnectorService, Token $token, LockBackendInterface $lock, Config $system_file_config, AccountInterface $current_user, MimeTypeGuesserInterface $mime_type_guesser)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->fileSystem = $file_system;
    $this->xjsonService = $xJsonService;
    $this->ehisService = $ehisConnectorService;
    $this->token = $token;
    $this->lock = $lock;
    $this->systemFileConfig = $system_file_config;
    $this->currentUser = $current_user;
    $this->mimeTypeGuesser = $mime_type_guesser;
  }


  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition){
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('xjson_file'),
      $container->get('file_system'),
      $container->get('htm_custom_xjson_services.default'),
      $container->get('htm_custom_ehis_connector.default'),
      $container->get('token'),
      $container->get('lock'),
      $container->get('config.factory')->get('system.file'),
      $container->get('current_user'),
      $container->get('file.mime_type.guesser')
    );
  }

  /**
   * {@inheritdoc}
   */
  /*public function permissions() {
      // Access to this resource depends on field-level access so no explicit
      // permissions are required.
      // @see \Drupal\file\Plugin\rest\resource\FileUploadResource::validateAndLoadFieldDefinition()
      // @see \Drupal\rest\Plugin\rest\resource\EntityResource::permissions()
      return [];
  }*/


  public function get(Request $request, $file_id, $file_name, $form_key) {
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    $params = [
      'hash' => $file_id
    ];

    $file_obj['value'] = $this->ehisService->getDocumentFileFromRedis($params);
    $file_obj['fileName'] = $file_name;

    if(!$file_obj['value']){
      $docParams = [
        'file_id' => $file_id
      ];
      if($request->query->get('doc_id') !== NULL) {
        $docParams['doc_id'] = $request->query->get('doc_id');
      }
      $file_obj = $this->ehisService->getDocumentFile($docParams);
    }

    if($file_obj && ($file_obj['fileName'] && $file_obj['value'])){
      $sym_file = new Base64EncodedFile($file_obj['value']);
      $response = new BinaryFileResponse($sym_file->getRealPath());
      $response->setContentDisposition(
        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        $file_obj['fileName']
      );
      return $response;
    }

    return new ModifiedResourceResponse('File not found', 400);
  }

  public function post(Request $request, $form_name, $field_name)
  {
    $request_body = json_decode($request->getContent());
    $filename = $this->validateAndParseContentDispositionHeader($request);
    $validators = isset($request_body->table_element) ? $validators = $this->validateAndLoadxJsonFieldDefinition($form_name, $field_name, $request_body->table_element) : $this->validateAndLoadxJsonFieldDefinition($form_name, $field_name);

    $file_hash = $request_body->file;
    $redis_key = $this->ehisService->getCurrentUserIdRegCode();

    $destination = $this->getUploadLocation();
    $prepared_filename = $this->prepareFileName($filename, $validators);

    $file_uri = "{$destination}/{$prepared_filename}";

    $temp_file_path = $this->streamUploadData();
    $lock_id = $this->generateLockIdFromFileUri($file_uri);

    if (!$this->lock->acquire($lock_id)) {
      throw new HttpException(503, sprintf('File "%s" is already locked for writing'), NULL, ['Retry-After' => 1]);
    }

    // Begin building file entity.
    $file = File::create([]);
    $file->setOwnerId($this->currentUser->id());
    $file->setFilename($prepared_filename);
    $file->setMimeType($this->mimeTypeGuesser->guess($prepared_filename));
    $file->setFileUri($file_uri);
    // Set the size. This is done in File::preSave() but we validate the file
    // before it is saved.
    $file->setSize(@filesize($temp_file_path));

    $this->validate($file, $validators);

    // now make our own file for xjson
    $file = new Base64Image($file_hash, $temp_file_path, $filename);

    dump($file);
    dump($redis_key);
    if(!$this->ehisService->saveFileToRedis($file, $redis_key)){
      return new ModifiedResourceResponse('Failed to save', 400);
    }

    $this->lock->release($lock_id);

    return new ModifiedResourceResponse([
      'mime_type' => $file->getMimeType(),
      'id' => $file->getFileIdentifier(),
      'file_name' => $file->getFileName(),
    ], 201);
  }

  protected function getUploadLocation(){
    $desination = "[date:custom:Y]-[date:custom:m]";
    $desination = PlainTextOutput::renderFromHtml($this->token->replace($desination, []));
    return 'private://xjson_files/'.$desination;
  }


  /**
   * Streams file upload data to temporary file and moves to file destination.
   *
   * @return string
   *   The temp file path.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Thrown when input data cannot be read, the temporary file cannot be
   *   opened, or the temporary file cannot be written.
   */
  protected function streamUploadData() {
    // 'rb' is needed so reading works correctly on Windows environments too.
    $file_data = fopen('php://input', 'rb');
    $temp_file_path = $this->fileSystem->tempnam('temporary://', 'file');
    $temp_file = fopen($temp_file_path, 'wb');
    if ($temp_file) {
      while (!feof($file_data)) {
        $read = fread($file_data, static::BYTES_TO_READ);

        if ($read === FALSE) {
          // Close the file streams.
          fclose($temp_file);
          fclose($file_data);
          $this->logger->error('Input data could not be read');
          throw new HttpException(500, 'Input file data could not be read');
        }

        if (fwrite($temp_file, $read) === FALSE) {
          // Close the file streams.
          fclose($temp_file);
          fclose($file_data);
          $this->logger->error('Temporary file data for "%path" could not be written', ['%path' => $temp_file_path]);
          throw new HttpException(500, 'Temporary file data could not be written');
        }
      }
      // Close the temp file stream.
      fclose($temp_file);
    }
    else {
      // Close the input file stream since we can't proceed with the upload.
      // Don't try to close $temp_file since it's FALSE at this point.
      fclose($file_data);
      $this->logger->error('Temporary file "%path" could not be opened for file upload', ['%path' => $temp_file_path]);
      throw new HttpException(500, 'Temporary file could not be opened');
    }

    // Close the input stream.
    fclose($file_data);

    return $temp_file_path;
  }

  /**
   * Validates and extracts the filename from the Content-Disposition header.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return string
   *   The filename extracted from the header.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
   *   Thrown when the 'Content-Disposition' request header is invalid.
   */
  protected function validateAndParseContentDispositionHeader(Request $request) {
    // Firstly, check the header exists.
    if (!$request->headers->has('content-disposition')) {
      throw new BadRequestHttpException('"Content-Disposition" header is required. A file name in the format "filename=FILENAME" must be provided');
    }

    $content_disposition = $request->headers->get('content-disposition');

    // Parse the header value. This regex does not allow an empty filename.
    // i.e. 'filename=""'. This also matches on a word boundary so other keys
    // like 'not_a_filename' don't work.
    if (!preg_match(static::REQUEST_HEADER_FILENAME_REGEX, $content_disposition, $matches)) {
      throw new BadRequestHttpException('No filename found in "Content-Disposition" header. A file name in the format "filename=FILENAME" must be provided');
    }

    // Check for the "filename*" format. This is currently unsupported.
    if (!empty($matches['star'])) {
      throw new BadRequestHttpException('The extended "filename*" format is currently not supported in the "Content-Disposition" header');
    }

    // Don't validate the actual filename here, that will be done by the upload
    // validators in validate().
    // @see \Drupal\file\Plugin\rest\resource\FileUploadResource::validate()
    $filename = $matches['filename'];

    // Make sure only the filename component is returned. Path information is
    // stripped as per https://tools.ietf.org/html/rfc6266#section-4.3.
    return $this->fileSystem->basename($filename);
  }

  protected function validateAndLoadxJsonFieldDefinition($form_name, $field_name, $table_field = false){
    $defElement = $this->xjsonService->searchDefinitionElement($field_name, NULL, $form_name);
    $defElement = reset($defElement);
    if($table_field && isset($defElement['table_columns'][$table_field])){
      $defElement = $defElement['table_columns'][$table_field];
    }
    if(!isset($defElement['acceptable_extensions'])){
      throw new NotFoundHttpException(sprintf('Field "%s" does not exist', $field_name));
    }
    $return = [
      'file_validate_extensions' => [implode(' ', $defElement['acceptable_extensions'])],
      'file_validate_size' => [$this->getMaximumFileUploadSize()]
    ];
    return $return;
  }


  /**
   * {@inheritdoc}
   */
  protected function getBaseRoute($canonical_path, $method) {
    return new Route($canonical_path, [
      '_controller' => RequestHandler::class . '::handleRaw',
    ],
      $this->getBaseRouteRequirements($method),
      [],
      '',
      [],
      // The HTTP method is a requirement for this route.
      [$method]
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getBaseRouteRequirements($method) {
    $requirements = parent::getBaseRouteRequirements($method);

    // Add the content type format access check. This will enforce that all
    // incoming requests can only use the 'application/octet-stream'
    // Content-Type header.
    $requirements['_content_type_format'] = 'bin';

    return $requirements;
  }



  /**
   * Prepares the filename to strip out any malicious extensions.
   *
   * @param string $filename
   *   The file name.
   * @param array $validators
   *   The array of upload validators.
   *
   * @return string
   *   The prepared/munged filename.
   */
  protected function prepareFilename($filename, array &$validators) {
    if (!empty($validators['file_validate_extensions'][0])) {
      // If there is a file_validate_extensions validator and a list of
      // valid extensions, munge the filename to protect against possible
      // malicious extension hiding within an unknown file type. For example,
      // "filename.html.foo".
      $filename = file_munge_filename($filename, $validators['file_validate_extensions'][0]);
    }

    // Rename potentially executable files, to help prevent exploits (i.e. will
    // rename filename.php.foo and filename.php to filename.php.foo.txt and
    // filename.php.txt, respectively). Don't rename if 'allow_insecure_uploads'
    // evaluates to TRUE.
    if (!$this->systemFileConfig->get('allow_insecure_uploads') && preg_match(FILE_INSECURE_EXTENSION_REGEX, $filename) && (substr($filename, -4) != '.txt')) {
      // The destination filename will also later be used to create the URI.
      $filename .= '.txt';

      // The .txt extension may not be in the allowed list of extensions. We
      // have to add it here or else the file upload will fail.
      if (!empty($validators['file_validate_extensions'][0])) {
        $validators['file_validate_extensions'][0] .= ' txt';
      }
    }

    return $filename;
  }

  /**
   * Generates a lock ID based on the file URI.
   *
   * @param $file_uri
   *   The file URI.
   *
   * @return string
   *   The generated lock ID.
   */
  protected static function generateLockIdFromFileUri($file_uri) {
    return 'file:rest:' . Crypt::hashBase64($file_uri);
  }

  /**
   * Validates the file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file entity to validate.
   * @param array $validators
   *   An array of upload validators to pass to file_validate().
   *
   * @throws \Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException
   *   Thrown when there are file validation errors.
   */
  protected function validate(FileInterface $file, array $validators) {
    // Validate the file based on the field definition configuration.
    $errors = file_validate($file, $validators);

    if (!empty($errors)) {
      $message = "Unprocessable Entity: file validation failed.\n";
      $message .= implode("\n", array_map(function ($error) {
        return PlainTextOutput::renderFromHtml($error);
      }, $errors));

      throw new UnprocessableEntityHttpException($message);
    }
  }

  /**
   * This function returns the maximum files size that can be uploaded
   * in PHP
   * @returns int File size in bytes
   **/
  protected function getMaximumFileUploadSize()
  {
    return min($this->convertPHPSizeToBytes(ini_get('post_max_size')), $this->convertPHPSizeToBytes(ini_get('upload_max_filesize')));
  }

  /**
   * This function transforms the php.ini notation for numbers (like '2M') to an integer (2*1024*1024 in this case)
   *
   * @param string $sSize
   * @return integer The value in bytes
   */
  protected function convertPHPSizeToBytes($sSize)
  {
    //
    $sSuffix = strtoupper(substr($sSize, -1));
    if (!in_array($sSuffix,array('P','T','G','M','K'))){
      return (int)$sSize;
    }
    $iValue = substr($sSize, 0, -1);
    switch ($sSuffix) {
      case 'P':
        $iValue *= 1024;
      // Fallthrough intended
      case 'T':
        $iValue *= 1024;
      // Fallthrough intended
      case 'G':
        $iValue *= 1024;
      // Fallthrough intended
      case 'M':
        $iValue *= 1024;
      // Fallthrough intended
      case 'K':
        $iValue *= 1024;
        break;
    }
    return (int)$iValue;
  }

}
