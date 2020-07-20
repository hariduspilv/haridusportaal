<?php
  header('Content-Type: application/json');
  $title = 'Haridusportaal';
  $version = $_ENV['VERSION'] ? $_ENV['VERSION'] : '0.0.0';
  $apiStatus = file_get_contents('https://api.hp.edu.ee/translations?_format=json&lang=etas') ? true : false;
  $ch = curl_init('https://api.github.com/repos/hariduspilv/haridusportaal/releases');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
  curl_setopt($ch, CURLOPT_TIMEOUT, 3);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
  curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:75.0) Gecko/20100101 Firefox/75.0");

  $releases = json_decode(curl_exec($ch));

  $output = array(
    "title" => $title,
    "version" => $version,
    "api_status" => $apiStatus,
    "releases" => $releases,
  );

  echo json_encode($output);

?>