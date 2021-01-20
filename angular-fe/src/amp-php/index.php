<?php
  require_once('./helpers/Mustache/Autoloader.php');
  require('./helpers/url.php');
  require('./helpers/FieldVaryService.php');

  Mustache_Autoloader::register();
  $m = new Mustache_Engine;

  if (isset($_GET['src'])) {
    require('./helpers/picto.php');
  } else {

    $data = $FieldVaryService->parse($URL->getData());
    
    if ($data) {
      console.log('running php amp');
      $template = file_get_contents('./resources/template.mustache');
      $styles = file_get_contents('./resources/styles.css');
      $data->styles = $styles;
      $data->fullPath = $URL->getFullPath();
      $data->pageTitle = $URL->requestKey('pageTitle');
      $data->server = $URL->getDomain();
      //echo preg_replace('/\s+/S', " ", $m->render($template, $data));
      echo $m->render($template, $data);
    } else {
      header("Location: ".$URL->getFullPath());
      die();
    }
  }
?>

