import { Component, Input, OnInit } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'oska-areas-sidebar',
  templateUrl: './oska.areas.sidebar.component.html',
  styleUrls: ['./oska.areas.sidebar.component.scss']
})

export class OskaAreasSidebarComponent implements OnInit {

  @Input() sidebar: any;
  @Input() indicators: any;
  @Input() fillingbar: any;
  @Input() viewType: any;
  @Input() fieldName: any;

  private lang;
  private jobPagesExist = false;
  private locationPerLang: any = false;
  public resultLocation = '/oska-tulemused/ettepanekute-elluviimine';
  public fieldQuery: any = false;
  private learningQuery: any;
  private generalLimiter = 5;
  private filledNumberEmployed: any = false;
  private outlinedNumberEmployed: any = false;
  private limits: any = {
    professions: this.generalLimiter,
    fields: this.generalLimiter,
    opportunities: this.generalLimiter,
    qualification: this.generalLimiter,
    jobs: this.generalLimiter,
    profQuickFind: this.generalLimiter,
    relatedPages: this.generalLimiter,
    quickFind: this.generalLimiter,
    resultHyperlinks: this.generalLimiter,
    resultRelatedArticle: this.generalLimiter
  };
  public competitionLabels = ['oska.simple', 'oska.quite_simple', 'oska.medium', 'oska.quite_difficult', 'oska.difficult'];
  public trendingValues = [
    { icon: 'trending_flat', class: 'top trending-up', text: 'oska.big_increase' },
    { icon: 'trending_up', class: 'top', text: 'oska.increase' },
    { icon: 'trending_flat', class: 'stagnant', text: 'oska.stagnant' },
    { icon: 'trending_down', class: 'bottom', text: 'oska.decline' },
    { icon: 'trending_flat', class: 'bottom trending-down', text: 'oska.big_decline' }
  ];
  public graduatesToJobsValues = [
    { icon: 'dot', class: 'bottom', text: 'oska.more_graduates' },
    { icon: 'dot', class: 'bottom', text: 'oska.less_graduates' },
    { icon: 'dot', class: 'top', text: 'oska.enough_graduates' },
    { icon: 'dot', class: 'stagnant', text: 'oska.graduates_work_outside_field' },
    { icon: 'dot', class: 'low', text: 'oska.no_graduates' }
  ];
  public competitionLevel: any = null;
  public competitionLabel = '';
  private typeStatus: any = {
    professions: null,
    opportunities: null,
    qualification: null,
    jobs: null,
    profQuickFind: null,
    fields: null,
    relatedPages: null,
    quickFind: null,
    resultHyperlinks: null,
    resultRelatedArticle: null
  };

  constructor(private rootScope: RootScopeService, private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.viewType === 'field' && this.fieldName) {
      this.fieldQuery = { field: this.fieldName };
    }
    if (this.viewType === 'mainProfession' && this.fillingbar[0] && this.fillingbar[0].value) {
      this.competitionLevel = parseInt(this.fillingbar[0].value, 10);
      this.competitionLabel = this.competitionLabels[this.competitionLevel - 1];
    }
    this.lang = this.rootScope.get('lang');
    if (this.sidebar) {

      if (this.sidebar.fieldIscedfSearchLink && this.sidebar.fieldIscedfSearchLink.entity && (this.sidebar.fieldIscedfSearchLink.entity.iscedf_detailed || this.sidebar.fieldIscedfSearchLink.entity.iscedf_narrow || this.sidebar.fieldIscedfSearchLink.entity.iscedf_broad)) {
        this.locationPerLang = `/erialad`;
        this.learningQuery = { iscedf_detailed: [], iscedf_narrow: [], iscedf_broad: [], level: [], open_admission: true };

        Object.keys(this.learningQuery).forEach((field) => {
          if (this.sidebar.fieldIscedfSearchLink.entity) {
            this.sidebar.fieldIscedfSearchLink.entity[field].forEach(elem => {
              if (elem.entity) {
                this.learningQuery[field].push(elem.entity.entityId);
              }
            });
          }
        });
      }

      if (this.viewType === 'field') {
        this.typeStatus['professions'] = this.sidebar.fieldOskaMainProfession && (this.sidebar.fieldOskaMainProfession.length > this.limits['professions']);
        this.typeStatus['quickFind'] = this.sidebar.fieldOskaFieldQuickFind && (this.sidebar.fieldOskaFieldQuickFind.length > this.limits['quickFind']);
        this.typeStatus['relatedPages'] = this.sidebar.fieldRelatedPages && (this.sidebar.fieldRelatedPages.length > this.limits['relatedPages']);
        this.numberEmployed(this.sidebar.fieldNumberEmployed, 'filledNumberEmployed', 'outlinedNumberEmployed');
      } else if (this.viewType === 'mainProfession') {
        this.typeStatus['fields'] = this.sidebar.fieldOskaField && (this.sidebar.fieldOskaField.length > this.limits['fields']);
        this.typeStatus['opportunities'] = this.sidebar.fieldJobOpportunities && (this.sidebar.fieldJobOpportunities.length > this.limits['opportunities']);
        this.typeStatus['qualification'] = this.sidebar.fieldQualificationStandard && (this.sidebar.fieldQualificationStandard.length > this.limits['qualification']);
        this.typeStatus['profQuickFind'] = this.sidebar.fieldQuickFind && (this.sidebar.fieldQuickFind.length > this.limits['profQuickFind']);
        this.typeStatus['jobs'] = this.sidebar.fieldJobs && (this.sidebar.fieldJobs.length > this.limits['jobs']);
        this.numberEmployed(this.sidebar.fieldNumberEmployed, 'factsFilledNumber', 'factsOutlinedNumber');
        if (this.indicators) {
          this.indicators.entities.sort((a, b) => a.oskaId - b.oskaId);
        }
      } else {
        this.typeStatus['resultHyperlinks'] = this.sidebar.fieldHyperlinks && (this.sidebar.fieldHyperlinks.length > this.limits['resultHyperlinks']);
        this.typeStatus['resultRelatedArticle'] = this.sidebar.fieldRelatedArticle && (this.sidebar.fieldRelatedArticle.length > this.limits['resultRelatedArticle']);
      }

      if (this.sidebar.fieldJobs) {
        this.sidebar.fieldJobs.forEach(elem => {
          if (elem.entity.fieldJobLink) { this.jobPagesExist = true; }
        });
      }

    }
  }

  showMore(type, compare) {
    const previousElement = this.limits[type] - 1;
    this.limits[type] = this.sidebar[compare].length;
    this.typeStatus[type] = false;
    const elemToTarget = document.getElementById(compare + '_' + previousElement);
    if (elemToTarget) {
      elemToTarget.focus();
    }
  }

  hideExtra(type, compare) {
    this.limits[type] = this.generalLimiter;
    this.typeStatus[type] = true;
  }

  formatNumber(number, locale) {
    const num = parseInt(number, 10);
    const formattedNum = num.toLocaleString(locale);
    return formattedNum.replace(',', ' ');
  }

  numberEmployed(elem: number, filled, outlined) {
    let employedSection: any = false;
    const employedModifier = 11;
    if (0 < elem && elem < 10000) { employedSection = 1; }
    if (10000 <= elem && elem < 15000) { employedSection = 2; }
    if (15000 <= elem && elem < 20000) { employedSection = 3; }
    if (20000 <= elem && elem < 25000) { employedSection = 4; }
    if (25000 <= elem && elem < 30000) { employedSection = 5; }
    if (30000 <= elem && elem < 35000) { employedSection = 6; }
    if (35000 <= elem && elem < 45000) { employedSection = 7; }
    if (45000 <= elem && elem < 55000) { employedSection = 8; }
    if (55000 <= elem && elem < 65000) { employedSection = 9; }
    if (65000 <= elem && elem < 75000) { employedSection = 10; }
    if (elem >= 75000) { employedSection = 11; }
    this[filled] = Array(employedSection).fill(0).map((x, i) => i);
    this[outlined] = Array(employedModifier - employedSection).fill(0).map((x, i) => i);
  }

  arrayOfLength(len) {
    return Array(parseInt(len, 10)).fill(0).map((x, i) => i);
  }

  isContactValid() {
    return (this.viewType === 'field' && this.sidebar.fieldOskaFieldContact && this.sidebar.fieldOskaFieldContact.entity
      && (this.sidebar.fieldOskaFieldContact.entity.fieldOrganization || this.sidebar.fieldOskaFieldContact.entity.fieldPerson
        || this.sidebar.fieldOskaFieldContact.entity.fieldEmail || this.sidebar.fieldOskaFieldContact.entity.fieldPhone))
      ||
      (this.viewType === 'mainProfession' && this.sidebar.fieldContact && this.sidebar.fieldContact.entity
        && (this.sidebar.fieldContact.entity.fieldOrganization || this.sidebar.fieldContact.entity.fieldPerson
          || this.sidebar.fieldContact.entity.fieldEmail || this.sidebar.fieldContact.entity.fieldPhone))
      ||
      ((this.viewType === 'results' || this.viewType === 'surveyPage') && this.sidebar.fieldContactSection && this.sidebar.fieldContactSection.entity
        && (this.sidebar.fieldContactSection.entity.fieldOrganization || this.sidebar.fieldContactSection.entity.fieldPerson
          || this.sidebar.fieldContactSection.entity.fieldEmail || this.sidebar.fieldContactSection.entity.fieldPhone));
  }
}
