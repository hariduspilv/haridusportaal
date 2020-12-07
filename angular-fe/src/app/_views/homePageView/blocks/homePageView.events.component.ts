import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { IEvent } from '../homePage.model';
import { HomePageService } from '../homePage.service';

@Component({
  selector: 'homepage-events',
  templateUrl: 'homePageView.events.html',
})
export class HomePageEventsComponent implements OnInit {
  @Input() data: IEvent[] = [];
  @Input() theme: string;
  @Input() title: string;
  @Input() description: string;
  @Input() line: number = 1;

  constructor(
    private servive: HomePageService,
  ) {}

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnInit() {
    this.servive.getEvents().subscribe(events => this.data = events);
  }
}
