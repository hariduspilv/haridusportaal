import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'toggle-tip',
  templateUrl: './toggleTip.component.html',
  styleUrls: ['./toggleTip.component.scss'],
})
export class ToggletipComponent {
  @Input() placement: string = 'right';
  @Input() content: string;

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  announceContent(): void {
    this.liveAnnouncer.announce(this.content, 'assertive');
  }
}
