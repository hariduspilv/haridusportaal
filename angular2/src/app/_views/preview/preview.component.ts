import { Component, OnInit } from "@angular/core";
import { HttpService } from "@app/_services/httpService";
import { Router, ActivatedRoute } from "@angular/router";
import { SettingsService } from "@app/_core/settings";
import { RootScopeService } from "@app/_services";

@Component({
  templateUrl: "preview.template.html"
})

export class PreviewComponent implements OnInit{

  data: any;

  constructor(
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private rootScope: RootScopeService
  ) {

  }

  editPost() {
    let href = this.settings.url+"/node/"+this.data.entityId+"/edit?uuid="+this.route.snapshot.params.id;
    if( !this.data.entityId ){
      href = this.settings.url+"/node/add/"+this.data.entityBundle+"?uuid="+this.route.snapshot.params.id 
    }
    window.location.href = href;
  }
  ngOnInit() {
    
    let variables = {
      "uuid": this.route.snapshot.params.id
    };

    let subscription = this.http.get('preview', {
      withCredentials: true,
      params: variables
    }).subscribe( (data) => {
      this.data = data['data']['NodePreviewByUuid'];
      subscription.unsubscribe();
    });
  }

}