import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import { OlMapComponent } from '../ol-map/ol-map.component';

@Component({
  selector: 'ol-overlay',
  templateUrl: './ol-overlay.component.html',
  styleUrls: ['./ol-overlay.component.scss'],
})
export class OlOverlayComponent
  implements OnChanges, AfterContentInit, OnDestroy, AfterViewInit
{
  @ViewChild('mapTooltipContainer') private tooltip: ElementRef<HTMLDivElement>;
  @ContentChild(TemplateRef) contentTemplate?: TemplateRef<any>;

  @Input() isOpen?: boolean;
  @Input() latitude?: number;
  @Input() longitude?: number;
  @Input() template?: TemplateRef<any>;
  @Input() feature?: any;
  @Input() manager?: OlMapComponent;
  @Input() offset?: [number, number] = [0, 0];
  @Output() isOpenChange = new EventEmitter<boolean>();

  public overlay!: Overlay;
  public coordinate?: Coordinate;

  constructor(@Optional() @Host() public parentManager: OlMapComponent) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.isOpen ||
      changes.latitude ||
      changes.longitude ||
      changes.offset
    ) {
      this.changeInfoWindow();
    }
  }

  ngAfterContentInit(): void {
    if (this.isOpen) this.changeInfoWindow();
  }

  ngAfterViewInit(): void {
    this.initOverlay();
  }

  ngOnDestroy(): void {
    this.overlay && this.activeManager?.map.removeOverlay(this.overlay);
  }

  showOverlay() {
    if (!this.overlay) return;
    this.isOpenChange.emit(true);
    // Wait for Angular to render the template so that autopan works
    setTimeout(() => {
      this.overlay?.setOffset(this.offset);
      this.overlay?.setPosition(this.coordinate);
    });
  }

  hideOverlay() {
    this.isOpen = false;
    this.feature = undefined;
    this.isOpenChange.emit(false);
    this.overlay?.setPosition(undefined);
  }

  get inUseTemplate() {
    return this.template || this.contentTemplate;
  }

  get activeManager() {
    return this.parentManager || this.manager;
  }

  private changeInfoWindow() {
    if (isNaN(this.latitude) || isNaN(this.longitude)) return;
    // Get projected coordinate from inputs
    this.coordinate = fromLonLat([this.longitude, this.latitude], 'EPSG:3301');

    if (!!this.isOpen) {
      if (!this.template && !this.contentTemplate) return;
      this.showOverlay();
    } else {
      this.hideOverlay();
    }
  }

  private initOverlay() {
    this.overlay = new Overlay({
      element: this.tooltip.nativeElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      positioning: 'bottom-center',
    });

    this.activeManager.map.addOverlay(this.overlay);

    if (this.isOpen) {
      this.showOverlay();
    }
  }

  public boundCloseButton = this.hideOverlay.bind(this);
}
