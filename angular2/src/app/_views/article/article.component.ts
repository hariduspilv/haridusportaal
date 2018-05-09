import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { ArticleService, RootScopeService } from '../../_services';
import { getArticleData } from '../../_services/article/article.graph';


import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription'; 

import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { link } from 'fs';

@Component({
  templateUrl: './article.component.html'
})

export class ArticleComponent implements OnInit, OnDestroy{
  
  content: any;
  breadcrumb: any;
  error: boolean;
  
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
  
  constructor(private router: Router, private route: ActivatedRoute, private articleService: ArticleService, private rootScope:RootScopeService, private apollo: Apollo) {
    
    this.route.params.subscribe( params => {
      const path = this.router.url;      
      articleService.getArticle(path, function(data) {
        const langOptions = data['route']['languageSwitchLinks'];
        let langValues = {};
        for( var i in langOptions ){
          langValues[langOptions[i].language.id] = langOptions[i].url.path;
        }
        rootScope.set('langOptions', langValues);
      });
    });
  }
  
  private querySubscription: Subscription;
  
  ngOnInit() {
    const path = this.router.url;
    const lang = this.rootScope.get("currentLang");   
      
    this.querySubscription = this.apollo.watchQuery({
      query: getArticleData,
      variables: {
        path: path,
        lang: lang.toUpperCase(),
      },
    })
    .valueChanges.subscribe(({data, loading}) => {
      this.content = data['route']['entity'];
      this.breadcrumb = data['route']['breadcrumb'];
      
      this.fieldRightSidebar = data['route']['entity']['fieldRightSidebar']
      
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
      // console.log(data['route']['languageSwitchLinks'])
    });
  }
  
  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
  
}