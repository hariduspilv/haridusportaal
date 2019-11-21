import {
  Directive,
  OnInit,
  ElementRef,
  ContentChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormItemComponent } from '@app/_assets/formItem';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[filters]',
})

export class FiltersDirective implements AfterViewInit, OnDestroy{

  @ContentChildren(FormItemComponent) formItems: QueryList<FormItemComponent>;

  private paramsWatcher: Subscription = new Subscription();

  constructor(
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  bindEvents(): void {
    this.el.nativeElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.gatherValues();
    });
  }

  gatherValues(): void {
    const queryParams = {};

    this.formItems.forEach((item) => {
      const data = item.getValue();
      if (data.name && data.name !== '' && data.value && data.value !== '') {
        queryParams[data.name] = data.value;
      }
    });

    Object.keys(queryParams).forEach((item) => {
      if (Array.isArray(queryParams[item])) {
        queryParams[item] = queryParams[item].join(',');
      }
    });

    this.router.navigate([], {
      queryParams,
    });
  }

  setValues(queryParams): void {
    const tmpParams = { ...queryParams };
    Object.keys(tmpParams).forEach((item) => {
      if (tmpParams[item].match(',')) {
        tmpParams[item] = tmpParams[item].split(',');
        tmpParams[item] = tmpParams[item].map((obj) => {
          let val = obj;
          if (!obj.match(/\D/)) {
            val = parseFloat(val);
          }
          return val;
        });
      }
    });
    this.formItems.forEach((item) => {
      const data = item.getValue();
      if (tmpParams[data.name]) {
        item.setValue(tmpParams[data.name]);
      }
    });
  }

  watchParams(): void {
    this.paramsWatcher = this.route.queryParams.subscribe((queryParams) => {
      this.setValues(queryParams);
    });
  }

  ngAfterViewInit() {
    this.bindEvents();
    this.watchParams();
  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
  }
}
