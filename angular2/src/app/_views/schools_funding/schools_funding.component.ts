import { Component, OnInit } from '@angular/core';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';

@Component({
  templateUrl: "schools_funding.template.html",
  styleUrls: ["schools_funding.styles.scss"]
})

export class SchoolsFundingComponent extends FiltersService implements OnInit {
  showFilter: boolean;
  filterFull: boolean;

  constructor(

  ) {
    super(null, null);
  }

  ngOnInit() {

    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth < 1024;

  }

}