<?php
  class URL {
    function getPrefix() {
      return 'http://htm.wiseman.ee';
    }

    function requestKey() {
      $map = array(
        "uudised" => "newsSingel",
        "sündmused" => "getEventSingle",
        "erialad" => "studyProgrammeSingle",
        "ametialad" => "oskaMainProfessionDetailView",
        "valdkonnad" => "oskaFieldDetailView",
        "tööjõuprognoos" => "oskaSurveyPageDetailView",
        "oska-tulemused" => "oskaResultPageDetailView",
        "kool" => "getSchoolSingle",
        "artiklid" => "getArticle"
      );
      $path = explode('/', $_SERVER['REQUEST_URI'])[2];
      return $map[urldecode($path)];
    }

    function getRequestID() {
      $path = $this->getPrefix().'/variables';
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
      $data = json_decode(file_get_contents($path));
      return $data->data->route ? $data->data->route->entity : false;
    }
  }

  $URL = new URL();

?>