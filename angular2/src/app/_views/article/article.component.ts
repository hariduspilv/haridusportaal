import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { ArticleService, RootScopeService } from '../../_services';
import { getArticleData } from '../../_services/article/article.graph';


import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription'; 

import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';

@Component({
  templateUrl: './article.component.html'
})

export class ArticleComponent implements OnInit, OnDestroy{

  private querySubscription: Subscription;  
  private path: string;
  private lang: string;

  content: any;
  breadcrumb: any;
  error: boolean;
  
  accordionOpenState: boolean = false;
  accordionSection: any[];
  
  fieldRightSidebar: any;
  toggleRightSidebar: boolean = false;
  
  fieldAdditional: any;
  fieldAdditionalTitle: any;
  fieldAdditionalBody: any;
  
  fieldContactSection: any;
  fieldContactPerson: any;
  fieldContactPhone: any;
  fieldContactEmail: any;
  fieldContactOrganization: any;
  
  articleLinks: any[];
  relatedArticles: any[];
  
  constructor(private router: Router, private route: ActivatedRoute, private articleService: ArticleService, private rootScope: RootScopeService, private apollo: Apollo) {}
  
  ngOnInit() {

    this.route.params.subscribe (
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        this.querySubscription = this.apollo.watchQuery({
          query: getArticleData,
          variables: {
            path: this.path,
            lang: this.lang.toUpperCase(),
          },
        })
        .valueChanges
        .subscribe(({data, loading}) => {
          
          //language service
          const langOptions = data['route']['languageSwitchLinks'];
          let langValues = {};
          for( var i in langOptions ){
            langValues[langOptions[i].language.id] = langOptions[i].url.path;
          }
          this.rootScope.set('langOptions', langValues);
          //language service
          
          this.content = data['route']['entity'];
          this.breadcrumb = data['route']['breadcrumb'];
          this.accordionSection = data['route']['entity']['fieldAccordionSection'];
          this.fieldRightSidebar = data['route']['entity']['fieldRightSidebar'];
          
          if (this.fieldRightSidebar !== null) {
            
            this.toggleRightSidebar = true;
            this.fieldContactSection = data['route']['entity']['fieldRightSidebar']['entity']['fieldContactSection'];
            this.fieldAdditional = data['route']['entity']['fieldRightSidebar']['entity']['fieldAdditional'];
            this.articleLinks = data['route']['entity']['fieldRightSidebar']['entity']['fieldHyperlinks'];
            this.relatedArticles = data['route']['entity']['fieldRightSidebar']['entity']['fieldRelatedArticle'];        
            
            if(this.fieldAdditional !== null) {
              this.fieldAdditionalTitle = data['route']['entity']['fieldRightSidebar']['entity']['fieldAdditional']['entity']['fieldTitle'];
              this.fieldAdditionalBody = data['route']['entity']['fieldRightSidebar']['entity']['fieldAdditional']['entity']['fieldAdditionalBody']['value'];
            }
            
            if(this.fieldContactSection !== null) {
              this.fieldContactPerson = data['route']['entity']['fieldRightSidebar']['entity']['fieldContactSection']['entity']['fieldPerson'];
              this.fieldContactPhone = data['route']['entity']['fieldRightSidebar']['entity']['fieldContactSection']['entity']['fieldPhone'];
              this.fieldContactEmail = data['route']['entity']['fieldRightSidebar']['entity']['fieldContactSection']['entity']['fieldEmail'];
              this.fieldContactOrganization = data['route']['entity']['fieldRightSidebar']['entity']['fieldContactSection']['entity']['fieldOrganization'];
            }
          }
        });
      }
    )

  }
  
  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
  
}