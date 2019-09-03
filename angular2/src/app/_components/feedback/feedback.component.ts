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
  feedbackError = false;
  values: Object = {};

  constructor(
    private http: HttpService,
    private cd: ChangeDetectorRef
  ){

  }

  cancel(): void {
    this.values['vote'] = false;
    this.values['comment'] = '';
    this.status = 'vote';
    this.feedbackError = false;
  }

  vote( flag: boolean ){
    this.values['vote'] = flag;
    this.status = 'add_comment';
  }

  sendVote() {

    if(!this.values['vote']) {
      if (!this.values['comment'] || this.values['comment'] === ''){
        this.feedbackError = true;
      } else{
        this.feedbackError = false;
      }
    }

    if (this.feedbackError) {
      return false;
    }

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