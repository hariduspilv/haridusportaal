import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, RootScopeService } from '../../_services';

@Component({
  templateUrl: './events.component.html'
})

export class EventsComponent {

  content: any;
  error: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService, private rootScope:RootScopeService) {

    
    this.rootScope.set('langOptions', {
      'en': '/en/events',
      'et': '/et/sundmused'
    });


    console.log( this.rootScope.get('langOptions'));
    this.route.params.subscribe( params => {

      this.rootScope.set('langOptions', {
        'en': '/en/events',
        'et': '/et/sundmused'
      });

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
