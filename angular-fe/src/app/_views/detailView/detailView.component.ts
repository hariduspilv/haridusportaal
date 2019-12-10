import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService } from '@app/_services/userService';
import { AuthService } from '@app/_services';

@Component({
  selector: 'detail-view',
  templateUrl: 'detailView.template.html',
  styleUrls: ['detailView.styles.scss'],
})

export class DetailViewComponent {
  @Input() type: string = 'news';
  @Input() path: string;
  @Input() data: any;
  @Input() origData: any;
  @ViewChild('descriptionBlock', { static: false }) description: ElementRef;

  public feedbackNid: number;
  public loading: boolean = true;
  public sidebar: object;
  public title: string;
  public compareKey: string;
  public pictoWidth: number;
  private queryKey: string = '';
  private paramsWatcher: Subscription = new Subscription();

  public relatedStudyprogrammes: Object[] = [];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location,
    public auth: AuthService,
  ) {}

  private getSidebar():void {
    const variables = {
      lang: 'ET',
      nid: this.data.nid,
    };

    let queryKey:string|boolean = false;

    switch (this.type) {
      case 'news': queryKey = 'recentNews'; break;
      case 'event': queryKey = false; break;
      case 'studyProgramme': queryKey = false; break;
      default: queryKey = false;
    }

    if (queryKey) {
      const path = this.settings.query(queryKey, variables);
      const subscription = this.http.get(path).subscribe((response) => {
        this.sidebar = {
          entity: response['data'],
        };
        subscription.unsubscribe();
      });
    } else {
      this.sidebar = {
        entity: { ... this.origData },
      };
    }
  }

  private getValues(): void {

    switch (this.type) {
      case 'news': {
        this.queryKey = 'newsSingel';
        this.title = 'news.label';
        break;
      }
      case 'event': {
        this.queryKey = 'getEventSingle';
        this.title = 'event.label';
        break;
      }
      case 'studyProgramme': {
        this.queryKey = 'studyProgrammeSingle';
        this.title = 'studyProgramme.label';
        this.compareKey = 'studyProgrammeComparison';
        break;
      }
      case 'profession': {
        this.queryKey = 'oskaMainProfessionDetailView';
        this.title = 'oskaProfessions.label';
        this.compareKey = 'oskaProfessionsComparison';
        break;
      }
      case 'field': {
        this.queryKey = 'oskaFieldDetailView';
        this.title = 'oska.title_field';
        break;
      }
      case 'surveyPage': {
        this.queryKey = 'oskaSurveyPageDetailView';
        this.title = 'oska.workforcePrognosis';
        break;
      }
      case 'resultPage': {
        this.queryKey = 'oskaResultPageDetailView';
        this.title = 'oska.results';
        break;
      }
      case 'school': {
        this.queryKey = 'getSchoolSingle';
        this.title = 'school.label';
        break;
      }
      case 'article': {
        this.queryKey = 'getArticle';
        this.title = 'article.label';
        break;
      }
    }
  }

  private getData():void {
    const variables = {
      path: this.path,
    };
    const path = this.settings.query(this.queryKey, variables);

    const subscription = this.http.get(path).subscribe((response) => {

      this.origData = response['data']['route']['entity'];
      this.data = FieldVaryService(response['data']['route']['entity']);

      if (Array.isArray(this.data.video) && this.data.video.length > 1) {
        this.data.additionalVideos = this.data.video.slice(1, 10);
        this.data.video.splice(0, 1);
      }

      this.loading = false;

      this.feedbackNid = this.data.nid;

      this.getSidebar();
      subscription.unsubscribe();

    });

  }

  private watchParams() {
    this.paramsWatcher = this.route.params.subscribe((routeParams) => {
      this.data = false;
      this.initialize();
    });
  }

  private initialize() {
    if (this.route.snapshot.data) {
      this.path = decodeURI(this.location.path());
      this.type = this.route.snapshot.data['type'];
    }
    this.getValues();
    if (!this.data) {
      this.getData();
    }
  }

  ngOnInit() {
    this.watchParams();
    // this.initialize();
  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
  }
}
