import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { SingleQuery } from '../../_services/studyProgramme/studyProgramme.service';

@Component({
  templateUrl: "studyProgramme.single.template.html",
  styleUrls: ["studyProgramme.single.styles.scss"]
})

export class StudyProgrammeSingleComponent implements OnInit{

  parseFloat = parseFloat;
  path: any;
  data: any;
  error: boolean = false;
  map: any;
  
  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute
  ){

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