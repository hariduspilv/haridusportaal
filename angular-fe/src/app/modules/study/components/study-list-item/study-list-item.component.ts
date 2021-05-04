import {Component, HostBinding, Input} from '@angular/core';
import {MappedStudy} from '../../models/mapped-study';

@Component({
	selector: 'study-list-item',
	templateUrl: './study-list-item.component.html',
	styleUrls: ['./study-list-item.component.scss'],
})
export class StudyListItemComponent {
	@Input() study: MappedStudy;
	@Input() highlighted: boolean;
	@Input() noBorderBefore: boolean;

	@HostBinding('class') get hostClasses(): string {
		return `${this.highlighted ? 'highlighted' : ''} ${this.noBorderBefore ? 'no__border__before' : ''}`;
	}
}
