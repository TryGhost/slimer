/**
 * CLI-YO
 *
 * A minimal wrapper between our CLI and Yeoman's
 */

const debug = require('debug')('slimer:cli-yo');
const _ = require('lodash');
// Get access to the yeoman environment
const yoEnv = require('yeoman-environment');
const env = yoEnv.createEnv();

const findGenerator = (name, cb) => {
    // @TODO: validation / error handling
    env.lookup(() => {
        debug('found', env.namespaces());
        return cb(env.get(name));
    });
};

const buildCallObj = (Generator, argv) => {
    let help = env.instantiate(Generator, {options: {help: true}});
    let argKeys = _.map(help._arguments, 'name');
    let optKeys = _.map(help._options, 'name');

    debug('provided with', argv);
    debug('looking for', argKeys, optKeys);

    let args = _(argv).pick(argKeys).values().value();
    let options = _(argv).pick(optKeys).value();

    return {args, options};
};

module.exports.callGenerator = (name, argv, cb) => {
    cb = cb || _.noop;
    argv = _(argv).omit(['_', 'h', 'help', 'v', 'version']).omitBy(_.isUndefined).value();

    return findGenerator(name, (Generator) => {
        let obj = buildCallObj(Generator, argv);

        debug('init with', obj);

        return env.create(Generator.namespace, obj).run(cb);
    });
};
