'use strict';
const Generator = require('../../lib/Generator');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        default: 'module',
        desc: 'What kind of project to create: [module, app, mono, pkg]'
    }
};

// These are arguments that are passed directly
const knownArguments = {
    name: {
        type: String,
        required: true,
        desc: 'Project name'
    }
};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();

        this.log('Initialized');
        this.log(this.props);
    }

    prompting() {
        this.log(`Welcome!`);

        const prompts = [
            {
                type: 'confirm',
                name: 'someAnswer',
                message: 'Would you like to enable this option?',
                default: true
            }
        ];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }
};
