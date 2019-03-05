import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingsService } from '@app/_services/settings.service';
import { Subscription } from 'rxjs/Subscription';
import { FiltersService } from '@app/_services/filtersService';
import { HttpService } from '@app/_services/httpService';
@Component({
  selector: "related-studyprogrammes",
  templateUrl: "related.studyProgrammes.component.html",
  styleUrls: ["related.studyProgrammes.component.scss"]
})

export class RelatedStudyProgrammesComponent extends FiltersService implements OnInit, OnDestroy {
  
  @Input() studyProgrammeId: number;
  private url;
  private lang: string;
  private subscriptions: Subscription[] = [];
  private params: object;

  public list: any = false;
  public search_address;
  

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpService,
    public rootScope: RootScopeService,
    private settings: SettingsService
  ) { 
    super(null, null)
  }

  watchSearch() {
    

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.getData()
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  getData(){
    let variables = {
      lang: this.lang.toUpperCase(),
      nid: this.studyProgrammeId.toString()
    }
    if(this.params['location']) variables['address'] = this.params['location'];
    
    let subscribe = this.http.get('similarStudyProgrammes', { params: variables } ).subscribe(response => {
      
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

    this.lang = this.rootScope.get("lang");
    
    this.watchSearch();

    //make sure related study programmes are opened when user returns to this url via browser back button/link share
    this.filterFormItems['displayRelated'] = true;
    this.filterSubmit();
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