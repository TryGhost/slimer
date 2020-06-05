'use strict';
const Generator = require('../../lib/Generator');
const {nodeEngines} = require('../../lib/node-policies');

const knownOptions = {};
const knownArguments = {};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    configuring() {
        let destination = this.fs.readJSON(this.destinationPath('package.json'));

        if (!destination) {
            this.log('package.json seems to be missing');
            return;
        }

        if (!destination.engines) {
            destination.engines = {};
        }

        destination.engines.node = nodeEngines;
        this.fs.writeJSON(this.destinationPath('package.json'), destination);
    }
};
