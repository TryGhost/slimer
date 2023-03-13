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
class CliYo {
    constructor() {
        this.loaded = false;
    }

    loadEnv() {
        env.lookup();
        this.loaded = true;
    }

    findGenerator(name) {
        // @TODO: validation / error handling
        if (!this.loaded) {
            this.loadEnv();
        }

        return env.get(name);
    }

    initGeneratorHelp(Generator) {
        let help = env.instantiate(Generator, {options: {help: true}});
        return {
            args: help._arguments,
            options: help._options
        };
    }

    buildCallObj(Generator, argv) {
        let {args, options} = this.initGeneratorHelp(Generator);
        let argKeys = _.map(args, 'name');
        let optKeys = _.map(options, 'name');

        debug('provided with', argv);
        debug('looking for', argKeys, optKeys);

        return {
            args: _(argv).pick(argKeys).values().value(),
            options: _(argv).pick(optKeys).value()
        };
    }

    yoToSywac(name, cb) {
        const Generator = this.findGenerator(name);
        let {args, options} = this.initGeneratorHelp(Generator);
        const yoDefaults = ['help', 'skip-cache', 'skip-install'];

        const toSywac = (t) => {
            let tt = _.clone(t);
            tt.type = t.type.name.toLowerCase();
            tt.flags = `--${t.name}`;
            tt.defaultValue = t.default;
            return tt;
        };

        args = _.map(args, toSywac);

        options = _(options).filter((opt) => {
            return !_.includes(yoDefaults, opt.name);
        }).map(toSywac).value();

        cb(args, options);
    }

    callGenerator(name, argv, cb) {
        cb = cb || _.noop;
        argv = _(argv).omit(['_', 'h', 'help', 'v', 'version']).omitBy(_.isUndefined).value();

        const Generator = this.findGenerator(name);
        let obj = this.buildCallObj(Generator, argv);
        let generator = env.create(Generator.namespace, obj);

        debug('init with', obj);

        generator.run(() => {
            debug('return with', generator.props);
            return _.isFunction(cb) ? cb(generator.props) : generator.props;
        });
    }
}

module.exports = new CliYo();
