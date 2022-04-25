import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { LanguageCodes, SettingsService } from "@app/_services";
import { TranslateService } from "@app/_modules/translate/translate.service";
import { DeviceDetectorService } from "ngx-device-detector";

@Component({
	selector: 'dropdown-menu',
	templateUrl: 'dropdown-menu.component.html',
	styleUrls: ['dropdown-menu.component.scss']
})
export class DropdownMenuComponent implements OnInit {
	@Input() languages: Record<string, string | LanguageCodes>[];
	@Output() onLanguageChange = new EventEmitter<LanguageCodes>();

	activeLanguageCode: string = this.settings.currentAppLanguage;
	activeLanguage = this.translate.get(`frontpage.${this.settings.currentAppLanguage}`);

	constructor(
		private settings: SettingsService,
		private translate: TranslateService,
		private deviceDetector: DeviceDetectorService,
	) {}

	ngOnInit() {
		this.setStylesForMobile();
	}

	onClick(code: LanguageCodes): void {
		this.activeLanguageCode = code;
		this.activeLanguage = this.translate.get(`frontpage.${code}`);
		this.onLanguageChange.emit(code);
	}

	private setStylesForMobile(): void {
		if (!this.deviceDetector.isDesktop()) {
			const dropdown = document.querySelector('.language-dropdown') as HTMLElement;
			const dropbtn = dropdown.querySelector('.dropbtn') as HTMLElement;

			dropdown.style.marginRight = '0';
			dropbtn.style.paddingLeft = '0';
		}
	}
}
