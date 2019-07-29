import { Component, Input, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'sidebar-element-content',
  template: '<ng-content></ng-content>',
})
export class SidebarElemContentComponent {}

@Component({
  selector: 'sidebar-element',
  templateUrl: './sidebar.elem.template.html',
})
export class SidebarElemComponent {
  @Input() title: string = '';
  @Input() theme: string = 'orange';
  @HostBinding('class') get hostClasses(): string {
    return this.theme ? `sidebar__elem--${this.theme}` : '';
  }
}

@Component({
  selector: 'sidebar',
  template: '<ng-content></ng-content>',
  styleUrls: ['./sidebar.styles.scss'],
})
export class SidebarComponent {
  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }
}
