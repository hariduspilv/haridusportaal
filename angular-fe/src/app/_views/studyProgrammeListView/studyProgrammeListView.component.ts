import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'studyProgrammeList-view',
  templateUrl: 'studyProgrammeListView.template.html',
  styleUrls: ['studyProgrammeListView.styles.scss'],
})

export class StudyProgrammeListViewComponent {
  @Input() path: string;
  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  showFilter = true;
  schoolType = [];
  primaryTypes = [];
  selectedPrimaryTypes = [];
  selectedSecondaryTypes = [];
  secondaryTypes = [];
  secondaryFilteredTypes = [];
  selectedTypes = [];
  languageFilters = [];
  ownershipFilters = [];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getTags();
  }

  setSecondaryTypes() {
    this.secondaryFilteredTypes = [];
    this.selectedPrimaryTypes.forEach((element) => {
      this.secondaryTypes.forEach((el) => {
        if (el.parent === Number(element)) {
          this.secondaryFilteredTypes.push({ value: el.value, key: el.key });
        }
      });
    });
    this.removeHangingTypes();
    this.setTypeValue();
  }

  removeHangingTypes() {
    this.selectedSecondaryTypes = [];
    this.selectedSecondaryTypes.forEach((element) => {
      if (this.secondaryFilteredTypes.indexOf(element) !== -1) {
        this.selectedSecondaryTypes.push(element);
      }
    });
  }

  setTypeValue() {
    this.selectedTypes = [...this.selectedPrimaryTypes, ...this.selectedSecondaryTypes];
  }

  getTags() {

    let variables = {
      lang: 'ET',
    };

    const path = this.settings.query('getSchoolFilterOptions', variables);

    const subscribe = this.http.get(path).subscribe((response: any) => {
      const data = response.data.taxonomyTermQuery.entities;

      console.log(data);
      data.map((el) => {
        if (el.reverseFieldEducationalInstitutionTyNode) {
          el.parentId ? this.secondaryTypes.push({ value: el.entityId, key: el.entityLabel, parent: el.parentId }) : this.primaryTypes.push({ value: el.entityId, key: el.entityLabel });
        }
        if (el.reverseFieldTeachingLanguageNode) {
          this.languageFilters.push({ value: el.entityId, key: el.entityLabel });
        }
        if (el.reverseFieldOwnershipTypeNode) {
          this.ownershipFilters.push({ value: el.entityId, key: el.entityLabel });
        }
      });

      subscribe.unsubscribe();
    });
  }
}
