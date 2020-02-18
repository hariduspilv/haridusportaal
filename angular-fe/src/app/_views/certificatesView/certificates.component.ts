import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss'],
})
export class CertificatesView implements OnInit {

  constructor(
    private location: Location,
  ) { }

  public path = decodeURI(this.location.path());

  ngOnInit() {
    console.log(this.path);
  }

}
