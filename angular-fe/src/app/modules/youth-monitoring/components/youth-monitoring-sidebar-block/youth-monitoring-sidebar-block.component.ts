import { Component, Input } from '@angular/core';
import { arrayOfLength } from '@app/_core/utility';
import { YouthMonitoringSidebarType } from '../../models/enums';
import { YouthMonitoringSidebar } from '../../models/interfaces';

const icons = {
	[YouthMonitoringSidebarType.PeopleIconBlock]: 'people',
	[YouthMonitoringSidebarType.ArrowIconBlock]: 'arrow-diagonal',
	[YouthMonitoringSidebarType.DotIconBlock]: 'dot',
	[YouthMonitoringSidebarType.RedArrowIconBlock]: 'arrow-red',
	[YouthMonitoringSidebarType.OrangeArrowIconBlock]: 'arrow-orange',
	[YouthMonitoringSidebarType.StudiesBlock]: 'studies',
	[YouthMonitoringSidebarType.PodcastBlock]: 'podcast',
	[YouthMonitoringSidebarType.VideoBlock]: 'video-blue',
	[YouthMonitoringSidebarType.BlogBlock]: 'blogi',
	[YouthMonitoringSidebarType.StatisticsBlock]: 'statistics',
	[YouthMonitoringSidebarType.PeopleBlock]: 'people-with-numbers',
}

@Component({
  selector: 'youth-monitoring-sidebar-block',
  templateUrl: './youth-monitoring-sidebar-block.component.html',
  styleUrls: ['./youth-monitoring-sidebar-block.component.scss']
})
export class YouthMonitoringSidebarBlockComponent {
  @Input() data: YouthMonitoringSidebar;

	public createArr = arrayOfLength;
	public get peopleBlock() {
		return this.data.entity.fieldBlockType === 'PeopleBlock';
	}
  public get icon(): string {
    return icons[this.data.entity.fieldBlockType] || null;
  }
}
