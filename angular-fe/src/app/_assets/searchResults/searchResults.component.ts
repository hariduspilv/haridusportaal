import {
	Component,
	OnDestroy,
	Input,
	OnChanges,
	ChangeDetectorRef,
	AfterViewInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
	SettingsService,
	ScrollRestorationService,
	ListRestorationType,
} from '@app/_services';
import * as moment from 'moment';
import {
	searchResultKeys,
	requiredFields,
	queryList,
	likeFields,
	defaultValues,
	multiSelectFields,
} from './searchResults.helper';
import { HttpClient } from '@angular/common/http';
import { DeviceDetectorService } from 'ngx-device-detector';
import { paramsExist, scrollElementIntoView } from '@app/_core/utility';

@Component({
	selector: 'searchResults',
	templateUrl: 'searchResults.template.html',
	styleUrls: ['searchResults.styles.scss'],
})
export class SearchResultsComponent
	implements AfterViewInit, OnDestroy, OnChanges
{
	@Input() type: string = '';
	@Input() limit: number = 10;
	@Input() compare: string = '';

	public parsedType: string = '';
	public queryName: string = '';

	private paramsWatcher: Subscription = new Subscription();
	private httpWatcher: Subscription = new Subscription();
	public values: object = {};
	public offset: number = 0;
	public loading: boolean = true;
	public list: any = [];
	private getDataDebounce;
	private debounceDelay: number = 300;
	public canLoadMore: boolean = true;
	public loadingMore: boolean = false;
	public noResultStringByType: string = 'news.no_results';
	private scrollRestorationValues: { [type: string]: ListRestorationType } =
		null;
	private latestRestorationPosition: { [type: string]: number };
	private mobileOrTablet: boolean;
	private mobileOrTabletScrolled: boolean;
	public listItemCount: number;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private settings: SettingsService,
		private scrollRestoration: ScrollRestorationService,
		private cdr: ChangeDetectorRef,
		private deviceService: DeviceDetectorService
	) {
		this.mobileOrTablet =
			this.deviceService.isMobile() || this.deviceService.isTablet();
	}

	private addRequiredFields(queryParams) {
		const tmp = { ...queryParams };
		requiredFields[this.parsedType].forEach((item) => {
			if (!tmp[item]) {
				if (item.match(/date/gim)) {
					if (item.match(/min/gim)) {
						if (this.parsedType === 'news') {
							tmp[item] = moment().utc().subtract(5, 'years').unix();
						} else {
							tmp[item] = moment().utc().startOf('D').unix();
						}
					} else if (item.match(/max/gim)) {
						tmp[item] = moment().utc().add(1, 'years').unix();
					}
				} else {
					tmp[item] = '';
				}
			}
		});
		return tmp;
	}

	private getValue(value, key) {
		let tmpValue = value;
		try {
			tmpValue =
				likeFields[this.parsedType].indexOf(key) !== -1 && value
					? `%25${value}%25`
					: value;
		} catch (err) {}
		return tmpValue;
	}

	private parseValues(queryParams) {
		const values = {};
		const tmpParams = this.addRequiredFields(queryParams);

		if (tmpParams.sort) {
			if (tmpParams.sort.indexOf('_') === -1) {
				tmpParams['sortField'] = tmpParams.sort;
				tmpParams['sortDirection'] = 'ASC';
			} else {
				const splitValues = tmpParams.sort.split('_');
				tmpParams['sortField'] = splitValues
					.splice(0, splitValues.length - 1)
					.join('_');
				tmpParams['sortDirection'] =
					splitValues[splitValues.length - 1].toUpperCase();
				delete tmpParams['sort'];
			}
		}

		Object.keys(tmpParams).forEach((item) => {
			let tmpItem;
			if (item.match(/date/gim)) {
				if (typeof tmpParams[item] === 'string') {
					if (item.match(/min/gim)) {
						tmpParams[item] = moment
							.utc(tmpParams[item], 'DD.MM.YYYY')
							.startOf('D')
							.unix();
					} else if (item.match(/max/gim)) {
						tmpParams[item] = moment
							.utc(tmpParams[item], 'DD.MM.YYYY')
							.endOf('D')
							.unix();
					} else {
						tmpParams[item] = moment.utc(tmpParams[item], 'DD.MM.YYYY').unix();
					}
				}
				tmpParams[item] = tmpParams[item].toString();
			}
			if (searchResultKeys[this.parsedType][item]) {
				if (typeof searchResultKeys[this.parsedType][item] === 'string') {
					tmpItem = searchResultKeys[this.parsedType][item];
					values[searchResultKeys[this.parsedType][item]] = this.getValue(
						tmpParams[item],
						item
					).replace(/\;/gim, ',');
				} else {
					tmpItem = searchResultKeys[this.parsedType][item].key;
					values[searchResultKeys[this.parsedType][item].key] = this.getValue(
						tmpParams[item],
						item
					).replace(/\;/gim, ',');
				}
			} else {
				values[item] = this.getValue(tmpParams[item], item);
			}
			if (values[item] === '') {
				try {
					values[item] = defaultValues[this.parsedType][item] || '';
				} catch (err) {}
			}

			try {
				if (multiSelectFields[this.parsedType].indexOf(tmpItem) !== -1) {
					values[tmpItem] = values[tmpItem].split(',');
					if (values[tmpItem][0] === '') {
						values[tmpItem].splice(0, 1);
					}
				}
			} catch (err) {}
		});

		return values;
	}

	private watchParams() {
		this.paramsWatcher = this.route.queryParams.subscribe((queryParams) => {
			const paramsValues = this.parseValues({ ...queryParams });
			this.offset = 0;
			const scrollSub = this.scrollRestoration.restorationValues.subscribe(
				(values) => {
					this.scrollRestorationValues = values;
					if (
						this.scrollRestoration.popstateNavigation &&
						values &&
						values[this.type]
					) {
						this.getData(
							{ ...values[this.type].values },
							false,
							values[this.type].list
						);
					} else if (
						!this.scrollRestoration.popstateNavigation &&
						values &&
						values[this.type]
					) {
						this.scrollRestoration.restorationValues.next({
							...values,
							[this.type]: null,
						});
						this.getData({ ...paramsValues });
					} else {
						this.getData({ ...paramsValues });
					}
				}
			);
			scrollSub.unsubscribe();
		});
	}

	private getData(values, append?: boolean, listValue?: Object[]): void {
		clearTimeout(this.getDataDebounce);
		this.httpWatcher.unsubscribe();
		this.getDataDebounce = setTimeout(() => {
			values.content_type = this.queryName;
			values.lang = this.settings.currentAppLanguage.toUpperCase();
			values.offset = this.offset;
			values.limit = this.limit;

			if (this.queryName === 'school') {
				if (values.primaryTypes) {
					values.type = values.primaryTypes.split(';');
				}
				if (values.secondaryTypes) {
					values.type = [...values.secondaryTypes.split(';')];
				}
			}

			if (values.open_admission) {
				values.onlyOpenAdmission =
					values.open_admission === 'true' ? true : false;
				delete values.open_admission;
			}

			if (!values.type) {
				delete values.type; // TODO: pending BE fix
			}

			const path = this.settings.queryList(this.queryName, values);

			if (!this.loadingMore) {
				this.loading = true;
			}

			if (listValue) {
				this.list = listValue;
			} else if (!append) {
				this.list = [];
			}

			if (listValue) {
				this.loading = false;
				this.loadingMore = false;
				this.listItemCount =
					this.scrollRestorationValues[this.type].listItemCount;
				this.canLoadMore = this.scrollRestorationValues[this.type].canLoadMore;
				const scrollSub = this.scrollRestoration.restorationPosition.subscribe(
					(position) => {
						this.latestRestorationPosition = position;
						if (position) {
							setTimeout(() => {
								document.querySelector('.app-content').scrollTop =
									position[this.type];
							}, 0);
						}
					}
				);
				scrollSub.unsubscribe();
			} else {
				this.httpWatcher = this.http.get(path).subscribe({
					next: (response) => {
						if (!this.loadingMore) {
							this.loading = false;
						}
						this.loadingMore = false;
						let tmpList: unknown[] = [];
						try {
							tmpList = Object.values(response['entities']);
							this.listItemCount = Number(response['count']);
							this.cdr.detectChanges();
						} catch (err) {}

						if (!tmpList) {
							tmpList = [];
						}

						this.canLoadMore = tmpList.length >= this.limit ? true : false;

						if (append) {
							this.list = [...this.list, ...tmpList];
						} else {
							this.list = tmpList;
						}

						this.scrollRestoration.restorationValues.next({
							...this.scrollRestorationValues,
							[this.type]: {
								values,
								list: this.list,
								canLoadMore: this.canLoadMore,
								listItemCount: this.listItemCount,
							},
						});

						if (this.deviceService.isMobile() && paramsExist(this.route)) {
							scrollElementIntoView('block');
						}
					},
					error: (err) => {
						this.loading = false;
						this.loadingMore = false;
					},
				});
			}
		}, this.debounceDelay);
	}

	public loadMore(): void {
		this.loadingMore = true;
		this.offset = this.list.length;
		const params = this.route.snapshot.queryParams;
		const values = this.parseValues({ ...params });
		this.getData({ ...values }, true);
	}

	ngAfterViewInit() {
		this.noResultStringByType =
			this.type !== 'mainProfession'
				? `${this.type}.no_results`
				: 'news.no_results';

		setTimeout(() => {
			this.parsedType = this.type.toLowerCase();
			this.queryName = queryList[this.parsedType];
			this.watchParams();
		}, 0);
	}

	ngAfterViewChecked() {
		const lastImg = document.querySelector('.lastImg');
		if (
			lastImg &&
			this.mobileOrTablet &&
			!this.mobileOrTabletScrolled &&
			this.latestRestorationPosition
		) {
			const lastImgSrc = lastImg.getAttribute('src');
			const image = new Image();
			image.onload = () => {
				document.querySelector('.app-content').scrollTop =
					this.latestRestorationPosition[this.type];
				this.mobileOrTabletScrolled = true;
			};
			image.src = lastImgSrc;
		}
	}

	ngOnChanges() {
		this.parsedType = this.type.toLowerCase();
		this.queryName = queryList[this.parsedType];
		this.paramsWatcher.unsubscribe();
		this.httpWatcher.unsubscribe();
		this.watchParams();
	}

	ngOnDestroy() {
		this.scrollRestoration.restorationPosition.next({
			...this.scrollRestoration.restorationPosition.getValue(),
			[this.type]: document.querySelector('.app-content')?.scrollTop || 0,
		});
		this.paramsWatcher.unsubscribe();
		this.httpWatcher.unsubscribe();
	}
}
