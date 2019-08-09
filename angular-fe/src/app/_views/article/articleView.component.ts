import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment,
} from '@angular/router';

@Component({
  templateUrl: 'articleView.template.html',
})

export class ArticleViewComponent implements OnInit{
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }
  ngOnInit() {
    const urlTree: UrlTree = this.router.parseUrl(this.router.url);
    const urlGroups: UrlSegmentGroup = urlTree.root.children[PRIMARY_OUTLET];
    const urlSegments: UrlSegment[] = urlGroups.segments;
    const urlArray = urlSegments.map((item) => {
      return item.path;
    });
    console.log('Urli array koos lisa pasaga:', urlSegments);
    console.log('Urli array [string]:', urlArray);
  }
}
