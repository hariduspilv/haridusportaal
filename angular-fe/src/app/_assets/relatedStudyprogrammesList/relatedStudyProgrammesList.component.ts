import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { SettingsService, ScrollRestorationService, ListRestorationType } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private scrollRestoration: ScrollRestorationService,
  ) {}
  @Input() nid: number;
  @Input() type: string = '';
  @Input() title: string = 'studyProgramme.related_label';

  public showList: boolean = false;
  public list: Object[] = [];
  public loading: boolean = false;
  public loadingMore: boolean = false;
  private scrollRestorationValues: { [type: string]: ListRestorationType } = null;

  public page: number = 0;
  public totalItems: number = 0;

  public relatedProgrammesForm: FormGroup = this.formBuilder.group(
    {
      address: [''],
      displayRelated: [''],
    },
  );
  getRelatedStudyprogrammes (nid: Number, loadMore: boolean = false, restoredList?: Object[]) {
    this.loading = this.loadingMore ? false : true;
    const variables = {
      offset: this.page * 24,
      lang: 'ET',
      limit: 24,
    };

    let queryKey = '';

    if (this.type === 'school') {
      variables['schoolId'] = nid;
      queryKey = 'relatedStudyProgrammeList';
    } else {
      variables['nid'] = nid;
      queryKey = 'similarStudyProgrammes2';
    }

    if (this.relatedProgrammesForm.controls.address.value) {
      variables['address'] = this.relatedProgrammesForm.controls.address.value;
    }

    if (this.showList) {
      setTimeout(
        () => {
          this.showListItems();
        },
        0);
    }

    if (restoredList) {
      const scrollSub = this.scrollRestoration.restorationPosition.subscribe((position) => {
        if (position[this.nid]) {
          setTimeout(() => {
            document.querySelector('.app-content').scrollTop = position[this.nid];
          },         0);
        }
      });
      scrollSub.unsubscribe();
      this.list = restoredList;
      this.loading = false;
      this.loadingMore = false;
    } else {
      const query = this.settings.query(queryKey, variables);
      this.http.get(query).subscribe(
        (res: any) => {
          if (!loadMore) {
            if (this.type === 'school') {
              this.totalItems = res.data.nodeQuery.entities.length;
              this.list = this.localFieldVary(res.data.nodeQuery.entities);
            } else {
              this.totalItems = res.data.CustomStudyProgrammeElasticQuery2.count;
              this.list = this.localFieldVary(res.data.CustomStudyProgrammeElasticQuery2.entities);
            }
          } else {

            if (this.type === 'school') {
              this.list = [
                ...this.list,
                ...this.localFieldVary(res.data.nodeQuery.entities),
              ];
            } else {
              this.list = [
                ...this.list,
                ...this.localFieldVary(res.data.CustomStudyProgrammeElasticQuery2.entities),
              ];
            }

            this.totalItems = this.list.length;
          }
          this.loading = false;
          this.loadingMore = false;
          this.scrollRestoration.restorationValues.next({
            ...this.scrollRestorationValues,
            [this.nid]: {
              values: { ...variables, page: this.page, totalItems: this.totalItems },
              list: this.list,
              canLoadMore: this.totalItems + 1 > ((1 + this.page)  * 24) },
          });
        },
      );
    }
  }
  localFieldVary (data) {
    return data.map((el: any) => {
      let fieldTeachingLanguage = el.FieldTeachingLanguage || el.fieldTeachingLanguage || [];
      if (typeof fieldTeachingLanguage === 'string') {
        fieldTeachingLanguage = fieldTeachingLanguage.split(',')
          .map((el: any) => { return { entity: { entityLabel: el.trim() } }; });
      } else {
        fieldTeachingLanguage = fieldTeachingLanguage
          .map((elem) => {
            return {
              entity: {
                entityLabel: elem.entity.name.trim(),
              },
            };
          });
      }

      if (!fieldTeachingLanguage.length) {
        fieldTeachingLanguage = null;
      }

      return {
        ...el,
        fieldTeachingLanguage,
        nid: parseInt(el.Nid || el.nid, 10),
        educationalInstitution: el.FieldSchoolName,
        title: el.Name || el.title,
      };
    });
  }

  public showListItems(): void {
    this.showList = true;
    const queryParams = {
      displayRelated: true,
    };

    this.router.navigate(
      [],
      {
        queryParams,
        queryParamsHandling: 'merge',
      },
    );

  }
  private checkParams(): void {
    if (this.route.snapshot.queryParams.address) {
      this.relatedProgrammesForm.controls.address.setValue(this.route.snapshot.queryParams.address);
    }
    if (this.route.snapshot.queryParams.displayRelated) {
      this.showList = true;
    }
  }
  loadMore() {
    this.page += 1;
    this.loadingMore = true;
    this.getRelatedStudyprogrammes(this.nid, true, null);
  }

  ngOnInit(): void {
    this.checkParams();
    const scrollSub = this.scrollRestoration.restorationValues.subscribe((values) => {
      this.scrollRestorationValues = values;
      let restoredList: Object[] = null;
      if (this.scrollRestoration.popstateNavigation && values && values[this.nid]) {
        this.page = values[this.nid].values['page'];
        this.totalItems = values[this.nid].values['totalItems'];
        restoredList = values[this.nid].list;
      } else if (!this.scrollRestoration.popstateNavigation && values
        && values[this.nid]) {
        this.scrollRestoration.restorationValues.next(
          { ...values, [this.nid]: null });
      }
      this.getRelatedStudyprogrammes(this.nid, false, restoredList);
    });
    scrollSub.unsubscribe();
  }

  ngOnDestroy() {
    this.scrollRestoration.restorationPosition.next({
      ...this.scrollRestoration.restorationPosition.getValue(),
      [this.nid]: document.querySelector('.app-content').scrollTop,
    });
  }
}
