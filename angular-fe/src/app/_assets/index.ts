import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import {
	BlockComponent,
	BlockContentComponent,
	BlockSecondaryTitleComponent,
	BlockSubTitleComponent,
	BlockTabsComponent,
	BlockTitleComponent,
	BlockSecondaryTitleSubtextComponent,
} from './block';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ButtonComponent } from './button';
import { LoaderComponent } from './loader';
import { SkeletonComponent } from './skeleton';
import { IconComponent } from './icon';
import { RouterModule } from '@angular/router';
import { AccordionComponent, AccordionItemComponent } from './accordion';
import { SchoolTable, StudyProgrammeTable, TableComponent } from './table';
import { AlertsComponent } from './alerts';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
	RECAPTCHA_LANGUAGE,
	RecaptchaFormsModule,
	RecaptchaModule,
} from 'ng-recaptcha';
import {
	AnalyticsService,
	AuthService,
	ModalService,
	NgbDateCustomParserFormatter,
	RippleService,
	ScrollRestorationService,
	SettingsService,
	SidebarService,
	SidemenuService,
	UploadService,
} from '@app/_services';
import {
	NgbDateParserFormatter,
	NgbDatepickerModule,
	NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent, MenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ScrollableContentComponent } from './scrollableContent';
import { NgPipesModule } from 'ngx-pipes';
import { FormItemComponent } from './formItem';
import {
	AnalyticsEvent,
	CornerLogoDirective,
	FiltersDirective,
	LazyImgDirective,
	RippleDirective,
	RotateTableDirective,
	ScrollToDirective,
} from '@app/_directives';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent, ModalContentComponent } from './modal';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import {
	SidebarActionsComponent,
	SidebarArticlesComponent,
	SidebarCategoriesComponent,
	SidebarComponent,
	SidebarContactComponent,
	SidebarDataComponent,
	SidebarDownloadFileComponent,
	SidebarEventsComponent,
	SidebarFactsComponent,
	SidebarFinalDocumentAccessComponent,
	SidebarFinalDocumentDownloadComponent,
	SidebarFinalDocumentHistoryComponent,
	SidebarGdprComponent,
	SidebarLinksComponent,
	SidebarLocationComponent,
	SidebarNotificationsComponent,
	SidebarProgressComponent,
	SidebarRegisterComponent,
} from './sidebar';
import { ProgressBarComponent } from './progressBar';
import { MapComponent } from './map';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { ShareComponent } from './share';
import { ClipboardService } from 'ngx-clipboard';
import { LabelsComponent } from './labels';
import { FavouriteComponent } from './favourite';
import { LabeledSeparatorComponent } from './labeled-separator';
import { ListItemComponent } from './listItem/listItem.component';
import { ChartComponent } from './chart/chart.component';
import { SearchResultsComponent } from './searchResults';
import { StudyProgrammesComponent } from './studyProgrammes/studyProgrammes.component';
import { SchoolsComponent } from './schools/schools.component';
import { NewsComponent } from './news/news.component';
import { MainProfessionsComponent } from './mainProfessions/mainProfessions.component';
import { CompareComponent } from './compare';
import { AutocompleteComponent } from './autocomplete';
import { DropdownListComponent } from './dropdown-list/dropdown-list.component';
import { Triangles } from './shapes/triangles/triangles';
import { Circles } from './shapes/circles/circles';
import { TooltipComponent } from './tooltip';
import { ImageComponent } from './images';
import { LinksComponent } from './links';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

import { InfographComponent } from './infograph/infograph.component';
import { InlineLinksComponent } from './inline-links/inline-links.component';
import { InlineArticlesComponent } from './inline-articles/inline-articles.component';
import { ArticlesSingleComponent } from './articles-single/articles-single.component';
import { NewsletterOrderComponent } from './newsletter-order/newsletter-order.component';
import { LabelCountComponent } from './label-count/label-count.component';
import { PictoComponent } from './picto';
import { TableService } from '@app/_services/tableService';
import { AddressService } from '@app/_services/AddressService';
import { AppPipes } from '@app/_pipes';
import { RelatedStudyProgrammesListComponent } from './relatedStudyprogrammesList/relatedStudyProgrammesList.component';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { RelatedEventsComponent } from './relatedEvents';
import { NotFoundComponent } from './notFound';
import { SessionExpirationComponent } from './sessionExpiration';
import { MoreBlockComponent } from './more.block/more.block.component';
import { A11yModule } from '@angular/cdk/a11y';
import { ToggletipComponent } from './toggleTip/toggleTip.component';
import { TagComponent } from './tag/tag.component';
import { CertificateDetailedComponent } from '@app/modules/certificates/components/certificate-detailed/certificate-detailed.component';
import { CarouselComponent } from './carousel/carousel.component';
import { CertificateComponent } from '@app/modules/certificates/components/certificate/certificate.component';
import { CertificatesComponent } from '@app/modules/certificates/components/certificates/certificates.component';
import { CertificateDocumentCheckComponent } from '@app/modules/certificates/components/certificate-document-check/certificate-document-check.component';
import { CertificateFinalDocumentsComponent } from '@app/modules/certificates/components/certificate-final-documents/certificate-final-documents.component';
import { CertificateGradeSheetComponent } from '@app/modules/certificates/components/certificate-grade-sheet/certificate-grade-sheet.component';
import { BaseLayoutModule } from './base-layout/base-layout.module';
import { IconModule } from './icon/icon.module';
import { BreadcrumbsModule } from './breadcrumbs/breadcrumbs.module';
import { MaxWidthWrapperComponent } from './max-width-wrapper/max-width-wrapper.component';
import { TextTruncateTogglerComponent } from './text-truncate-toggler/text-truncate-toggler.component';
import { SkipToContentComponent } from './skip-to-content';
import { DropdownMenuComponent } from '@app/_assets/header/dropdown-menu/dropdown-menu.component';
import { getLangCode } from '@app/_core/router-utility';
import { HTMSwiperModule } from '@app/modules/swiper/swiper.module';
import { OlMapModule } from '@app/modules/olmap/olmap.module';

export function settingsProviderFactory(provider: SettingsService) {
	return () => provider.load();
}

const pipes = [];

const certificatesModuleDeclarations = [
	CertificatesComponent,
	CertificateDetailedComponent,
	CertificateComponent,
	CertificateFinalDocumentsComponent,
	CertificateDocumentCheckComponent,
	CertificateGradeSheetComponent,
];

const declarations = [
	ToggletipComponent,
	BlockComponent,
	BlockContentComponent,
	BlockTitleComponent,
	BlockSecondaryTitleComponent,
	BlockSecondaryTitleSubtextComponent,
	BlockTabsComponent,
	ButtonComponent,
	CarouselComponent,
	LoaderComponent,
	SkeletonComponent,
	AccordionComponent,
	AccordionItemComponent,
	TableComponent,
	SchoolTable,
	StudyProgrammeTable,
	AlertsComponent,
	VideoComponent,
	FeedbackComponent,
	ScrollableContentComponent,
	MenuComponent,
	MenuItemComponent,
	HeaderComponent,
	FormItemComponent,
	RippleDirective,
	FiltersDirective,
	ScrollToDirective,
	RotateTableDirective,
	CornerLogoDirective,
	ModalComponent,
	ModalContentComponent,
	MainProfessionsComponent,
	ArticleLayout,
	SidebarComponent,
	SidebarLinksComponent,
	SidebarCategoriesComponent,
	SidebarContactComponent,
	SidebarArticlesComponent,
	SidebarDataComponent,
	SidebarActionsComponent,
	SidebarFactsComponent,
	SidebarLocationComponent,
	SidebarProgressComponent,
	SidebarRegisterComponent,
	SidebarEventsComponent,
	SidebarNotificationsComponent,
	SidebarGdprComponent,
	SidebarFinalDocumentAccessComponent,
	SidebarFinalDocumentDownloadComponent,
	SidebarFinalDocumentHistoryComponent,
	SidebarDownloadFileComponent,
	StudyProgrammesComponent,
	SchoolsComponent,
	ProgressBarComponent,
	MapComponent,
	ShareComponent,
	LabelsComponent,
	FavouriteComponent,
	LabeledSeparatorComponent,
	ChartComponent,
	InfographComponent,
	ListItemComponent,
	SearchResultsComponent,
	NewsComponent,
	AutocompleteComponent,
	CompareComponent,
	ImageComponent,
	LinksComponent,
	// HomeSearchListViewComponent,
	DropdownListComponent,
	// frontpage stuff, delete after remake
	Triangles,
	Circles,
	InlineLinksComponent,
	InlineArticlesComponent,
	ArticlesSingleComponent,
	NewsletterOrderComponent,
	//
	PictoComponent,
	BlockSubTitleComponent,
	RelatedStudyProgrammesListComponent,
	RelatedEventsComponent,
	AnalyticsEvent,
	NotFoundComponent,
	SessionExpirationComponent,
	MoreBlockComponent,
	TooltipComponent,
	LabelCountComponent,
	TagComponent,
	SkipToContentComponent,
	MaxWidthWrapperComponent,
	...certificatesModuleDeclarations,
	TextTruncateTogglerComponent,
	DropdownMenuComponent,
	LazyImgDirective,
];

const exports = [
	NgbTooltipModule,
	BaseLayoutModule,
	IconModule,
	BreadcrumbsModule,
	HTMSwiperModule,
];

const providers = [
	RippleService,
	{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
	ModalService,
	SidemenuService,
	SidebarService,
	ClipboardService,
	TableService,
	AddressService,
	SettingsService,
	UploadService,
	AuthService,
	QueryParamsService,
	ScrollRestorationService,
	AnalyticsService,
	TitleCasePipe,
	{
		provide: RECAPTCHA_LANGUAGE,
		useValue: getLangCode(),
	},
	{
		provide: APP_INITIALIZER,
		useFactory: settingsProviderFactory,
		deps: [SettingsService],
		multi: true,
	},
];

const imports = [
	OlMapModule,
	CommonModule,
	RouterModule,
	TranslateModule,
	FormsModule,
	AppPipes,
	NgbDatepickerModule,
	NgPipesModule,
	NgSelectModule,
	NgbTooltipModule,
	RecaptchaModule,
	RecaptchaFormsModule,
	Ng2GoogleChartsModule,
	HttpClientJsonpModule,
	HttpClientModule,
	ReactiveFormsModule,
	A11yModule,
	BaseLayoutModule,
	IconModule,
	BreadcrumbsModule,
	HTMSwiperModule,
];

@NgModule({
	imports,
	declarations: [...declarations],
	exports: [...declarations, ...exports],
})
export class AssetsModule {
	static forRoot(): ModuleWithProviders<AssetsModule> {
		return {
			providers,
			ngModule: AssetsModule,
		};
	}
}
