import { Component, EventEmitter, Input, Output } from "@angular/core";
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

	activeLanguageCode: string = this.settings.currentAppLanguage;
	activeLanguage = this.translate.get(`frontpage.${this.settings.currentAppLanguage}`);
	isDesktop = this.deviceDetector.isDesktop();
	private dropdown = document.getElementsByClassName('dropdown-content');

	constructor(
		private settings: SettingsService,
		private translate: TranslateService,
		private deviceDetector: DeviceDetectorService,
	) {}

	onClick(code: LanguageCodes): void {
		this.activeLanguageCode = code;
		this.activeLanguage = this.translate.get(`frontpage.${code}`);
		this.onLanguageChange.emit(code);
	}

	mouseOver() {
		this.dropdown[0].setAttribute('aria-expanded', 'true');
	}

	mouseLeave() {
		this.dropdown[0].setAttribute('aria-expanded', 'false');
	}
}
