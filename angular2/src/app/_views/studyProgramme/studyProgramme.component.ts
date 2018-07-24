import { Component, OnInit, OnDestroy } from '@angular/core'
import { ListQuery } from '../../_services/studyProgramme/studyProgramme.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators/delay';

import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
let ddata = [{id: 1, entityLabel: 'Toidutehnoloogia', fieldstudyProgrammeLevel: 'Bakalaureuseõpe', 
              fieldstudyProgrammeAccreditation: 'Täielikult akrediteeritud', fieldstudyProgrammePeriod: '3 aastat', 
              fieldstudyProgrammeLanguages: ['eesti', 'inglise'], fieldstudyProgrammeStudyGroup: 'aiandus',
              fieldstudyProgrammeAcceptance: 'avatud', entityUrl:{path:'/'},fieldSchoolWebpageAddress: '/'},

              {id: 2, entityLabel: 'Infotehnoloogia', fieldstudyProgrammeLevel: 'Bakalaureuseõpe', 
              fieldstudyProgrammeAccreditation: 'Osaliselt akrediteeritud', fieldstudyProgrammePeriod: '3,5 aastat', 
              fieldstudyProgrammeLanguages: ['eesti', 'inglise'], fieldstudyProgrammeStudyGroup: 'kokandus',
              fieldstudyProgrammeAcceptance: 'avatud', entityUrl:{path:'/'},fieldSchoolWebpageAddress: '/'}];
@Component({
  styleUrls: ['studyProgramme.styles.scss'],
  templateUrl: 'studyProgramme.template.html'
})

export class StudyProgrammeComponent implements OnInit, OnDestroy{
  private list:any = false;
  private loading: boolean = true;
  private dataSubscription: Subscription;
  private showFilter: boolean;
  
  constructor (
    /*private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute, */
    private apollo: Apollo
  ) {}

  getData() {
    this.loading = true;


    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
    
    this.dataSubscription = this.apollo.watchQuery({
      query: ListQuery,
      variables: {
        lang: "ET",
        offset: 0,
        limit: 50
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe( ({data}) => {

      this.loading = false;
      console.log(data);
      this.list = ddata//data['nodeQuery']['entities'];
      console.log(this.list);
      this.dataSubscription.unsubscribe();

    });

  }

  ngOnInit() {
    this.getData();
  }
  ngOnDestroy() {
    /* Clear all subscriptions */
  }

}
