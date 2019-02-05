import { Component, Input, OnInit, AfterViewInit } from "@angular/core";

@Component({
  selector: "progress-bar",
  templateUrl: "progress.bar.template.html",
  styleUrls: ["progress.bar.styles.scss"]
})

export class ProgressBarComponent implements AfterViewInit {
  @Input() data;

  public extraPadding: number = 12;
  public levelOffsets: {} = {
    1: 17,
    2: 32,
    3: 57,
    4: 78,
    5: 100
  }

  ngAfterViewInit() {
    this.setLabelOffset();
  }

  setLabelOffset() {
    const { levelOffsets, data, extraPadding } = this;
    let label = document.querySelector('.progress__tag') as HTMLElement;
    let labelWidth = label.getBoundingClientRect().width;
    if (data.level === 5) {
      label.style.left = `calc(${levelOffsets[data.level]}% - ${labelWidth}px)`;
    } else {
      label.style.left = `calc(${levelOffsets[data.level]}% - ((${labelWidth}px) / 2) - ${extraPadding}px)`;
    }
    this.checkOffsetValidity(label);
  }

  checkOffsetValidity (label){
    let parentOffset = document.getElementById('progressElem').offsetLeft;
    if (parentOffset > label.offsetLeft) {
      label.style.left = '0px';
    }
  }
}