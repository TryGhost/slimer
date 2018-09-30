'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const TYPES = ['app', 'module', 'pkg', 'mono'];

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
    org: {
        type: String,
        default: 'TryGhost',
        desc: 'GitHub Organisation'
    },
    scope: {
        type: String,
        default: '',
        desc: 'NPM Scope name'
    },
    path: {
        type: String,
        desc: 'Where to create the new project',
        hidden: true
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

        this._initNaming(name);

        this.log('Initialized');
        this.log(this.props);
    }

    // What gets passed to us is just the folder name
    _initNaming(name) {
        // First, sort our the GitHub org and the npm scope
        if (this.props.org.match(/nexes/i)) {
            this.props.org = 'NexesJS';
            this.props.scope = this.props.scope || '@nexes/';
        }
        // @TODO get pkg scope

        // Next, determine names...

        // # Naming conventions.
        // by default, we expect to start with props.name (folder name) being either in kebabcase that we want to keep
        // E.g. mg-medium-export
        // Or something capitalised, e.g. Ghost

        // Repo name rules - it should be the same as the folder name
        this.props.repoName = this.props.repoName || name;
        // npm name rule, we try to add a scope, else use the base name, in kebabCase
        this.props.npmName = `${this.props.scope}${this.props.npmName || _.kebabCase(name)}`;
        // Project name, should be Properly Capitalised For the README! If it starts with mg-, convert to Migrate
        this.props.projectName = this.props.projectName || _.startCase(name.replace(/^mg-/, 'Migrate '));
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
                when: () => !this.props.type || !_.includes(TYPES, this.props.type)
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

    default() {
        // Public projects require an MIT license
        if (this.props.public) {
            this.composeWith(require.resolve('../license'), this.props);
        }
    }
};
