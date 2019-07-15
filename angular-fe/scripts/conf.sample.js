const path = require('path');

module.exports.app =  {
  name: 'App',
  ftp: {
    user: "user",
    password: "pass",
    host: "host",
    port: 21,
    localRoot: path.resolve(__dirname, '../storybook-dist'),
    remoteRoot: '/storybook',
    include: ['*', '**/*'],
    deleteRemote: true,
    forcePasv: true     
  }   
}

module.exports.storybook =  {
  name: 'Storybook',
  ftp: {
    user: "user",
    password: "pass",
    host: "host",
    port: 21,
    localRoot: path.resolve(__dirname, '../storybook-dist'),
    remoteRoot: '/storybook',
    include: ['*', '**/*'],
    deleteRemote: true,
    forcePasv: true    
  }    
}