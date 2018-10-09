import { Component, OnInit } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: "oska.areas.template.html",
  styleUrls: ["oska.areas.styles.scss"]
})

export class OskaAreasComponent implements OnInit{

  data: any = false;
  video: any = false;

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  getData(){
    let url = "/graphql?queryId=oskaFieldDetailView:1&variables=";
    let variables = {
      "path": this.router.url
    };

    url+= JSON.stringify(variables);

    let subscription = this.http.get(url).subscribe( (data) => {
      this.data = data['data']['route']['entity'];
      
      if( this.data.fieldOskaVideo ){
        this.video = [this.data.fieldOskaVideo];
      }
    });
  }

  ngOnInit() {
    this.getData();
  }
}
