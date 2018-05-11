import { HeaderModule } from './header/header.module';
import { SideMenuModule } from './sidemenu/sidemenu.module';
import { RelatedEventsModule } from './related.events/related.events.module';
import { RecentEventsModule } from './recent.events/recent.events.module';
import { RecentNewsModule } from './recent.news/recent.news.module';

export const AppModules = [
  HeaderModule,
  SideMenuModule,
  RelatedEventsModule,
  RecentNewsModule,
  RecentEventsModule
];
