<?php
namespace Drupal\htm_custom_ehis_connector;

use Mimey\MimeMappingBuilder;
use Mimey\MimeTypes;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class Base64Image{
  protected $base64Image;
  protected $mimes;
  protected $fileData;
  protected $fileName;
  protected $mimeType;
  protected $fileIdentifier;
  protected $extensions;

  public function __construct($base64Image, $file_path, $fileName)
  {
    $this->base64Image = $base64Image;
    $this->filePath = $file_path;
    $this->fileName = $fileName;
    $this->mimeType = $this->setMimeType();
    $this->fileIdentifier = $this->setIdentifier();
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

  protected function setMimeType(){
    $this->builder = MimeMappingBuilder::create();
    $this->builder->add('application/x-ddoc', 'ddoc');
    $this->builder->add('application/vnd.etsi.asic-e+zip', 'bdoc');
    $this->builder->add('application/vnd.etsi.asic-e+zip', 'asice');
    $this->builder->add('application/vnd.etsi.asic-e+zip', 'sce');

    $mimes = new MimeTypes($this->builder->getMapping());



    return $mimes->getMimeType($this->getFileExtension());
  }

  protected function setIdentifier(){
    $randomId = uniqid(rand());
    return $randomId;
  }

  protected function getFileExtension(){
    return substr($this->fileName, strrpos($this->fileName, '.')+1);
  }

}
