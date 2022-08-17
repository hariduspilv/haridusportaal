import { Component, Input } from '@angular/core';
import { YouthMonitoringSidebarType } from '../../models/enums';
import { YouthMonitoringSidebar } from '../../models/interfaces';

@Component({
  selector: 'youth-monitoring-sidebar-block',
  templateUrl: './youth-monitoring-sidebar-block.component.html',
  styleUrls: ['./youth-monitoring-sidebar-block.component.scss']
})
export class YouthMonitoringSidebarBlockComponent {
  @Input() data: YouthMonitoringSidebar;

  public get icon(): string {
    let icon: null | string = null;
    switch(this.data.entity.fieldBlockType) {
      case YouthMonitoringSidebarType.ArrowIconBlock:
        icon = 'arrow-diagonal';
        break;
      case YouthMonitoringSidebarType.DotIconBlock:
        icon = 'dot';
        break;
      case YouthMonitoringSidebarType.PeopleIconBlock:
        icon = 'people';
        break;
      default:
        icon = null;
    }
    return icon;
  }
}
