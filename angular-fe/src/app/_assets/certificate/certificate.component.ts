import { Component, Input, HostBinding, ElementRef, HostListener, ViewChild, SimpleChanges, ChangeDetectorRef, Host } from '@angular/core';

@Component({
  selector: 'certificate',
  templateUrl: 'certificate.template.html',
  styleUrls: ['certificate.styles.scss'],
})
export class CertificateComponent{

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
  }

  @HostBinding('style.height.px') hostHeight;

  @ViewChild('certificate', { static: false }) certificate: ElementRef;

  @Input() document: any = {};

  @HostListener('window:resize') onResize() {
    this.calculateCertificateSize();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateCertificateSize();
    });
  }

  calculateCertificateSize() {
    this.hostHeight = this.el.nativeElement.offsetWidth * 1.4142;
    this.certificate.nativeElement.style.transform = `scale(${this.el.nativeElement.offsetWidth / 700})`;
  }
}
