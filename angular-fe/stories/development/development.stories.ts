import { storiesOf } from '@storybook/angular';
import developmentHtml from './development.html';

const stories = storiesOf('Development', module);
stories.add('Installation', () => {
  return {
    template: developmentHtml,
  };
});
