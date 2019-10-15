import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService, ScrollRestorationService } from '@app/_services';
import { DomSanitizer } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  templateUrl: "oska.sectors.template.html",
  styleUrls: ["oska.sectors.styles.scss"]
})

export class OskaSectorsComponent implements OnInit {
  @ViewChild('content') content: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout( this.resizeDebounce );
    this.resizeDebounce = setTimeout( () => {
      this.calculateColsPerRow();
    }, 60);
  }
  
  private resizeDebounce;

  public data: any = false;
  public loading: boolean = false;
  public errMessage: any = false;
  public lang: string;
  public limit: number = 100;
  public offset: number = 0;
  private dataSub: Subscription;
  private modal:any = false;
  private colsPerRow = 4;
  private lastWidth = 0;
  public hasComparisonPage: boolean = false;
  public scrollPositionSet: boolean = false;
  public lastOpenedPosition: number = 0;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService,
    private sanitizer: DomSanitizer,
    private device: DeviceDetectorService,
    private scrollRestoration: ScrollRestorationService
  ) {}

  calculateColsPerRow() {
    let tmpValue;
    let winWidth = window.innerWidth;

    if( winWidth == this.lastWidth ){
      return false;
    }

    this.lastWidth = winWidth;

    if( winWidth > 1280 ){ tmpValue = 4; }
    else if( winWidth > 720 ){ tmpValue = 3; }
    else{ tmpValue = 2; }

    this.colsPerRow = tmpValue;

    if( this.modal ){
      let modalIndex = this.modal.index;
      this.modal.index = 9999;
      this.modalOpen( modalIndex );
    }

  }

  sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key].toLowerCase(); var y = b[key].toLowerCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  resetFocus($event, id){
    $event.preventDefault();
    $event.stopPropagation();
    const elem = document.getElementById(id);
    setTimeout( () => {
      if( this.modal ){
        elem.focus();
      }
    }, 60);
  }

  modalClose() {
    if( this.modal && this.device.isDesktop() ){
      let elem = document.getElementById('block_button_'+this.modal.index);
      elem.focus();
    }
    this.modal = false;
  }
  modalOpen(index){

    const header = document.querySelector('.header-toolbar');

    if( this.modal && this.modal.index == index ){
      this.modal = false;
      let elem = document.getElementById('block_'+index);

      setTimeout( () => {
        let top = elem.getBoundingClientRect().top + window.scrollY - header['offsetHeight'] - 24;

        if( !this.device.isDesktop() ){
          window.scrollTo({top:top});
        }else{
          window.scrollTo({behavior: 'smooth', top:top});
        }
      }, 0);

      if( !this.device.isDesktop() && !this.modal){
        elem.blur();
      }else if( this.device.isDesktop() ){
        document.getElementById('block_button_'+index).focus();
      }
      return false;
    }

    let position = (Math.ceil( (index+1)/this.colsPerRow)*this.colsPerRow)-1;

    if( position > this.data.length-1 ){
      position = this.data.length-1;
    }
    this.modal = this.data[index];
    this.modal.position = position;
    this.modal.index = index;

    if( this.modal.fieldOskaVideo ){
      this.modal.videoUrl = `${window.location.protocol}//www.youtube.com/embed/${this.modal.fieldOskaVideo.videoId}`;
    }

    try{
      let tmpList = this.modal.reverseFieldOskaFieldParagraph.entities.filter(item => item !== null).map( item => {
        return item.paragraphReference[0];
      });
      this.modal.list = this.sortByKey(tmpList, 'entityLabel');
    }catch(err){
    }

    let elem = document.querySelector('#block_'+index);

    setTimeout( () => {
      let top = elem.getBoundingClientRect().top + window.scrollY - header['offsetHeight'] - 24;
      if( !this.device.isDesktop() ){
        window.scrollTo({top:top});
        this.lastOpenedPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }else{
        window.scrollTo({behavior: 'smooth', top:top});
        document.getElementById("modal").focus();
      }
    }, 0);

  }

  changeView(url) {
    this.router.navigate([url]);
  }

  getData () {
    this.loading = true;
    this.errMessage = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    let variables = {
      lang: this.lang.toUpperCase(),
      offset: this.offset,
      limit: this.limit,
      nidEnabled: false
    };
    this.dataSub = this.http.get('oskaFieldListView', {params:variables}).subscribe((response: any) => {
      if (response['errors']) {
        this.loading = false;
        this.errMessage = true;
      }
      this.hasComparisonPage = response.data.comparisonPage.count;
      this.data = response['data']['nodeQuery']['entities'];
      this.loading = false;
      if (document.getElementById('heading')) {
        document.getElementById('heading').focus();
      }
    }, (err) => {
      this.errMessage = true
      this.loading = false;
    })
  }

  ngOnInit () {
    this.calculateColsPerRow();
    this.lang = this.rootScope.get("lang");
    this.getData();
  }

  ngOnDestroy () {
    if(this.modal && this.lastOpenedPosition) {
      this.scrollRestoration.setRouteKey('position', this.lastOpenedPosition);
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null) {
      this.scrollRestoration.setScroll();
      this.scrollPositionSet = true;
      this.rootScope.set('scrollRestorationState', false);
    }
  }
}
