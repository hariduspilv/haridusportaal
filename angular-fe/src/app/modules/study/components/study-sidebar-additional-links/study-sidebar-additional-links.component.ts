import { Component, Input } from '@angular/core';
import { EntityLink } from '@app/_core/models/interfaces/main';

@Component({
  selector: 'study-sidebar-additional-links',
  templateUrl: './study-sidebar-additional-links.component.html',
  styleUrls: ['./study-sidebar-additional-links.component.scss'],
})
export class StudySidebarAdditionalLinksComponent {
  @Input() data: EntityLink[];
}
