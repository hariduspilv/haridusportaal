import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/_services/settings.service';
import { HttpService } from '@app/_services/httpService';

@Component({
  templateUrl: './oska.frontpage.component.html',
  styleUrls: ['./oska.frontpage.component.scss']
})

export class OskaFrontPageComponent {

	public generalData: any = false;
	public lang: string;
  public mobileView: boolean = false;
  
  constructor (
    private rootScope:RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private settings: SettingsService
  ) {}

  getGeneral() {
    
    let variables = {lang: this.lang.toUpperCase()}

    this.http.get('oskaFrontPageQuery', {params:variables}).subscribe(data => {
      if (data['errors'] && data['errors'].length) {
        this.generalData = [];
      } else {
        this.generalData = data['data']['nodeQuery']['entities'];
      }
    },(data) => {
      this.generalData = [];
    });
  }

  ngOnInit() {
    this.lang = this.rootScope.get("lang");
    this.getGeneral();
  }
}
