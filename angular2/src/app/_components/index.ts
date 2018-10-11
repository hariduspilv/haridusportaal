import { HeaderModule } from './header/header.module';
import { SideMenuModule } from './sidemenu/sidemenu.module';
import { RelatedEventsModule } from './related.events/related.events.module';
import { RecentNewsModule } from './recent.news/recent.news.module';
import { OskaAreasSidebarModule } from './oska.areas.sidebar/oska.areas.sidebar.module';
import { NewsletterOrderModule } from './newsletter.order/newsletter.order.module';


export const AppModules = [
  HeaderModule,
  SideMenuModule,
  RelatedEventsModule,
  RecentNewsModule,
  NewsletterOrderModule,
  OskaAreasSidebarModule
];
