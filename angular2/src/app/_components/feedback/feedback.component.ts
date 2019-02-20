import { Component, Input, ChangeDetectorRef } from "@angular/core";
import { HttpService } from "@app/_services/httpService";

@Component({
  selector: "feedback",
  templateUrl: "feedback.template.html",
  styleUrls: ["feedback.styles.scss"]
})

export class FeedbackComponent {

  @Input() nid: any;

  status: String = 'vote';

  values: Object = {};

  constructor(
    private http: HttpService,
    private cd: ChangeDetectorRef
  ){

  }
  vote( flag: boolean ){
    this.values['vote'] = flag;
    if( flag ){
      this.sendVote();
    }else{
      this.status = 'add_comment';
    }
  }

  sendVote() {
    this.status = 'response';

    let data = {
      nid: this.nid,
      type: this.values['vote'] ? 1 : 0,
      message: this.values['comment'] || ''
    }

    let subscribe = this.http.post("/feedback?_format=json", data).subscribe( (response) => {
      subscribe.unsubscribe();
    });
  }

}