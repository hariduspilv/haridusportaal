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
  OnChanges,
  forwardRef,
} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

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
  selector: 'block-secondary-title',
  template: '<ng-content></ng-content>',
})

export class BlockSecondaryTitleComponent {
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

export class BlockComponent implements AfterContentInit, OnChanges{

  @Input() loading: boolean = false;

  public viewTabs: QueryList<BlockContentComponent> | Object[];
  public currentViewTabs: number = 0;
  public isMobile: boolean;
  activeTab: string = '';
  labeledTabs: number = 0;
  hasTitle: boolean = false;
  hasSecondaryTitle: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceDetectorService,
  ) {
    this.isMobile = !this.deviceService.isDesktop();
  }

  @HostBinding('class') get hostClasses(): string {
    return `block--${this.theme}`;
  }

  @ContentChildren(forwardRef(() => BlockContentComponent))
    tabs: QueryList<BlockContentComponent>;
  @ContentChildren(forwardRef(() => BlockTitleComponent))
    titleComponent: QueryList<BlockTitleComponent>;
  @ContentChildren(forwardRef(() => BlockSecondaryTitleComponent))
    secondaryTitleComponent: QueryList<BlockSecondaryTitleComponent>;

  @Input() theme: string = 'blue';
  @Input() titleBorder: boolean = false;
  @Input() tabStyle: string = 'default';

  changeTab(title:string) {
    this.activeTab = title;
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
    try {
      if (this.titleComponent.toArray().length > 0) {
        this.hasTitle = true;
      } else {
        this.hasTitle = false;
      }
    } catch (err) {}
  }

  checkSecondaryTitle() {
    try {
      if (this.secondaryTitleComponent.toArray().length > 0) {
        this.hasSecondaryTitle = true;
      } else {
        this.hasSecondaryTitle = false;
      }
    } catch (err) {}
  }

  private contentInit() {
    try {
      const activeTabs = this.tabs.filter(tab => tab.active);

      if (activeTabs.length === 0) {
        this.selectTab(this.tabs.first);
      }   else {
        this.activeTab = activeTabs[0].tabLabel;
      }
      if (this.tabs.length > 2 && this.isMobile) {
        this.constructViewTabs();
      } else {
        this.viewTabs = [this.tabs];
      }
      this.countLabels();
    } catch (err) {}

    this.checkTitle();
    this.checkSecondaryTitle();
  }

  public navigateTabs(navigation: number) {
    this.currentViewTabs = this.currentViewTabs + navigation;
  }

  public constructViewTabs() {
    const viewTabs: Object[] = [];
    for (let i = 2; i <= this.tabs.length; i += 2) {
      viewTabs.push(this.tabs.toArray().slice(i - 2, i));
    }
    if (this.tabs.length % 2) {
      viewTabs.push(this.tabs.toArray().slice(this.tabs.length - 2, this.tabs.length));
    }
    this.viewTabs = viewTabs;
  }

  ngAfterContentInit() {
    this.contentInit();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
    this.contentInit();
  }

}
