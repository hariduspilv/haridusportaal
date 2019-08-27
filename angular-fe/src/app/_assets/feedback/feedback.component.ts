import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import conf from '@app/_core/conf';

@Component({
  selector: 'feedback',
  templateUrl: 'feedback.template.html',
  styleUrls: ['feedback.styles.scss'],
})

export class FeedbackComponent {

  @Input() nid: number|string;

  status: String = 'vote';
  values: Object = {};

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {

  }
  cancel(): void {
    this.values['vote'] = false;
    this.values['comment'] = '';
    this.status = 'vote';
  }

  vote(flag: boolean):void {
    this.values['vote'] = flag;
    if (flag) {
      this.status = 'add_comment';
    }else {
      this.status = 'add_comment';
    }
  }

  sendVote() {
    this.status = 'response';

    const data = {
      nid: this.nid,
      type: this.values['vote'] ? 1 : 0,
      message: this.values['comment'] || '',
    };

    const subscribe = this.http.post(`${conf.api_prefix}/feedback?_format=json`, data).subscribe(
      (response) => {
        subscribe.unsubscribe();
      });
  }

}
