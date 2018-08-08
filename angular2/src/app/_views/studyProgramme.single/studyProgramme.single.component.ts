import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { SingleQuery } from '../../_services/studyProgramme/studyProgramme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: "studyProgramme.single.template.html",
  styleUrls: ["studyProgramme.single.styles.scss"]
})

export class StudyProgrammeSingleComponent implements OnInit{

  path: any;
  data: any;
  error: boolean = false;

  map: any;

  mapOptions = {
    lat: 58.8754705,
    lng: 24.5567241,
    zoom: 11
  }

  private compare =  JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ){

  }

  compareChange(id, $event){
    $event.checked === true? this.compare[id] = true : delete this.compare[id];
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
   
  }

  mapReady(map){

    let that = this;
    this.map = map;

    this.map.setCenter({
      lat: this.mapOptions.lat,
      lng: this.mapOptions.lng
    });

    this.map.setZoom(this.mapOptions.zoom);

  }

  getData() {

    let subscription = this.apollo.watchQuery({
      query: SingleQuery,
        variables: {
          path: this.path
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
    }).valueChanges.subscribe( ({data}) => {

      this.data = data['route']['entity'];
      subscription.unsubscribe();
    });
  }

  ngOnInit() {

    this.route.params.subscribe( params => {
      this.path = this.router.url;
      this.getData();
    });
    
  }
}