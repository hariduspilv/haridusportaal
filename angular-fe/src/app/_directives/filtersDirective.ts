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

    this.router.navigate([], {
      queryParams,
    });
  }

  setValues(queryParams): void {
    this.formItems.forEach((item) => {
      const data = item.getValue();
      if (queryParams[data.name]) {
        item.setValue(queryParams[data.name]);
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
