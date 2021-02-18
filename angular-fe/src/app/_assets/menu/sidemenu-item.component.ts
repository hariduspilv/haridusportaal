import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RippleService, SidemenuService } from '@app/_services';
import { IMenuData } from './sidemenu.model';
import { Location } from '@angular/common';

@Component({
  selector: 'sidemenu-item',
  templateUrl: './sidemenu.item.template.html',
  styleUrls: ['./sidemenu.styles.scss'],
})
export class MenuItemComponent {
  @Input() public items: IMenuData[];
  @Input() public type = 'item';
  @Output() public hideToggle: EventEmitter<IMenuData> = new EventEmitter<IMenuData>();

  constructor(
    private ripple: RippleService,
    private router: Router,
    private sidemenuService: SidemenuService,
    private location: Location) {}

  /**
   * This function will either navigate to an URL or expand/hide a menu.
   * Navigation takes precedence.
   * @param item `IMenuData` object
   * @param event `any`
   */
  public clickMenuItem(item: IMenuData, event: any) {
    const path = decodeURI(this.location.path());
    const match = path.replace(/\?.*/, '') === item.url.path;
    if (!match &&
        item.url.path !== '#nolink' &&
        item.url.path !== '#nocategory' &&
        item.url.path !== '#category') {
      this.router.navigateByUrl(item.url.path);
      // If the page is not a homepage, close the menu on mobile view
      if (this.sidemenuService.isMobileView && !item.firstLevel) {
        this.sidemenuService.close();
      }
    } else {
      if (item.links.length) {
        item.expanded = !item.expanded;
        if (!item.expanded) {
          item.userClosed = true;
        } else if (item.userClosed) {
          item.userClosed = false;
        }

        if (item.expanded) {
          this.closeOthers(item);
          this.hideToggle.emit(item);
        }
      }
    }
  }

  public closeOthers(item: IMenuData): void {
    this.items.forEach(i => {
      if (i !== item) {
        i.expanded = false;
      }
    });
  }

  public animateRipple(event: any) {
    this.ripple.animate(event, 'dark');
  }
}
