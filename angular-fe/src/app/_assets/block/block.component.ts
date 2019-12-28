import {
  Component,
  Input,
  HostBinding,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ChangeDetectorRef,
  OnChanges,
  forwardRef,
} from '@angular/core';
import { ModalService } from '@app/_services';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';
import { ScrollableContentComponent } from '../scrollableContent';

@Component({
  selector: 'block-content',
  template: '<div class="block__content" *ngIf="active"><ng-content></ng-content></div>',
})

export class BlockContentComponent {
  @Input() tabLabel: string;
  @Input() tabLink: string;
  @Input() tabIcon: string;
  @Input() tabActive: boolean;
  @Input() active: boolean = false;
  @Input() tabVisible: boolean = true;
  @Input() queryParams: any = {};
  @ContentChildren(forwardRef(() => ScrollableContentComponent), { descendants: true })
  scrollable: QueryList<ScrollableContentComponent>;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  hide() {
    this.active = false;
    this.cdr.detectChanges();
  }

  show() {
    this.active = true;
    setTimeout(
      () => {
        try {
          this.scrollable.forEach((item) => {
            item.detectWidth();
            item.checkArrows();
          });
        } catch (err) {
        }
      },
      0);
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
  selector: 'block-sub-title',
  template: '<ng-content></ng-content>',
})

export class BlockSubTitleComponent {
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
  public activeTab: string = '';
  labeledTabs: number = 0;
  hasTitle: boolean = false;
  hasSecondaryTitle: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private deviceService: DeviceDetectorService,
    private router: Router,
  ) {
    this.isMobile = this.deviceService.isMobile();
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
  @Input() titleBorder: boolean = true;
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
      let activeTabs;
      this.tabs.forEach((item) => {
        if (item.tabActive) {
          activeTabs = [item];
        }
      });

      if (!activeTabs) {
        activeTabs = this.tabs.filter(tab => tab.active);
      }else {
        activeTabs[0].active = true;
      }
      if (activeTabs.length === 0) {
        this.selectTab(this.tabs.first || this.tabs[0]);
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
    const tmpTabs = this.tabs.toArray().filter((item) => {
      if (item.tabVisible) {
        return item;
      }
    });
    for (let i = 2; i <= tmpTabs.length; i += 2) {
      viewTabs.push(tmpTabs.slice(i - 2, i));
    }
    if (tmpTabs.length % 2) {
      viewTabs.push(tmpTabs.slice(tmpTabs.length - 2, tmpTabs.length));
    }
    this.viewTabs = viewTabs;
  }

  navigateTo(tabLink, params = {}) {
    this.router.navigate([tabLink], {
      queryParams: params,
    });
  }

  ngAfterContentInit() {
    this.contentInit();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
    this.contentInit();
  }

}
