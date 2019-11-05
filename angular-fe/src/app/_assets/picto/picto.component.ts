import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'picto',
  templateUrl: './picto.template.html',
  styleUrls: ['./picto.styles.scss'],
})

export class PictoComponent implements OnInit {
  @Input() img: string;

  private totalPictos: number = 3;
  public pictoNumber: number;
  public description: string;

  public pictoDesigns = [
    {
      circles: [
        {
          right: -6.5,
          top: 1.5,
          size: 4,
          z: 3,
          color: '#ffe7c1',
        },
        {
          right: -8,
          top: 3,
          size: 3,
          z: 4,
          color: '#9dd6e4',
        },
      ],
      triangles: [],
    },
    {
      circles: [
        {
          right: -5.5,
          top: 3,
          size: 3,
          z: 3,
          color: '#ffe7c1',
        },
        {
          right: -8,
          top: 1,
          size: 2.5,
          z: 4,
          color: '#9dd6e4',
        },
        {
          right: -8.2,
          top: 4.5,
          size: 2,
          z: 3,
          color: '#E7D6D8',
        },
      ],
      triangles: [],
    },
    {
      circles: [
        {
          right: -8.5,
          top: 2.5,
          size: 4,
          z: 4,
          color: '#ffe7c1',
        },
        {
          right: -6,
          top: 2,
          size: 3,
          z: 3,
          color: '#9dd6e4',
        },
      ],
      triangles: [],
    },
  ];

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  ngOnInit() {
    this.pictoNumber = this.rand(0, this.totalPictos - 1);
  }
}