import {
  Component,
  Input,
  HostBinding,
  ContentChildren,
  QueryList,
  ViewChildren,
  AfterContentInit,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { RippleService } from '@app/_services';

@Component({
  selector: 'block-content',
  template: '<div class="block__content" *ngIf="active"><ng-content></ng-content></div>',
})

export class BlockContentComponent {
  @Input() tabLabel: string;
  @Input() tabIcon: string;
  @Input() active: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  hide() {
    this.active = false;
    this.cdr.detectChanges();
  }

  show() {
    this.active = true;
    this.cdr.detectChanges();
  }

}

@Component({
  selector: 'block-title',
  template: '<ng-content></ng-content>',
})

export class BlockTitleComponent {
  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  detectChanges() {
    this.cdr.detectChanges();
  }
}

@Component({
  selector: 'block-tabs',
  template: '<ng-content></ng-content>',
})

export class BlockTabsComponent {}

@Component({
  selector: 'block',
  templateUrl: './block.template.html',
  styleUrls: ['./block.styles.scss'],
})

export class BlockComponent implements AfterContentInit{

  @Input() loading: boolean = false;

  activeTab: string = '';
  labeledTabs: number = 0;
  hasTitle: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ripple: RippleService,
  ) {}

  @HostBinding('class') get hostClasses(): string {
    return `block--${this.theme}`;
  }

  @ContentChildren(BlockContentComponent) tabs: QueryList<BlockContentComponent>;
  @ContentChildren(BlockTitleComponent) titleComponent: QueryList<BlockTitleComponent>;

  @Input() theme: string = 'blue';
  @Input() titleBorder: boolean = false;

  changeTab(title:string) {
    this.activeTab = title;
  }

  animateRipple($event) {
    this.ripple.animate($event, 'dark');
  }

  selectTab(tab) {
    this.tabs.toArray().forEach(tab => tab.hide());
    tab.show();
    this.activeTab = tab.tabLabel;
    this.cdr.detectChanges();
  }

  countLabels() {
    this.labeledTabs = this.tabs.filter((tab) => {
      return tab.tabLabel ? true : false;
    }).length;
  }

  checkTitle() {
    if (this.titleComponent.toArray().length > 0) {
      this.hasTitle = true;
    }
  }

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter(tab => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }   else {
      this.activeTab = activeTabs[0].tabLabel;
    }

    this.countLabels();
    this.checkTitle();

  }

}
