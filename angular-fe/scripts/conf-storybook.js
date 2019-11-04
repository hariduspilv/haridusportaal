const path = require('path');

module.exports =  {
  name: 'Storybook',
  path: 'https://htm.twn.ee/storybook',
  ftp: {
    user: "vhost52758f3",
    password: "erkki123",
    host: "www.twn.ee",
    port: 21,
    localRoot: path.resolve(__dirname, '../storybook-dist'),
    remoteRoot: '/storybook',
    include: ['*', '**/*'],
    deleteRemote: true,
    forcePasv: true    
  }    
}