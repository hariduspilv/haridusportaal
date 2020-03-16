import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocumentCheckViewComponent } from "./documentCheckView.component";
import { Routes, RouterModule } from "@angular/router";
import { AssetsModule } from "@app/_assets";
import { TranslateModule } from "@app/_modules/translate";
import { ReactiveFormsModule } from "@angular/forms";
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { AppPipes } from "@app/_pipes";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';

const routes: Routes = [
	{
		path: "",
		component: DocumentCheckViewComponent
	}
];

@NgModule({
	declarations: [DocumentCheckViewComponent],
	imports: [
		RouterModule.forChild(routes),
		AssetsModule,
		CommonModule,
		TranslateModule,
		ReactiveFormsModule,
		RecaptchaFormsModule,
		RecaptchaModule,
		AppPipes
	],
	providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true },
  ],
	bootstrap: []
})
export class DocumentCheckViewModule {}
