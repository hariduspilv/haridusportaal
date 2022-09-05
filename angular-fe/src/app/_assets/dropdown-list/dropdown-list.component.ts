import { Component, OnInit, HostListener, Input } from '@angular/core';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'dropdown-list',
  templateUrl: './dropdown-list.component.html',
  styleUrls: ['./dropdown-list.component.scss'],
})
export class DropdownListComponent implements OnInit {

  @Input() data: Object[];
  @Input() reducedColumnSet = false;
  @Input() links: 'vertical' | 'horizontal' = 'horizontal';
  private colsPerRow = 4;
  private resizeDebounce: any;
  private lastWidth: number = 0;
  private modal:any = false;
  public lastOpenedPosition: number = 0;
  public errMessage: any = false;

  constructor(
    private device: DeviceDetectorService,
    private videoService: VideoEmbedService,
  ) { }

  ngOnInit() {
    this.calculateColsPerRow();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.resizeDebounce);
    this.resizeDebounce = setTimeout(() => {
      this.calculateColsPerRow();
    },                               60);
  }

  calculateColsPerRow() {
    let tmpValue: number;
    const winWidth = window.innerWidth;

    if (winWidth === this.lastWidth) {
      return false;
    }

    this.lastWidth = winWidth;

    if (winWidth > 1280 && !this.reducedColumnSet) {
      tmpValue = 4;
    } else if (winWidth > 720) {
      tmpValue = 3;
    } else {
      tmpValue = 2;
    }

    this.colsPerRow = tmpValue;
    if (this.modal) {
      const modalIndex = this.modal.index;
      this.modal.index = 9999;
      this.modalOpen(modalIndex);
    }
  }

  modalOpen(index: number) {
    if (this.modal && this.modal.index === index) {
      this.modal = false;
      const elem = document.getElementById(`block_${index}`);
      setTimeout(() => {
        const top = elem.getBoundingClientRect().top + window.scrollY - 24;
        if (!this.device.isDesktop()) {
          window.scrollTo({ top });
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      },         0);

      if (!this.device.isDesktop() && !this.modal) {
        elem.blur();
      }else if (this.device.isDesktop()) {
        document.getElementById(`block_button_${index}`).focus();
      }
      return false;
    }

    let position = (Math.ceil((index + 1) / this.colsPerRow) * this.colsPerRow) - 1;

    if (position > this.data.length - 1) {
      position = this.data.length - 1;
    }
    this.modal = this.data[index];
    this.modal.position = position;
    this.modal.index = index;

    if (this.modal.fieldOskaVideo) {
      const embeddable = this.videoService.mapVideo(this.modal.fieldOskaVideo);
      this.modal.videoUrl = embeddable.videoEmbed;
    }

    try {
      const tmpList = this.modal.reverseFieldOskaFieldParagraph.entities
        .filter(item => item.paragraphReference[0])
        .map(item => item.paragraphReference[0]);
      this.modal.list = this.sortByKey(tmpList, 'entityLabel');
    }catch (err) {}

    const elem = document.querySelector(`#block_${index}`);

    setTimeout(() => {
      const top = elem.getBoundingClientRect().top + window.scrollY - 24;
      if (!this.device.isDesktop()) {
        window.scrollTo({ top });
        this.lastOpenedPosition =
          window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
        document.getElementById('modalTitle').focus();
      }
    },         0);

  }

  modalClose() {
    if (this.modal && this.device.isDesktop()) {
      const elem = document.getElementById(`block_button_${this.modal.index}`);
      elem.focus();
    }
    this.modal = false;
  }

  sortByKey(array: object[], key: string) {
    return array.sort((a, b) => {
      const x = a[key].toLowerCase();
      const y = b[key].toLowerCase();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
}
