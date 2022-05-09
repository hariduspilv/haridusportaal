import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ModalService } from '@app/_services';
import { getLangCode } from "@app/_core/router-utility";

@Component({
  selector: 'notFound',
  templateUrl: 'notFound.template.html',
  styleUrls: ['notFound.styles.scss'],
})
export class NotFoundComponent implements OnInit {

  public redirectUrl: string;
  public loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: ModalService,
    private router: Router,
	) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  ngOnInit() {
    setTimeout(() => {
			if (this.redirectUrl) {
				document.getElementById('headerLogin').click();
				sessionStorage.setItem('redirectUrl', this.redirectUrl);
			} else {
				document.getElementById('toFront').focus();
			}
		});

		this.router.events.subscribe({
			next: (event) => {
				if (event instanceof NavigationEnd) {
					this.loading = true;
					setTimeout(() => this.loading = false)
				}
			},
		});
  }

  action() {
    if (this.redirectUrl) {
      this.modalService.open('login'); // document.getElementById('headerLogin').click();
      sessionStorage.setItem('redirectUrl', this.redirectUrl);
    } else {
			getLangCode() === 'et' ? this.router.navigate(['/']) : this.router.navigate([`/${getLangCode()}`])
    }
  }
}
