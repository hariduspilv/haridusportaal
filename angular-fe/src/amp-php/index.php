<?php
  require('./helpers/Mustache.php');
  require('./helpers/url.php');
  require('./helpers/FieldVaryService.php');

  $m = new Mustache;

  $data = $FieldVaryService->parse($URL->getData());

  if ($data) {
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

?>

