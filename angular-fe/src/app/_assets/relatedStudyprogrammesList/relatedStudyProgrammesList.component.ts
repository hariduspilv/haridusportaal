import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { iif } from 'rxjs';
@Component({
  selector: 'relatedStudyProgrammesList',
  templateUrl: 'relatedStudyProgrammesList.template.html',
  styleUrls: ['relatedStudyProgrammesList.styles.scss'],
})

export class RelatedStudyProgrammesListComponent implements OnInit {

  constructor (
    private settings: SettingsService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
  ) {}
  @Input() nid: number;
  public list: Object[] = [];
  public loading: boolean = false;
  public loadingMore: boolean = false;

  public page: number = 0;
  public totalItems: number = 0;

  public relatedProgrammesForm: FormGroup = this.formBuilder.group(
    {
      address: [''],
    },
  );
  getRelatedStudyprogrammes (nid: Number, loadMore: boolean = false) {
    this.loading = this.loadingMore ? false : true;
    const variables = {
      nid,
      offset: this.page * 24,
      lang: 'ET',
      limit: 24,
    };
    if (this.relatedProgrammesForm.controls.address.value) {
      variables['address'] = this.relatedProgrammesForm.controls.address.value;
    }
    const query = this.settings.query('similarStudyProgrammes2', variables);
    this.http.get(query).subscribe(
      (res: any) => {
        if (!loadMore) {
          this.totalItems = res.data.CustomStudyProgrammeElasticQuery2.count;
          this.list = this.localFieldVary(res.data.CustomStudyProgrammeElasticQuery2.entities);
        } else {
          this.list = [
            ...this.list,
            ...this.localFieldVary(res.data.CustomStudyProgrammeElasticQuery2.entities),
          ];
        }
        this.loading = false;
        this.loadingMore = false;
      },
    );
  }
  localFieldVary (data) {
    return data.map((el: any) => {
      return {
        ...el,
        nid: parseInt(el.Nid, 10),
        educationalInstitution: el.FieldSchoolName,
        title: el.Name,
        fieldTeachingLanguage: el.fieldTeachingLanguage ? el.FieldTeachingLanguage.split(',')
          .map((el: any) => { return { entity: { entityLabel: el.trim() } }; }) : null,
      };
    });
  }

  loadMore() {
    this.page += 1;
    this.loadingMore = true;
    this.getRelatedStudyprogrammes(this.nid, true);
  }

  ngOnInit(): void {
    this.getRelatedStudyprogrammes(this.nid);
  }
}
