import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService } from '../../_services';

@Component({
  templateUrl: './events.component.html'
})

export class EventsComponent {

  content: any;
  error: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService) {

    this.route.params.subscribe( params => {

      this.content = false;
      this.error = false;

      const path = this.router.url;

      const that = this;

      eventService.getList(path, function(data) {

        if ( data['nodeQuery'] == null ) {
          that.error = true;
        } else {
          that.content = data['nodeQuery'];
          console.log(that.content);
        }

      });

    });
  }
}
