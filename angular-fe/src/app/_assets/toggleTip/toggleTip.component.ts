import { Component, Input } from '@angular/core';

@Component({
  selector: 'toggle-tip',
  templateUrl: './toggleTip.component.html',
  styleUrls: ['./toggleTip.component.scss'],
})
export class ToggletipComponent {
  @Input() placement: string = 'right';
}
