import { Component, OnInit, Input, OnChanges } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';
import { translationsPerType } from '../compare/helpers/compare';

@Component({
	selector: 'listItems',
	templateUrl: 'listItem.template.html',
	styleUrls: ['listItem.styles.scss'],
})
export class ListItemComponent implements OnInit, OnChanges {
	@Input() list: Object[];
	@Input() type: string;
	@Input() compare: string;
	@Input() addonClass: string = '';
	@Input() orderBy: string | boolean = false;

	public closeTime: number = 5000;
	private translationsPerType = translationsPerType;
	public clickedVideos = {};
	public footerFields = {
		studyProgramme: [
			'educationalInstitution',
			'fieldSchoolName',
			'duration',
			'teachingLanguage',
		],
		school: ['address', 'fieldSchoolLocation', 'webpage', 'phone', 'email'],
		mainProfession: ['fillingBar'],
		homeSearch: ['fieldSchoolName', 'studyProgrammeLevel', 'duration'],
	};

	public competitionLabels = [
		'oska.simple_extended',
		'oska.quite_simple_extended',
		'oska.medium_extended',
		'oska.quite_difficult_extended',
		'oska.difficult_extended',
	];

	constructor(public videoEmbedService: VideoEmbedService) {}

	sortByKey(array, key) {
		return array.sort((a, b) => {
			const x = a[key];
			const y = b[key];
			return x < y ? -1 : x > y ? 1 : 0;
		});
	}

	parseList(): void {
		this.list.forEach((element, index) => {
			this.list[index] = FieldVaryService(element);
		});

		if (this.orderBy) {
			this.list = this.sortByKey(this.list, 'title');
		}

		this.list = this.list.map((listItem: any) => ({
			...listItem,
			video: listItem.video
				? this.videoEmbedService.mapVideo(
						Array.isArray(listItem.video) ? listItem.video[0] : listItem.video,
						listItem.videoThumb?.derivative?.url
				  )
				: undefined,
		}));
	}
	ngOnInit() {
		this.parseList();
	}

	ngOnChanges() {
		this.parseList();
	}

	getCompetitionLabel(input: string | number) {
		const val = Number(input);
		if (val > 0 && val < 6) {
			return this.competitionLabels[val - 1];
		}
		return '';
	}

	indicatorValues(item) {
		const res = [];
		let employed = {};
		let pay = {};
		item.forEach((elem) => {
			if (elem.oskaId === '1') employed = elem;
			if (elem.oskaId === '3') pay = elem;
		});

		if (employed['oskaId']) res.push(employed);
		if (pay['oskaId']) res.push(pay);

		return res;
	}

	returnEntityString(entity) {
		if (Array.isArray(entity)) {
			return entity.join(', ');
		}
		return entity;
	}

	isArray(obj: any) {
		return Array.isArray(obj);
	}
}
