import { Directive, AfterViewInit, Input, ElementRef, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[rotateTable]',
})

export class RotateTableDirective implements AfterViewInit {
  @Input() rotateTable: boolean = false;

  private classes = {
    th: '',
    td: '',
  };

  constructor(
    private el: ElementRef,
  ) {}

  private buildHtml(thList, trList) {
    let output = '';
    thList.forEach((th, index) => {
      output += '<tr role="row">';
      output += `<th role="cell" id="th-${index}"class="${this.classes.th}">${th}</th>`;
      trList.forEach((tr) => {
        if (tr[index]) {
          output += `<td role="cell" aria-describedby="th-${index}"
          rowspan="${tr[index].rowspan ? tr[index].rowspan : ''}"
          class="${this.classes.td}">${tr[index].val}</td>`;
        }
      });
      output += '</tr>';
    });
    output = output.replace(/<![^>]*>/igm, '');
    this.el.nativeElement.innerHTML = output;
  }

  private getData(): void {
    const thList = [];
    const trList = [];
    const th = this.el.nativeElement.querySelectorAll('th').forEach((item) => {
      thList.push(item.innerHTML);
    });

    const tr = this.el.nativeElement.querySelectorAll('tr').forEach((item) => {
      const tmp = [];
      item.querySelectorAll('td').forEach((child) => {
        tmp.push({
          val: child.innerHTML,
          rowspan: child.getAttribute('colspan'),
        });
      });
      if (tmp.length) {
        trList.push(tmp);
      }
    });

    this.classes.th = this.el.nativeElement.querySelectorAll('th')[0].className;
    this.classes.td = this.el.nativeElement.querySelectorAll('td')[0].className;

    this.buildHtml(thList, trList);
  }

  ngAfterViewInit() {
    if (this.rotateTable) {
      this.getData();
    }
  }
}
