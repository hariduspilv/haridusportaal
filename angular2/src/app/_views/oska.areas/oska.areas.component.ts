import { Component, OnInit } from '@angular/core';
import { HttpService } from 'app/_services/httpService';

@Component({
  templateUrl: "oska.areas.template.html",
  styleUrls: ["oska.areas.styles.scss"]
})

export class OskaAreasComponent implements OnInit{

  data: any = false;
  video: any = false;

  constructor(
    private http: HttpService
  ) {

  }

  getData(){
    let url = "http://test-htm.wiseman.ee:30000/graphql?queryId=oskaFieldDetailView:1&variables=%7B%22path%22:%22/et/node/48872%22%7D";

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
