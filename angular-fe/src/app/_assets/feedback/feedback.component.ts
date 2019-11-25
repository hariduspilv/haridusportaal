import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import conf from '@app/_core/conf';
import { SettingsService } from '@app/_services';

@Component({
  selector: 'feedback',
  templateUrl: 'feedback.template.html',
  styleUrls: ['feedback.styles.scss'],
})

export class FeedbackComponent {

  @Input() nid: number|string;
  public feedbackError: boolean = false;
  public status: String = 'vote';
  public values: Object = {};

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private settings: SettingsService,
  ) {

  }
  public cancel(): void {
    this.values['vote'] = false;
    this.values['comment'] = '';
    this.status = 'vote';
    this.feedbackError = false;
  }

  public vote(flag: boolean):void {
    this.values['vote'] = flag;
    if (flag) {
      this.status = 'add_comment';
    }else {
      this.status = 'add_comment';
    }
  }

  public sendVote() {

    if (!this.values['vote']) {
      if (!this.values['comment'] || this.values['comment'] === '') {
        this.feedbackError = true;
      } else {
        this.feedbackError = false;
      }
    }

    if (this.feedbackError) {
      return false;
    }

    this.status = 'response';

    const data = {
      nid: this.nid,
      type: this.values['vote'] ? 1 : 0,
      message: this.values['comment'] || '',
    };

    const subscribe = this.http.post(`${this.settings.url}/feedback?_format=json`, data).subscribe(
      (response) => {
        subscribe.unsubscribe();
      });
  }

}
