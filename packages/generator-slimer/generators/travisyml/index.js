'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');

// @TODO: share this somewhere?
const policies = {
    lts: [6, 8, 10],
    active: [8, 10, 11],
    current: [11],
    lts_active: [8, 10],
    lts_latest: [10]
};

const defaultPolicy = 'lts';

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

        // Add .travis.yaml file, unless if this project is a mono repo package or is not public
        if (this.props.type === 'pkg') {
            this.log('Skipping .travis.yml creation for subpackage');
            return;
        }

        if (!this.props.public) {
            this.log('Skipping .travis.yml creation for private repo');
        }

        this.fs.copyTpl(
            this.templatePath('.travis.yml'),
            this.destinationPath('.travis.yml'),
            {
                nodeVersions,
                type: this.props.type
            }
        );
    }
};
