import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

export class SettingsService {

  login = "/api/v1/token?_format=json";

  url = "";

  urlTemplates = {
    "localhost": "http://test-htm.wiseman.ee:30000",
    "htm.twn.ee": "http://test-htm.wiseman.ee:30000",
    "edu.ee": "https://api.hp.edu.ee",
    "www.edu.ee": "https://api.hp.edu.ee",
    "10.0.2.2": "https://htm.wiseman.ee",
    "192.168.1.5": "https://htm.wiseman.ee", //Virtualbox local IP
    "test.edu.ee": "https://apitest.hp.edu.ee",
    "otherwise": "https://api.hp.edu.ee"
  }

  error: boolean = false;
  
  data: any;
  
  requests = {
    "getBreadcrumbs": "57f49f8c29ee9cd9a7c9c63deefcede45fde9ef9:1",
    "googleChartData": "f0fee643583ce2e9374da0e53a030c62daad2263:1",
    "eventList": "1a6fb75f663b1f6171a768028e20d63babb94097:1",
    "customFavorites": "94f2a6ba49b930f284a00e4900e831724fd4bc91:1",
    "newsletterTags": "87257f778914b18b69ad43bcb1c246e2edee02c1:1",
    "recentNews": "02772fa14a0888ba796a22398f91d384777290fa:1",
    "getRelatedEvents": "589e6ae883a7cb54f4bf5e9c7f9046decfa54196:1",
    "similarStudyProgrammes": "a723295e59d15fedb8ccadf3b0a2ac3fadddcecb:1",
    "relatedStudyProgrammeList": "37599424458ff4e1265aa9ce40f6232d54fe0422:1",
    "getMenu": "2d7801aef671efb00f389dc444b1cd51a8b39b71:1",
    "getArticle": "3c358a042fc11d4708393c6e508b542947293c01:1",
    "getEventSingle": "8d7169386af75107bce43190b02559ca7a2e06f3:1",
    "getEventList": "555a15e87a9d4ba63ee24ed6224ed41674f2dc45:1",
    "eventType": "59d9b7ca4412d95df15b0f36c94c9b08e935507c:1",
    "getEventTags": "674ddfb46da45fee73289f9f4eb6379aa347945f:1",
    "frontPageEvents": "8ce3b383b8846ecc8b100748f331e47d84683aa5:1",
    "frontPageQuery": "c5f254677df76920cdc966cd190d1ee378613f92:1",
    "newsSingle": "948aa7e7f80ba87b6634d1e6834dd560ac2591ba:1",
    "newsTags": "ad43128fc10766aa8d60c341adc70dd6f456b654:1",
    "newsList": "6a48969d2450d8d77f7b3ae8c4c72a893d2bf3a9:1",
    "oskaFieldDetailView": "be029a22992c7d2d5f65a6c270f5db98c3abaf4a:1",
    "oskaMainProfessionDetailView": "d99f63d6a0229caef0b557ab4b3854be3236e634:1",
    "oskaSurveyPageDetailView": "c90143a08503ff84dbb9377214455e1e8e47d945:1",
    "oskaMainProfessionListView": "e710be5e6f2c611c82230686e16f28c42637d2f6:1",
    "oskaMainProfessionListViewFilter": "f7d1aaaec8b6c8119313669959e2455e7e2423c6:1",
    "oskaResultPageDetailView": "1ef9aa98714acd10656cec197329ad7a012f672a:1",
    "oskaResultPageTable": "876ab0283370267b229f06bbc600ed7f1dda9043:1",
    "oskaFieldListView": "22a08139aac421effe05769ce983ff940de0d59d:1",
    "preview": "b79fe7e1dd2aa13e251ac8f5d58d3cbce74af700:1",
    "subsidyProjectFilters": "d682dd31fe64a0ed62a45662a93cb8bb5b690f9e:1",
    "subsidyProjectQueryLocation": "b51cfec3027aaf28dc7eea4964406f0e1f5d14d4:1",
    "subsidyProjectQuerySchool": "52ce35003bef1ec38ec0fee1552e1a0f8bcc4b0b:1",
    "getSchoolSingle": "f71d2bb7d014d18e03d6e5c74257eede72fbdd58:1",
    "getSchoolInstitutions": "ce9950247e2ca382b581c5615822630bcecee3c1:1",
    "schoolMapQuery": "55b4b11c2556abc3e768654a05459b6e0c457fb5:1",
    "getSchoolFilterOptions": "5fc71ac22d59b52d304f9938adf3c611241b7f7c:1",
    "homeSearch": "580bbb859e1510a09dd3d7da5d2d41db9332fb4a:1",
    "studyProgrammeComparison": "c91043ae1543bf076c76072acf8437086fc9f421:1",
    "studyProgrammeSingle": "7d6785f86b803917820fb2050a5cf69af34be422:1",
    "studyProgrammeFilterOptions": "ca7e38bee7b0753e73a6813ba3ae20c9cce804fd:1",
    "studyProgrammeList": "c81156975e42fdbbaf0142bc9cac2f42f982c76b:1",
    "testAutocomplete": "27813a87b01c759d984808a9e9ea0333627ad584:1"
  };

  constructor(
    @Inject(DOCUMENT) private document,
    private http: HttpClient  
  ) {

    if( this.urlTemplates[document.domain] ) {
      this.url = this.urlTemplates[document.domain];
    }else{
      this.url = this.urlTemplates.otherwise;
    }
  }

  get( key:string = '' ) {
		if( !this.data ){
			return undefined;
		}
		return this.data[key] || undefined;
	}

	load() {
		return new Promise((resolve, reject) => {
			this.http.get(this.url+'/variables?_format=json&lang=et').subscribe(response => {
				this.data = response;
				resolve(true);
			}, () => {
				this.error = true;
				resolve(true);
			});
		})
	}

}