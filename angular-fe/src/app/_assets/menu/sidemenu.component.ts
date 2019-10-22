import {
  Component,
  Input,
  HostBinding,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RippleService, SidemenuService, SettingsService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'sidemenu-item',
  styleUrls: ['./sidemenu.styles.scss'],
  template: `
		<ng-container *ngIf="item['links'].length === 0; else expandable">
			<a
				*ngIf="item.url.path !== '#nolink'"
				(mousedown)="animateRipple($event)"
				class="sidemenu__link"
				routerLink="{{ item.url.path }}"
				><span>{{ item.label }}</span></a
			>
		</ng-container>
    <ng-template #expandable>
			<button
				class="sidemenu__link"
				(click)="toggle($event)"
				[attr.aria-expanded]="isOpen"
				[attr.aria-controls]="item.label | slugify"
			>
				<span>{{ item.label }}</span>
				<icon glyph="chevron-down" size="medium"></icon>
			</button>
			<ul id="{{item.label | slugify}}">
				<li *ngFor="let item of item['links']" (mousedown)="animateRipple($event)">
					<a
						*ngIf="item.url.path !== '#nolink'"
						class="sidemenu__link"
						routerLink="{{ item.url.path }}"
					>
						<span>{{ item.label }}</span>
					</a>
				</li>
			</ul>
		</ng-template>
	`,
})
export class SidemenuItemComponent {
  public isOpen: boolean = false;
  @Input() item: object = {};

  constructor(private ripple: RippleService) { }

  toggle(e) {
    this.isOpen = !this.isOpen;
    this.animateRipple(e);
  }
  animateRipple(event) {
    this.ripple.animate(event, 'dark');
  }
}

@Component({
  selector: 'sidemenu',
  templateUrl: './sidemenu.template.html',
  styleUrls: ['./sidemenu.styles.scss'],
})

export class MenuComponent implements OnInit, OnDestroy {

  public isVisible: boolean;
  private subscription: Subscription = new Subscription();
  @Input() data;
  @HostBinding('class') get hostClasses(): string {
    return this.isVisible ? 'sidemenu is-visible' : 'sidemenu';
  }

  constructor(
    private sidemenuService: SidemenuService,
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  subscribeToService():void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
    });
  }

  getData():void {
    const variables = {
      language: this.settings.activeLang,
    };
    const path = this.settings.query('getMenu', variables);
    const subscription = this.http.get(path).subscribe((response) => {
      this.data = response['data'];
    });
  }

  ngOnInit():void {
    this.subscribeToService();
    this.getData();
  }

  ngOnDestroy():void {
    this.subscription.unsubscribe();
  }
  // needs to have a service associated to it
  // needs to get menu data on init
}
