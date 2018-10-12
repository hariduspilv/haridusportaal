import { Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'oska-areas-sidebar',
  templateUrl: './oska.areas.sidebar.component.html',
	styleUrls: ['./oska.areas.sidebar.component.scss']
})

export class OskaAreasSidebarComponent implements OnInit {
  
  @Input() sidebar: any;
  private limits: any = {
    professions: 5,
    relatedPages: 5,
    quickFind: 5
  };
  private typeStatus: any = {
    professions: null,
    relatedPages: null,
    quickFind: null,
  }; 

	constructor() {}
  
  ngOnInit() {
    this.typeStatus['professions'] = this.sidebar.fieldOskaMainProfession.length > this.limits['professions'];
    this.typeStatus['quickFind'] = this.sidebar.fieldOskaFieldQuickFind.length > this.limits['quickFind'];
    this.typeStatus['relatedPages'] = this.sidebar.fieldRelatedPages.length > this.limits['relatedPages'];
  }

  showMore(type, compare) {
    this.limits[type] = this.sidebar[compare].length;
    this.typeStatus[type] = false;
  }
  
  isContactValid() {
    return this.sidebar.fieldOskaFieldContact.entity.fieldOrganization || this.sidebar.fieldOskaFieldContact.entity.fieldPerson 
    || this.sidebar.fieldOskaFieldContact.entity.fieldEmail || this.sidebar.fieldOskaFieldContact.entity.fieldPhone;
  }
}