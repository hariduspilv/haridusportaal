import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { ActivatedRoute, Router } from '@angular/router';
import { RootScopeService } from 'app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';

@Component({
  selector: "oska-results-component",
  templateUrl: "oska.results.template.html",
  styleUrls: ["oska.results.styles.scss"]
})

export class OskaResultsComponent implements OnInit, OnDestroy {

  @Input() inputData:any ;
  public data: any = false;
  public video: any = false;
  public error: boolean = false;
  public viewType : string = 'results'
  public sidebarData: any = false;
  public userLoggedOut: boolean = false;
  public field: string = 'field';

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService,
    private user: UserService,
  ) {}

  getData(){

    if( this.inputData ){
      this.data = this.inputData;
      if (this.data.fieldResultPageSidebar) {
        this.sidebarData = this.data.fieldResultPageSidebar.entity;
      }
    }else{
      

      let variables = {
        "lang": this.rootScope.get('lang'),
        "path": this.router.url
      };


      let subscription = this.http.get('oskaResultPageDetailView', {params:variables}).subscribe( (data) => {
        if ( data['errors'] ) {
          this.error = true;
          return false;
        } else if ( data['data']['route'] == null ) {
          this.error = true;
          return false;
        } else {
          this.data = data['data']['route']['entity'];
        }
        if (this.data.fieldResultPageSidebar) {
          this.sidebarData = this.data.fieldResultPageSidebar.entity;
        }

        subscription.unsubscribe();
      }, (err) => {
        console.log(err);
        this.error = true;
      });
    }
    
  }
  
  ngOnInit() {
    this.getData();
    this.route.params.subscribe( params => {
      this.userLoggedOut = this.user.getData()['isExpired'];
    });
  }

  ngOnDestroy() {
    this.data = false;
  }
}
