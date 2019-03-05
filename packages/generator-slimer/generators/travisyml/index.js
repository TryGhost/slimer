'use strict';
const Generator = require('../../lib/Generator');

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
    }
};

// These are arguments that are passed directly
const knownArguments = {};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();
    }

    // Configuring is for creating "config" files
    configuring() {
        // @TODO: pull this from toolbox or from node
        let nodeVersions = ['10', '8', '6'];
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
                nodeVersions
            }
        );
    }
};
