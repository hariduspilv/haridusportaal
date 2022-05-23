import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { LanguageCodes, SettingsService } from "@app/_services";
import { TranslateService } from "@app/_modules/translate/translate.service";
import { DeviceDetectorService } from "ngx-device-detector";

@Component({
	selector: 'dropdown-menu',
	templateUrl: 'dropdown-menu.component.html',
	styleUrls: ['dropdown-menu.component.scss']
})
export class DropdownMenuComponent {
	@Input() languages: Record<string, string | LanguageCodes>[];
	@Output() onLanguageChange = new EventEmitter<LanguageCodes>();

	private wasInside = false;

	@HostListener('click') clickInside() {
		this.wasInside = true;
	}
	@HostListener('document:click') clickOut() {
		if (!this.wasInside && this.dropdownContentStyle === 'block') {
			this.toggleDropdown();
		}
		this.wasInside = false;
	}

	activeLanguageCode: string = this.settings.currentAppLanguage;
	activeLanguage = this.translate.get(`frontpage.${this.settings.currentAppLanguage}`);
	isDesktop = this.deviceDetector.isDesktop();
	private dropdown = document.getElementsByClassName('dropbtn');
	private dropdownContent = document.getElementsByClassName('dropdown-content');
	private dropdownContentStyle = 'none';

	constructor(
		private settings: SettingsService,
		private translate: TranslateService,
		private deviceDetector: DeviceDetectorService,
	) { }

	changeLanguage(code: LanguageCodes): void {
		this.activeLanguageCode = code;
		this.activeLanguage = this.translate.get(`frontpage.${code}`);
		this.onLanguageChange.emit(code);
	}

	toggleDropdown() {
		const toggledStyle = this.dropdownContentStyle === 'block' ? 'none' : 'block';

		(this.dropdownContent[0] as HTMLElement).style.display = toggledStyle;
		this.dropdownContentStyle = toggledStyle;

		if (toggledStyle === 'block') {
			this.dropdownContent[0].setAttribute('aria-expanded', 'true');
		}
		if (toggledStyle === 'none') {
			this.dropdownContent[0].setAttribute('aria-expanded', 'false');
		}

		if (!this.isDesktop) {
			if (toggledStyle === 'block') {
				(this.dropdown[0] as HTMLElement).style.backgroundColor = '#fd8208';
			}
			if (toggledStyle === 'none') {
				(this.dropdown[0] as HTMLElement).style.backgroundColor = 'transparent';
			}
		}
	}
}
