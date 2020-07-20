import { Component, Input } from '@angular/core';

enum TooltipSymbol {
  'error' = '!',
  'info' = '?',
}

@Component({
  selector: 'tooltip',
  templateUrl: 'tooltip.template.html',
  styleUrls: ['tooltip.styles.scss'],
})
export class TooltipComponent {
  @Input() placement: string = 'right';
  @Input() type: string = 'info';

  public visible = false;

  public tooltipSymbol = TooltipSymbol;

  public toggleVisibility(state) {
    this.visible = state;
  }
}
