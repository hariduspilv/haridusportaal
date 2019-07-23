import {
  Component,
  Input,
  HostBinding,
  OnInit,
  Directive,
  HostListener,
} from '@angular/core';
import { RippleService } from '@app/_services';

@Component({
  selector: 'sidemenu-item',
  styleUrls: ['./sidemenu.styles.scss'],
  template: `
		<ng-container *ngIf="item.links.length === 0; else expandable">
			<a
				*ngIf="item.url.path !== '#nolink'"
				(mousedown)="animateRipple($event)"
				class="sidemenu__link"
				href="{{ item.url.path }}"
				><span>{{ item.label }}</span></a
			>
		</ng-container>
		<ng-template #expandable>
			<button
				class="sidemenu__link"
				(click)="toggle($event)"
				[attr.aria-expanded]="isOpen"
				[attr.aria-controls]="item.label"
			>
				<span>{{ item.label }}</span>
				<icon glyph="chevron-down"></icon>
			</button>
			<ul id="{{ item.label }}">
				<li *ngFor="let item of item.links" (mousedown)="animateRipple($event)">
					<a
						*ngIf="item.url.path !== '#nolink'"
						class="sidemenu__link"
						href="{{ item.url.path }}"
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
export class MenuComponent implements OnInit {
  @Input() data = Object;
  @HostBinding('class') get hostClasses(): string {
    return 'sidemenu';
  }

  constructor() { }

  // needs to have a service associated to it
  // needs to get menu data on init
  ngOnInit() {
    console.log(this.data);
  }
}
