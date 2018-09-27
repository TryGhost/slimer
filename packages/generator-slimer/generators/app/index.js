'use strict';
const Generator = require('../../lib/Generator');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
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
                type: 'list',
                name: 'type',
                message: 'Is this a standalone app or a module?',
                choices: ['app', 'module'],
                default: 'module',
                when: () => !this.props.type
            }
        ];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }
};
