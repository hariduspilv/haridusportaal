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
    let href = this.settings.url+"/"+this.rootScope.get("lang")+"/node/"+this.data.entityId+"/edit?uuid="+this.route.snapshot.params.id;
    window.location.href = href;
  }
  ngOnInit() {

    let url = "/graphql?queryName=preview&queryId=8a44fd02bedec952cd7f910d5ac42008ba04d452:1&variables=";
    
    let variables = {
      "uuid": this.route.snapshot.params.id
    };

    let subscription = this.http.get(url+JSON.stringify(variables), {
      withCredentials: true
    }).subscribe( (data) => {
      this.data = data['data']['NodePreviewByUuid'];
      subscription.unsubscribe();
    });
  }

}