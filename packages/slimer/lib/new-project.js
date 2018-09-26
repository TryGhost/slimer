// These lines give us access to Yeoman
// They should probably live elsewhere
const yoEnv = require('yeoman-environment');
const env = yoEnv.createEnv();
const debug = require('debug')('slimer');

module.exports = (...args) => {
    debug('new project', ...args);
    debug('Will look for generators in', env.getNpmPaths());
    debug('Current path', __dirname);

    env.lookup(() => {
        debug('loaded', env.getGeneratorsMeta());
        const slimer = env.create('slimer', {options: {help: true}});
        slimer.run();
    });
};