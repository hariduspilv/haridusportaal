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
			case YouthMonitoringSidebarType.PeopleIconBlock:
				icon = 'people';
				break;
      case YouthMonitoringSidebarType.ArrowIconBlock:
        icon = 'arrow-diagonal';
        break;
      case YouthMonitoringSidebarType.DotIconBlock:
        icon = 'dot';
        break;
			case YouthMonitoringSidebarType.RedArrowIconBlock:
				icon = 'arrow-red';
				break;
			case YouthMonitoringSidebarType.OrangeArrowIconBlock:
				icon = 'arrow-orange';
				break;
			case YouthMonitoringSidebarType.StudiesBlock:
				icon = 'studies';
				break;
			case YouthMonitoringSidebarType.PodcastBlock:
				icon = 'podcast';
				break;
			case YouthMonitoringSidebarType.VideoBlock:
				icon = 'video-blue';
				break;
			case YouthMonitoringSidebarType.BlogBlock:
				icon = 'blogi';
				break;
			case YouthMonitoringSidebarType.StatisticsBlock:
				icon = 'statistics';
				break;
			case YouthMonitoringSidebarType.PeopleBlock:
				icon = 'people-with-numbers';
				break;
      default:
        icon = null;
    }

    return icon;
  }
}
