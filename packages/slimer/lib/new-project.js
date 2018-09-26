// These lines give us access to Yeoman
// They should probably live elsewhere
const yoEnv = require('yeoman-environment');
const env = yoEnv.createEnv();
const debug = require('debug')('slimer');
const _ = require('lodash');

const findSlimer = (callback) => {
    debug('looking');
    env.lookup(() => {   
        debug('found', env.namespaces());     
    
        return callback(env.get('@tryghost/slimer'));
    });
};

const loadSlimer = (argv, callback) => {
    findSlimer((Slimer) => {
        let help = env.instantiate(Slimer, {options: {help: true}});        
        let argKeys = _.map(help._arguments, 'name');
        let optKeys = _.map(help._options, 'name');

        let args = _(argv).pick(argKeys).values().value();
        let options = _(argv).pick(optKeys).value();
        let obj = {args, options};

        debug('init with', obj);

        callback(env.create(Slimer.namespace, obj));
    });    
};

module.exports = (argv) => {
    debug('new project', argv);

    loadSlimer(argv, (slimer) => {     
        debug('loaded');                   
        slimer.run();
    });
};