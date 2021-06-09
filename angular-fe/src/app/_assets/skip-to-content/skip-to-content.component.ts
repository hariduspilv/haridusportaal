import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'skip-to-content',
  templateUrl: './skip-to-content.template.html',
  styleUrls: ['./skip-to-content.styles.scss'],
})

export class SkipToContentComponent implements OnInit {
  @ViewChild('skip') skipLink: ElementRef<HTMLElement>;
  public skipPath = '#content';
  constructor(public router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.skipPath = `${this.router.url.replace('#content', '')}#content`;
   });
  }
}
