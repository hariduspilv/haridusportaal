import { Component, Input, OnInit} from '@angular/core';
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

export class RelatedStudyProgrammesComponent implements OnInit {
  @Input() studyProgrammeId: number;
  private url;
  private lang: string;
  public list: any = false;
  private subscriptions: Subscription[] = [];
  private dataSubscription;

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
  getData(){

    let variables = {
      lang: this.lang.toUpperCase(),
      nid: this.studyProgrammeId
    }

    this.url = this.settings.url + "/graphql?queryId=similarStudyProgrammes:1&variables=" + JSON.stringify(variables);
    
    this.dataSubscription = this.http.get(this.url).subscribe(response => {
      
      this.list = response['data']['CustomStudyProgrammeElasticQuery'];

      this.list.forEach(programme => {
        //convert string to number
        programme.Nid = parseInt(programme.Nid);
        //Split CSV of teaching languages to an array
        programme.FieldTeachingLanguage = programme.FieldTeachingLanguage.split(',');
      })

      this.dataSubscription.unsubscribe();
    });
  }
  ngOnInit() {
    this.pathWatcher()
    this.setPaths();
    this.getData();
  }

}