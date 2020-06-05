'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');
const {policies, defaultPolicy} = require('../../lib/node-policies');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
    },
    public: {
        type: Boolean,
        desc: 'Is the project public?'
    },
    supportPolicy: {
        type: String,
        desc: 'The node support policy used for node versions'
    }
};

// These are arguments that are passed directly
const knownArguments = {};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    _readRenovateSupportPolicy() {
        let renovate = this.fs.readJSON('renovate.json');
        if (renovate && _.get(renovate, 'node.supportPolicy[0]')) {
            this.props.supportPolicy = this.props.supportPolicy || _.get(renovate, 'node.supportPolicy[0]');
        }
    }

    initializing() {
        super.initializing();

        this._readRenovateSupportPolicy();
    }

    // Configuring is for creating "config" files
    configuring() {
        const nodeVersions = policies[this.props.supportPolicy || defaultPolicy];

        // Add test.yaml file, unless if this project is a mono repo package
        if (this.props.type === 'pkg') {
            this.log('Skipping test.yml creation for subpackage');
            return;
        }

        this.fs.copyTpl(
            this.templatePath('test.yml'),
            this.destinationPath('.github/workflows/test.yml'),
            {
                nodeVersions,
                type: this.props.type
            }
        );
    }
};
