import { configure, addDecorator, addParameters } from '@storybook/angular';

const newViewports = {
  'Full Size': {
    name: 'Full size',
    styles: {
      width: '100%',
      height: '100%',
    }
  },
  '1680px': {
    name: '1680px',
    styles: {
      width: '1680px',
      height: '100%',
    }
  },
  '1280px': {
    name: '1280px',
    styles: {
      width: '1280px',
      height: '100%',
    }
  },
  '640px': {
    name: '640px',
    styles: {
      width: '640px',
      height: '100%',
    }
  },
};

addParameters(
  {
    viewport: { viewports: newViewports },
    options: {
      panelPosition: 'right',
      showPanel: true,
    }
  }
);

const req = require.context('../stories', true, /\.stories\.ts$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);