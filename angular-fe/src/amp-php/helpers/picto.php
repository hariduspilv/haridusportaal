<?php

  header("Content-Type: image/png");
  require('dom.php');

  $link = $_GET['src'];
  $file = basename($link);
  $file = basename($link, ".svg");
  $destination = $file."-".md5($_GET['src']);

  function generatePicto() {
    global $link, $file, $destination;
    $width = 756;
    $height = 756;
    $color = "#2e3374";
  
    $pictoSrc = 'pictos/picto-'.rand(1,5).'.png';
    $picto = new Imagick($pictoSrc);
    $svg = file_get_contents($link);
    $html = str_get_html($svg);
    $html->find('svg', 0)->width = $width.'px';
    $html->find('svg', 0)->height = $height.'px';
    $svg = $html;
  
    $im = new Imagick();
    $im->setBackgroundColor(new ImagickPixel('transparent')); 
    $im->readImageBlob($svg);
    $im->resizeImage($width, $height, Imagick::FILTER_POINT, 0, true);
    $im->setImageFormat("png24");
  
    $im->setImageAlphaChannel(Imagick::ALPHACHANNEL_EXTRACT);
    $im->setImageBackgroundColor($color);
    $im->setImageAlphaChannel(Imagick::ALPHACHANNEL_SHAPE);
    $picto->compositeImage($im, $im->getImageCompose(), 0, 0);

    file_put_contents("files/".$destination.".png", $picto);
    echo $picto->getImageBlob();
  }

  if( file_exists("files/".$destination.".png") ){
    echo file_get_contents("files/".$destination.".png");
  }else {
    generatePicto();
  }
  
?>