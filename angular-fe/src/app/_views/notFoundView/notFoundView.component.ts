import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from '@app/_services';

@Component({
  selector: 'notFound-view',
  templateUrl: './notFoundView.template.html',
  styleUrls: ['./notFoundView.styles.scss'],
})
export class NotFoundViewComponent implements OnInit {

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
    } else {
      document.getElementById('toFront').focus();
    }
  }

  action() {
    if (this.redirectUrl) {
      this.modalService.open('login'); //document.getElementById('headerLogin').click();
    } else {
      this.router.navigate(['/']);
    }
  }
}
