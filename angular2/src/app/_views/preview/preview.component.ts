import { Component, OnInit } from "@angular/core";
import { HttpService } from "@app/_services/httpService";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: "preview.template.html"
})

export class PreviewComponent implements OnInit{

  data: any;

  constructor(
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {

  }
  ngOnInit() {

    let url = "/graphql?queryName=preview&queryId=75cdca8a86d30726ea8345159f29bb0335a99e0e:1&variables=";
    
    let variables = {
      "uuid": this.route.snapshot.params.id
    };

    let subscription = this.http.get(url+JSON.stringify(variables)).subscribe( (data) => {
      this.data = data['data']['NodePreviewByUuid'];
      console.log(this.data);
      subscription.unsubscribe();
    });
  }

}