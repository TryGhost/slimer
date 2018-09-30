'use strict';
const Generator = require('yeoman-generator');
const _ = require('lodash');
const chalk = require('chalk');

/**
 * Custom Generator
 *
 * We setup some defaults to share between all of our Generators
 */

module.exports = class extends Generator {
    constructor(args, options, knownArguments, knownOptions) {
        super(args, options);

        this.knownArguments = knownArguments;
        this.knownOptions = knownOptions;

        try {
            // Initialise our options & arguments
            _.each(this.knownArguments, (value, key) => this.argument(key, value));
            _.each(this.knownOptions, (value, key) => this.option(key, value));
        } catch (err) {
            this.log(`${chalk.red('error')} Unable to continue: ${err.stack}`);
            process.exit(1);
        }
    }

    _initProps() {
        // Props is a store of config generated through options + prompting
        // We intialise it by grabbing the allowed values passed in as options & arguments
        this.props = _.pick(this.options, _.concat(_.keys(this.knownOptions),_.keys(this.knownArguments)));
    }

    // Initialize props by default
    initializing() {
        this._initProps();
    }

    _mergeAnswers(answers) {
        // Merge answers with existing props
        // To access props later use this.props.someAnswer;
        _.extend(this.props, answers);
    }
};
