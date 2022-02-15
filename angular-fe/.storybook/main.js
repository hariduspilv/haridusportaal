module.exports = {
  stories: ['../stories/**/**/*.stories.ts'],
  addons: ['@storybook/addon-notes', '@storybook/addon-notes/register-panel'],
  framework: "@storybook/angular",
  core: {
    builder: "webpack5"
  }
};
