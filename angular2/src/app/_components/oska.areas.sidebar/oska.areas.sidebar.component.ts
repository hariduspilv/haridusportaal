import { Component, Input, OnInit} from '@angular/core';
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
  @Input() viewType: any;

  private lang: any = 'et';
  private jobPagesExist: boolean = false;
  private locationPerLang: any = false;
  private learningQuery: any = false;
  private generalLimiter: number = 5;
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

	constructor(private rootScope: RootScopeService, private route: ActivatedRoute) {}
  
  ngOnInit() {
    let subscription = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = this.rootScope.get('currentLang');
        if (this.sidebar.fieldIscedfSearchLink && this.sidebar.fieldIscedfSearchLink.entity.iscedf_detailed) {
          this.locationPerLang = this.lang === 'en' ? `/${this.lang}/study-programmes` : `/${this.lang}/erialad`;
          this.learningQuery = { iscedf_detailed: this.sidebar.fieldIscedfSearchLink.entity.iscedf_detailed.entity.entityId };
        }
      }
    );
    subscription.unsubscribe()
    if (this.viewType === 'field') {
      this.typeStatus['professions'] = this.sidebar.fieldOskaMainProfession.length > this.limits['professions'];
      this.typeStatus['quickFind'] = this.sidebar.fieldOskaFieldQuickFind.length > this.limits['quickFind'];
      this.typeStatus['relatedPages'] = this.sidebar.fieldRelatedPages.length > this.limits['relatedPages'];
    } else if (this.viewType === 'mainProfession') {
      this.typeStatus['fields'] = this.sidebar.fieldOskaField.length > this.limits['fields'];
      this.typeStatus['opportunities'] = this.sidebar.fieldJobOpportunities.length > this.limits['opportunities'];
      this.typeStatus['qualification'] = this.sidebar.fieldQualificationStandard.length > this.limits['qualification'];
      this.typeStatus['profQuickFind'] = this.sidebar.fieldQuickFind.length > this.limits['profQuickFind'];
      this.typeStatus['jobs'] = this.sidebar.fieldJobs.length > this.limits['jobs'];
    } else {
      this.typeStatus['resultHyperlinks'] = this.sidebar.fieldHyperlinks.length > this.limits['resultHyperlinks'];
      this.typeStatus['resultRelatedArticle'] = this.sidebar.fieldRelatedArticle.length > this.limits['resultRelatedArticle'];
    }
    if(this.sidebar && this.sidebar.fieldJobs) {
      this.sidebar.fieldJobs.forEach(elem => {
        if (elem.entity.fieldJobLink) { this.jobPagesExist = true; }
      });
    }
  }

  showMore(type, compare) {
    let previousElement = this.limits[type] - 1;
    this.limits[type] = this.sidebar[compare].length;
    this.typeStatus[type] = false;
    let elemToTarget = document.getElementById(`${compare}_${previousElement}`);
    if (elemToTarget) {
      elemToTarget.focus();
    }
  }

  hideExtra(type, compare) {
    this.limits[type] = this.generalLimiter;
    this.typeStatus[type] = true;
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
    (this.viewType === 'results' && this.sidebar.fieldContactSection && this.sidebar.fieldContactSection.entity 
    && (this.sidebar.fieldContactSection.entity.fieldOrganization || this.sidebar.fieldContactSection.entity.fieldPerson 
      || this.sidebar.fieldContactSection.entity.fieldEmail || this.sidebar.fieldContactSection.entity.fieldPhone));
  }
}