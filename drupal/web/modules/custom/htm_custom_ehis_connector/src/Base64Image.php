<?php
namespace Drupal\htm_custom_ehis_connector;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class Base64Image{
	protected $base64Image;
	protected $fileData;
	protected $fileName;
	protected $mimeType;
	protected $fileIdentifier;

	public function __construct($base64Image)
	{
		$this->base64Image = $base64Image;
		$this->decodeBase64Image();
	}

	protected function decodeBase64Image(){
		$this->fileData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $this->base64Image));
		if($this->fileData === FALSE){
			throw new BadRequestHttpException('File could not be processed');
		}

		$f = finfo_open();
		$mimeType = finfo_buffer($f, $this->fileData, FILEINFO_MIME_TYPE);
		$ext = $this->getMimeTypeExtension($mimeType);
		$this->mimeType = $mimeType;
		$randomId = uniqid(rand());
		$this->fileName = $randomId . $ext;
		$this->fileIdentifier = $randomId;


	}

	protected function getMimeTypeExtension($mimeType){
		$insecure_filename = preg_match('/\/(x-php|php|pl|py|cgi|asp|js)(\.|$)/i', $mimeType);
		if($insecure_filename){
			throw new BadRequestHttpException('Potentially executable file!');
		}
		$mimeTypes = [
			'image/png' => 'png',
			'image/jpeg' => 'jpeg',
			'application/pdf' => 'pdf'
		];
		if(isset($mimeTypes[$mimeType])){
			return '.' . $mimeTypes[$mimeType];
		} else {
			$split = explode('/', $mimeType);
			return '.' . $split[1];
		}
	}

	public function getFileData(){
		return $this->fileData;
	}

	public function getFileName(){
		return $this->fileName;
	}

	public function getRawData(){
		return $this->base64Image;
	}

	public function getMimeType(){
		return $this->mimeType;
	}

	public function getFileIdentifier(){
		return $this->fileIdentifier;
	}

}