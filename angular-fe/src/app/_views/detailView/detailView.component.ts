import { Component, Input } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { parseData } from './helpers/tableParser';
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

  public feedbackNid: number;
  public loading: boolean = true;
  public sidebar;
  public title: string;
  public table: any;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
  ) {}

  private getSidebar():void {
    const variables = {
      lang: 'ET',
      nid: this.data.nid,
    };

    let queryKey;
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
      });
    } else {
      this.sidebar = {
        entity: { ... this.origData },
      };
    }

    console.log(this.sidebar);
  }

  private getTitle(): void {
    let title;
    switch (this.type) {
      case 'news': title = 'news.label'; break;
      case 'event': title = 'event.label'; break;
      case 'studyProgramme': title = 'studyProgramme.label'; break;
      case 'profession': title = 'oskaProfessions.label'; break;
      case 'field': title = 'oska.title_field'; break;
      case 'surveyPage': title = 'oska.workforcePrognosis'; break;
      case 'resultPage': title = 'oska.results'; break;
    }

    this.title = title;
  }
  private getData():void {
    const variables = {
      path: this.path,
    };

    let queryKey;

    switch (this.type) {
      case 'news': queryKey = 'newsSingel'; break;
      case 'event': queryKey = 'getEventSingle'; break;
      case 'studyProgramme': queryKey = 'studyProgrammeSingle'; break;
      case 'profession': queryKey = 'oskaMainProfessionDetailView'; break;
      case 'field': queryKey = 'oskaFieldDetailView'; break;
      case 'surveyPage': queryKey = 'oskaSurveyPageDetailView'; break;
      case 'resultPage': queryKey = 'oskaResultPageDetailView'; break;
    }

    const path = this.settings.query(queryKey, variables);

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
      if (this.type === 'studyProgramme') {
        this.table = parseData(this.origData);
      }
    });

  }

  ngOnInit() {
    this.getTitle();
    if (!this.data) {
      this.getData();
    }
  }
}

/*
<table>
  <thead>
    <tr *ngIf=" fieldEducationalInstitution">
      <th>Õppeasutuse nimi</th>
      <th>{{  fieldEducationalInstitution.entity.entityLabel | titleCase }}</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngIf=" fieldEducationalInstitution">
      <td>Registrikood</td>
      <td>{{  fieldEducationalInstitution.entity.fieldRegistrationCode }}</td>
    </tr>

    <tr *ngIf=" fieldStudyProgrammeLevel">
      <td>Õppekava tase</td>
      <td>{{  fieldStudyProgrammeLevel.entity.entityLabel | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldDegreeOrDiplomaAwarded">
      <td>Omistatav kraad või diplom</td>
      <td>{{  fieldDegreeOrDiplomaAwarded.entity.entityLabel | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldSpecialization">
      <td>Spetsialiseerumine</td>
      <td>{{  fieldSpecialization | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldIscedfBoard &&  fieldIscedfBoard.entity">
      <td>Õppevaldkond</td>
      <td>{{  fieldIscedfBoard.entity.entityLabel | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldIscedfNarrow &&  fieldIscedfNarrow.entity">
      <td>Õppesuund</td>
      <td>{{  fieldIscedfNarrow.entity.entityLabel | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldIscedfDetailed &&  fieldIscedfDetailed.entity">
      <td>Õppekavarühm</td>
      <td>{{  fieldIscedfDetailed.entity.entityLabel | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldShortDescription">
      <td>Lühikirjeldus</td>
      <td>{{  fieldShortDescription | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldTeachingLanguage &&  fieldTeachingLanguage.length">
      <td>Õppekeel(ed)</td>
      <td>
        <ng-container *ngFor="let item of  fieldTeachingLanguage; let i = index;">
          <ng-container *ngIf="i > 0">, </ng-container>{{ item.entity.entityLabel | titleCase }}
        </ng-container>
      </td>
    </tr>

    <tr *ngIf=" fieldAmount">
      <td>Õppekava maht</td>

      <td>{{  fieldAmount }} {{  fieldAmountUnit | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldPracticalTrainingAmount">
      <td>Praktika maht</td>
      <td>{{  fieldPracticalTrainingAmount }} {{  fieldAmountUnit }}</td>
    </tr>

    <tr *ngIf=" fieldDuration">
      <td>Nominaalkestus</td>
      <td>
        {{ fieldDuration | monthsToYears }}
      </td>
    </tr>

    <tr *ngIf=" fieldAdmissionStatus">
      <td>Vastuvõtu olek</td>
      <td>{{  fieldAdmissionStatus | titleCase }}</td>
    </tr>

    <tr *ngIf=" fieldWebPageAddress">
      <td>Õppekava kirjeldava veebilehe aadress</td>
      <td><a href="{{  fieldWebPageAddress.uri }}" target="_blank">Vaata õppekava kirjeldust õppeasutuse veebilehel</a></td>
    </tr>

    <tr *ngIf=" fieldQualificationStandardId &&  fieldQualificationStandardId.length > 0">
      <td>Kutsestandard(id)</td>
      <td>
        <ng-container *ngFor="let item of  fieldQualificationStandardId">
          {{ item.entity.entityLabel | titleCase }}<br />
        </ng-container>
      </td>
    </tr>

  </tbody>
</table>*/