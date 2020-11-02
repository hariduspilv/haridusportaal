import { create } from '@storybook/theming/create';

export default create({
  base: 'light',

  colorPrimary: '#2e3374',
  colorSecondary: '#2e3374',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: 'grey',
  appBorderRadius: 4,

  // Toolbar default and active colors
  barTextColor: '#ffffff',
  barSelectedColor: '#fd8208',
  barBg: '#2e3374',

  brandTitle: 'Haridusportaal',
  brandUrl: 'https://edu.twn.ee/',
  brandImage: 'https://edu.twn.ee/assets/img/logo_dark.svg',
});
