import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingsService } from '../../_core/settings';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: "related-studyprogrammes",
  templateUrl: "related.studyProgrammes.component.html",
  styleUrls: ["related.studyProgrammes.component.scss"]
})

export class RelatedStudyProgrammesComponent implements OnInit, OnDestroy {
  
  @Input() studyProgrammeId: number;
  private url;
  private lang: string;
  private subscriptions: Subscription[] = [];

  public list: any = false;
  public search_address;
  

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpClient,
    public rootScope: RootScopeService,
    private settings: SettingsService
  ) { 
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  
  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/study-programmes/compare/',
      'et': '/et/erialad/vordlus'
    });
  }
  getData(address){

    let variables = {
      lang: this.lang.toUpperCase(),
      nid: this.studyProgrammeId
    }
    if(address) variables['address'] = address;

    this.url = this.settings.url + "/graphql?queryId=similarStudyProgrammes:1&variables=" + JSON.stringify(variables);
    
    let subscribe = this.http.get(this.url).subscribe(response => {
      
      this.list = response['data']['CustomStudyProgrammeElasticQuery'];

      this.list.forEach(programme => {
        //convert string to number
        programme.Nid = parseInt(programme.Nid);
        //Split CSV of teaching languages to an array
        programme.FieldTeachingLanguage = programme.FieldTeachingLanguage.split(',');
      })

      
    });
    this.subscriptions = [...this.subscriptions, subscribe];
  }
  ngOnInit() {
    this.pathWatcher()
    this.setPaths();
    this.getData(null);
  }
  ngOnDestroy(){
     /* Clear all subscriptions */
     for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}