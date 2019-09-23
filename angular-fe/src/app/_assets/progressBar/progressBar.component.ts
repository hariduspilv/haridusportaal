import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'progress-bar',
  templateUrl: './progressBar.template.html',
  styleUrls: ['./progressBar.styles.scss'],
})

export class ProgressBarComponent implements OnChanges {
  @Input() id: any;
  @Input() level: number;
  @Input() statusLabel: string;
  @Input() startLabel: string;
  @Input() endLabel: string;

  public levelOffsets: {} = {
    1: 17,
    2: 32,
    3: 57,
    4: 76,
  };

  ngOnChanges() {
    setTimeout(
      () => {
        this.setLabelOffset();
      },
      0);
  }

  setLabelOffset() {
    const label = document.querySelector(`#progress--${this.id}`) as HTMLElement;
    if (label) {
      const labelWidth = label.getBoundingClientRect().width;
      const levelOffset: number = this.levelOffsets[this.level];
      const extraPadding: number = 12;
      if (this.level === 5) {
        label.style.margin = '0 0 0 auto';
        label.style.left = '0';
      } else {
        label.style.margin = '0';
        label.style.left = `calc(${levelOffset}% - ((${labelWidth}px) / 2) - ${extraPadding}px)`;
      }
      this.checkOffsetValidity(label);
    }
  }

  checkOffsetValidity (label) {
    const parent = document.getElementById(`progressElem--${this.id}`) as HTMLElement;
    const parentOffset = parent.getBoundingClientRect().left;
    const labelOffset = label.getBoundingClientRect().left;
    if (parentOffset > labelOffset) {
      label.style.left = '0px';
    }
  }
}
