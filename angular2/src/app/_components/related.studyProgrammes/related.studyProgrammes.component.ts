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
  private requestSub: Subscription;
  private params: object;

  private limit: number = 24;
  private loading: boolean = true;
  private listEnd: boolean = false;

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
    if(this.params && !this.params['displayRelated']) return;
    let variables = {
      lang: this.lang.toUpperCase(),
      nid: this.studyProgrammeId.toString(),
      limit: this.limit,
      offset: this.list ? this.list.length : 0
    }

    this.loading = true;

    if(this.params['location']) variables['address'] = this.params['location'];
    if(this.requestSub !== undefined) {
      this.requestSub.unsubscribe();
    }
    this.requestSub = this.http.get('similarStudyProgrammes', { params: variables } ).subscribe(response => {

      this.loading = false;

      let tmpList = response['data']['CustomStudyProgrammeElasticQuery'];

      if (response['errors'] && tmpList === null) {
        tmpList = [];
      }

      tmpList.forEach(programme => {
        //convert string to number
        programme.Nid = parseInt(programme.Nid);
        //Split CSV of teaching languages to an array
        if( programme.FieldTeachingLanguage ){
          programme.FieldTeachingLanguage = programme.FieldTeachingLanguage.split(',');
        }
      })

      console.log(tmpList.length);

      if( tmpList.length < this.limit ){
        this.listEnd = true;
      }

      if( this.list ){
        this.list = [ ... this.list, ...tmpList ];
      }else{
        this.list = tmpList;
      }

      this.requestSub.unsubscribe();
    });
  }
  ngOnInit() {

    this.lang = this.rootScope.get("lang");

    //make sure related study programmes are opened when user returns to this url via browser back button/link share
    this.filterFormItems['displayRelated'] = true;
    this.filterSubmit();
    
    this.watchSearch();
  }
  ngOnDestroy(){
     /* Clear all subscriptions */
     this.requestSub.unsubscribe();
     for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}