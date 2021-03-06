import {
  Component,
  Input,
  HostBinding,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnInit,
  AfterContentChecked,
} from '@angular/core';

import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'more-block',
  templateUrl: './more.block.template.html',
  styleUrls: ['./more.block.styles.scss'],
})

export class MoreBlockComponent implements AfterContentChecked, OnInit {
  @Input() content: any = false;
  @Input() id: string;
  @ViewChild('moreContent') moreContentElem: ElementRef;
  public cutoffs: Object = {
    lg: 88,
    sm: 110,
  };
  public active: boolean = false;
  public show: boolean = false;
  public links: any;
  public screenReaderContent: string = '';
  public hasInitialized = false;
  public translatedContent: any = false;
  @HostBinding('class') get hostClasses(): string {
    return `${this.content ? 'content__box' : 'empty'} ${this.show ? 'show' : 'hide'}`;
  }
  constructor (
    private deviceDetector: DeviceDetectorService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translatedContent = this.translate.get(this.content);
  }
  ngAfterContentChecked(): void {
    if (this.moreContentElem &&
      this.moreContentElem.nativeElement.clientHeight !== 0 &&
      this.translatedContent &&
      !this.hasInitialized
    ) {
      const contentElem = this.moreContentElem.nativeElement;
      this.links = document.querySelectorAll(`#moreContent-${this.id} a, .content__inner a`);
      this.setInnerLinkStates(this.show);
      this.screenReaderContent = this.translatedContent ? this.translatedContent.replace(/<[^>]*>/g, '') : '';
      if ((this.deviceDetector.isDesktop() || this.deviceDetector.isTablet())
        && contentElem && contentElem.clientHeight >= this.cutoffs['lg']
        ) {
        this.active = true;
      } else if (contentElem && contentElem.clientHeight >= this.cutoffs['sm']) {
        this.active = true;
      } else {
        this.show = false;
      }
      this.hasInitialized = true;
      this.cdr.detectChanges();
    }
  }
  setInnerLinkStates(state) {
    for (let i = 0; i < this.links.length; i += 1) {
      if (!state) {
        setTimeout(
          () => this.links[i]
            .setAttribute('style', `visibility: ${state ? 'visible' : 'hidden'}`),
          225,
        );
      } else {
        this.links[i].setAttribute('style', `visibility: ${state ? 'visible' : 'hidden'}`);
      }
    }
  }
  changeState() {
    const newState = !this.show;
    this.setInnerLinkStates(newState);
    this.show = newState;
    if (newState) {
      document.getElementById(`wrapper-${this.id}`).focus();
    }
  }
}
