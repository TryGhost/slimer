'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');
const mkdirp = require('mkdirp');

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
    },
    public: {
        type: Boolean,
        required: false,
        desc: 'Is the project public?'
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
            },
            {
                type: 'confirm',
                name: 'public',
                message: `Is your project public?`,
                when: _.isNil(this.props.public),
                default: true
            }
        ];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }

    _configureDestination() {
        // Set destination root that will be used by Yeoman from here on
        this.destinationRoot(this.props.path);
        // Ensure that path exists
        mkdirp(this.destinationRoot());

        this.log('Created new folder', this.destinationRoot());
    }

    // Add .editorconfig file, except if this project is a mono repo package.
    _configureEditorConfig() {
        if (this.props.type !== 'pkg') {
            this.fs.copy(
                this.templatePath('.editorconfig'),
                this.destinationPath('.editorconfig')
            );
        }
    }

    // Configuring is for creating "config" files
    configuring() {
        // First, ensure we have the correct destination for all of our files
        this._configureDestination();

        // Next, add our default .editorconfig file
        this._configureEditorConfig();
    }
};
