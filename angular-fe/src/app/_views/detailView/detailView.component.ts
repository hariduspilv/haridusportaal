import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService } from '@app/_services/userService';
import { AuthService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'detail-view',
  templateUrl: 'detailView.template.html',
  styleUrls: ['detailView.styles.scss'],
})

export class DetailViewComponent {
  @Input() type: string;
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
  public userData: any;
  public favoriteLimit = false;
  private paramsWatcher: Subscription = new Subscription();
  public isPreview: boolean = false;

  @Input() storyPath: string;
  @Input() storyType: string;

  public relatedStudyprogrammes: Object[] = [];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location,
    public auth: AuthService,
    private translate: TranslateService,
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
      this.parseData(response['data']['route']['entity']);
      subscription.unsubscribe();

    });

  }

  private getPreviewData(): void {
    this.loading = true;

    const variables = {
      uuid: this.route.snapshot.params.id,
    };

    const path = this.settings.query('nodePreviewQuery', variables);

    const subscription = this.http.get(path, {
      withCredentials: true,
    }).subscribe((data) => {
      this.origData = data['data']['NodePreviewByUuid'];
      this.parseData(data['data']['NodePreviewByUuid']);
      this.initialize(this.origData.entityBundle);
      subscription.unsubscribe();
    });
  }

  editPost() {
    const id = this.route.snapshot.params.id;
    let href = `${this.settings.url}/node/${this.data.entityId}/edit?uuid=${id}`;
    if (!this.data.entityId) {
      href = `${this.settings.url}/node/add/${this.data.entityBundle}?uuid="+${id}`;
    }
    window.location.href = href;
  }

  private parseData(data):void {
    this.data = FieldVaryService(data);
    if (Array.isArray(this.data.video) && this.data.video.length > 1) {
      this.data.additionalVideos = this.data.video.slice(1, 10);
      this.data.video.splice(0, 1);
    }

    this.data['fieldAccordion'] = this.data.reverseFieldOskaFieldParagraph ?
      this.data.reverseFieldOskaFieldParagraph.entities : false;

    if (this.data.fieldAccordion) {
      try {
        this.data.fieldAccordion = this.data.fieldAccordion.map((item) => {
          return FieldVaryService(item.paragraphReference[0]);
        });
        if (!this.data.accordion) {
          this.data.accordion = [];
        }
        this.data.accordion = [{
          entity: {
            fieldTitle: this.translate.get('oskaProfessions.label'),
            professions: this.data.fieldAccordion,
          },
        }, ... this.data.accordion];
        console.log(this.data.accordion);
      } catch (err) {}
    }

    this.loading = false;

    this.feedbackNid = this.data.nid;

    this.getSidebar();
  }

  private watchParams() {
    this.paramsWatcher = this.route.params.subscribe((routeParams) => {
      this.data = false;
      this.initialize();
    });
  }

  private initialize(type: string = undefined) {
    this.userData = this.auth.userData;
    if (this.route.snapshot.data) {
      this.path = this.storyPath || decodeURI(this.location.path());
      this.type = this.storyType || type || this.route.snapshot.data['type'];
    }

    this.getValues();
    if (!this.data) {
      this.getData();
    }
  }

  ngOnInit() {
    if (this.route.snapshot.data.preview) {
      this.isPreview = true;
      this.getPreviewData();
    } else {
      this.watchParams();
    }
    // this.initialize();
  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
  }
}
