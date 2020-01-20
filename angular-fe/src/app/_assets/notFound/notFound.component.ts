import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@app/_services';

@Component({
  selector: 'notFound',
  templateUrl: 'notFound.template.html',
  styleUrls: ['notFound.styles.scss'],
})

export class NotFoundComponent implements OnInit {

  public redirectUrl: string;
  public loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private modalService: ModalService,
    private router: Router) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  ngOnInit() {
    if (this.redirectUrl) {
      document.getElementById('headerLogin').click();
      sessionStorage.setItem('redirectUrl', this.redirectUrl);
    } else {
      document.getElementById('toFront').focus();
    }
  }

  action() {
    if (this.redirectUrl) {
      this.modalService.open('login'); //document.getElementById('headerLogin').click();
      sessionStorage.setItem('redirectUrl', this.redirectUrl);
    } else {
      this.router.navigate(['/']);
    }
  }
}