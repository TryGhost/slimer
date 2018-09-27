'use strict';
const Generator = require('../../lib/Generator');
const mkdirp = require('mkdirp');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
    },
    path: {
        type: String,
        required: false,
        desc: 'Where to create the new project'
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
        let name = this.props.name;

        // Set the path, to either the passed path + name, or just name
        this.props.path = this.props.path ?
            this.destinationPath(this.props.path, name) :
            this.destinationPath(name);

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

    // Configuring is for creating "config" files
    configuring() {
        // First, set destination root for all yeoman work, and ensure the path exists
        this.destinationRoot(this.props.path);
        mkdirp(this.destinationRoot());

        this.log('Created new folder', this.destinationRoot());
    }
};
