'use strict';
const Generator = require('../../lib/Generator');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        default: 'module',
        desc: 'What kind of project to create: [module, app, pkg, mono]'
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
        // Add .editorconfig file, except if this project is a mono repo package.
        if (this.props.type !== 'pkg') {
            this.fs.copy(
                this.templatePath('.editorconfig'),
                this.destinationPath('.editorconfig')
            );
        }
    }
};
