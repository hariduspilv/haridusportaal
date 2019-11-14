import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { TranslateService } from '@app/_modules/translate/translate.service';
@Component({
  selector: 'certificates-detail',
  templateUrl: 'certificatesDetailView.template.html',
  styleUrls: ['certificatesDetailView.styles.scss'],
})
export class CertificatesDetailView implements OnInit {

  public data: any;
  public type: any;
  public breadcrumbs = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Minu töölaud',
      link: '/töölaud/taotlused',
    },
    {
      title: 'Tunnistused',
      link: '/töölaud/tunnistused',
    },
    {
      title: '',
    },
  ];
  constructor(
    public router: Router,
    public location: Location,
    public translate: TranslateService,
  ) {}
  ngOnInit() {
    if (!window.history.state.data) {
      this.router.navigateByUrl('/töölaud');
    }
    this.data = window.history.state.data;
    this.type = window.history.state.type;
    const currentRoute = decodeURI(this.location.path()).split('/')[3];
    this.breadcrumbs[this.breadcrumbs.length - 1].title
      = currentRoute[0].toUpperCase() + currentRoute.slice(1);
  }

  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type;
    }
    console.log(type);
    console.log(translation);
    return translation;
  }

}
