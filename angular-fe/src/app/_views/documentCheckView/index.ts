import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocumentCheckComponent } from "./documentCheck.component";
import { Routes, RouterModule } from "@angular/router";
import { AssetsModule } from "@app/_assets";
import { TranslateModule } from "@app/_modules/translate";
import { ReactiveFormsModule } from "@angular/forms";
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { AppPipes } from "@app/_pipes";

const routes: Routes = [
	{
		path: "",
		component: DocumentCheckComponent
	}
];

@NgModule({
	declarations: [DocumentCheckComponent],
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
	providers: [],
	bootstrap: []
})
export class DocumentCheckViewModule {}
