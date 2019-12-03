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
    echo $m->render($template, $data);
  } else {
    header("Location: ".$URL->getFullPath());
    die();
  }

?>

