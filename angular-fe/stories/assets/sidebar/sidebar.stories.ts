import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import sidebarMd from './sidebar.md';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './sidebar.data';

const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Sidebar', () => {
  return {
    moduleMetadata,
    props: {
      data,
    },
    template: `
      <sidebar>
        <sidebar-element *ngFor="let elem of data" [theme]="elem.theme" [title]="elem.title">
          <sidebar-element-content>
            <ng-container *ngIf="elem.fields">
              <ul class="list">
                <li *ngFor="let item of elem.fields">
                  <a class="list__elem--links" [href]="item.entityUrl.path">
                    <icon *ngIf="!item.entityUrl.routed" size="medium" glyph="external-link"></icon>
                    <icon *ngIf="item.entityUrl.routed" size="medium" glyph="link-2"></icon>
                    <div>{{ item.entityLabel }}</div>
                  </a>
                </li>
              </ul>
            </ng-container>

            <ng-container *ngIf="elem.entities">
              <ul class="list">
                <ng-container *ngIf="elem.entities.fieldPros && elem.entities.fieldPros.length">
                  <li class="list__elem--pairs pro" [class.last]="last"
                    *ngFor="let item of elem.entities.fieldPros; let last = last">
                    <icon size="medium" bg="true" glyph="arrow-up"></icon>
                    <div role="text" attr.aria-label="{{'sidebar.pro' | translate}} {{ item }}">
                      {{ item }}
                    </div>
                  </li>
                </ng-container>
                <ng-container *ngIf="elem.entities.fieldNeutral
                  && elem.entities.fieldNeutral.length">
                  <li class="list__elem--pairs neutral" [class.last]="last"
                    *ngFor="let item of elem.entities.fieldNeutral; let last = last">
                    <icon size="medium" bg="true" glyph="minimize-2"></icon>
                    <div role="text" attr.aria-label="{{'sidebar.neutral' | translate}} {{ item }}">
                      {{ item }}
                    </div>
                  </li>
                </ng-container>
                <ng-container *ngIf="elem.entities.fieldCons && elem.entities.fieldCons.length">
                  <li class="list__elem--pairs con" [class.final]="last"
                    *ngFor="let item of elem.entities.fieldCons; let last = last">
                    <icon size="medium" bg="true" glyph="arrow-down"></icon>
                    <div role="text" attr.aria-label="{{'sidebar.con' | translate}} {{ item }}">
                      {{ item }}
                    </div>
                  </li>
                </ng-container>
              </ul>
            </ng-container>
          </sidebar-element-content>
        </sidebar-element>
      </sidebar>
    `,
  };
},          {
  notes: { markdown: sidebarMd },
});
