<?php
  class URL {
    function getPrefix() {
      $server = $_SERVER['SERVER_NAME'];
      $urlTemplates = (object) [
        "edu.twn.ee" => "https://htm.wiseman.ee",
        "edu.ee" => "https://api.hp.edu.ee",
        "www.edu.ee" => "https://api.hp.edu.ee",
        "test.edu.ee" => "https://apitest.hp.edu.ee",
        "localhost" => "https://htm.wiseman.ee",
        "haridusportaal.edu.ee" => "https://api.hp.edu.ee",
        "fallback" => "https://api.hp.edu.ee"
      ];

      $prefix = isset($urlTemplates->$server) ? $urlTemplates->$server : $urlTemplates->fallback;
      return $prefix;
    }

    function getDomain() {
      return (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
    }

    function requestKey($key = 'queryKey') {
      $map = array(
        "uudised" => array(
          "queryKey" => "newsSingel",
          "pageTitle" => "Uudised"
        ),
        "sündmused" => array(
          "queryKey" => "getEventSingle",
          "pageTitle" => "Sündmused"
        ),
        "erialad" => array(
          "queryKey" => "studyProgrammeSingle",
          "pageTitle" => "Erialad"
        ),
        "ametialad" => array(
          "queryKey" => "oskaMainProfessionDetailView",
          "pageTitle" => "Ametialad"
        ),
        "valdkonnad" => array(
          "queryKey" => "oskaFieldDetailView",
          "pageTitle" => "Valdkonnad"
        ),
        "tööjõuprognoos" => array(
          "queryKey" => "oskaSurveyPageDetailView",
          "pageTitle" => "Tööjõuprognoos"
        ),
        "oska-tulemused" => array(
          "queryKey" => "oskaResultPageDetailView",
          "pageTitle" => "Tulemused"
        ),
        "kool" => array(
          "queryKey" => "getSchoolSingle",
          "pageTitle" => "Õppeasutused"
        ),
        "artiklid" => array(
          "queryKey" => "getArticle",
          "pageTitle" => "Artikkel"
        )
      );
      $path = explode('/', $_SERVER['REQUEST_URI'])[1] == 'amp' ? explode('/', $_SERVER['REQUEST_URI'])[2] : explode('/', $_SERVER['REQUEST_URI'])[1];
      return $map[urldecode($path)][$key];
    }

    function getRequestID() {
      $path = $this->getPrefix().'/variables?_format=json&lang=et';
      $data = json_decode(file_get_contents($path));
      $key = $this->requestKey();
      return $data->request->$key.':1';
    }

    function getPath() {
      return str_replace('/amp', '', $_SERVER['REQUEST_URI']);
    }

    function getFullPath() {
      $url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      $url = str_replace('/amp', '', $url);
      return $url;
    }

    function getData() {
      $id = $this->getRequestID();

      $path = $this->getPrefix().'/graphql?queryId='.$id.'&variables={%22lang%22:%22ET%22,%22path%22:%22'.$this->getPath().'%22}';
      $data = json_decode(file_get_contents($path), false);
      return $data->data->route ? $data->data->route->entity : false;
    }
  }

  $URL = new URL();

?>