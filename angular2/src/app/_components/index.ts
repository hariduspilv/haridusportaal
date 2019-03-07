import { HeaderModule } from './header/header.module';
import { RelatedEventsModule } from './related.events/related.events.module';
import { RecentNewsModule } from './recent.news/recent.news.module';
import { OskaAreasSidebarModule } from './oska.areas.sidebar/oska.areas.sidebar.module';
import { NewsletterOrderModule } from './newsletter.order/newsletter.order.module';
import { ProgressBarModule } from '@app/_components/progress.bar/progress.bar.module';
import { LabeledSeparatorModule } from '@app/_components/labeled.separator/labeled.separator.module';


export const AppModules = [
  HeaderModule,
  RelatedEventsModule,
  RecentNewsModule,
  NewsletterOrderModule,
  OskaAreasSidebarModule,
  ProgressBarModule,
  LabeledSeparatorModule
];
