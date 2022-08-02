'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const TYPES = ['app', 'module', 'pkg', 'mono'];

// These are the options that can be passed in as flags e.g. --foo=bar
const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
    },
    desc: {
        type: String,
        desc: 'One line description for the README.md file.'
    },
    public: {
        type: Boolean,
        default: true,
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
    },
    repo: {
        type: String,
        desc: 'The URL of the GitHub repository',
        hidden: true
    },
    internalPackages: {
        type: Boolean,
        desc: 'Whether this monorepo contains internal packages',
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

        this.log(chalk.green('Slimer') + ' will create new project with the following settings:', JSON.stringify(this.props, null, 2));
    }

    // What gets passed to us is just the folder name
    _initNaming(name) {
        // First, sort our the GitHub org and the npm scope
        if (this.props.org.match(/nexes/i)) {
            this.props.org = 'NexesJS';
            this.props.scope = this.props.scope || '@nexes';
        }

        if (this.props.type === 'mono') {
            this.props.scope = this.props.scope || '@tryghost';
        }

        // Ensure scopes are properly formatted when present
        if (this.props.scope !== '' && !_.endsWith(this.props.scope, '/')) {
            this.props.scope += '/';
        }

        // Next, determine names...

        // # Naming conventions.
        // by default, we expect to start with props.name (folder name) being either in kebabcase that we want to keep
        // E.g. mg-medium-export
        // Or something capitalised, e.g. Ghost

        // Repo name rules - it should be the same as the folder name
        this.props.repoName = this.props.repoName || name;
        // npm name rule, we try to add a scope, else use the base name, in kebabCase
        this.props.npmName = `${this.props.scope}${this.props.npmName || _.kebabCase(name)}`;
        // Project name, should be Properly Capitalised For the README! If it starts with mg- or kg- convert to Migrate/Koenig
        this.props.projectName = this.props.projectName || _.startCase(name.replace(/^mg-/, 'Migrate ').replace(/^kg-/, 'Koenig '));
    }

    prompting() {
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
            },
            {
                type: 'string',
                name: 'desc',
                message: `Enter a one-line description for your ${this.props.type === 'pkg' ? 'package' : this.props.type === 'mono' ? 'monorepo' : this.props.type}:`,
                when: _.isNil(this.props.desc)
            }
        ];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }

    configuring() {
        // Set destination root that will be used by Yeoman from here on
        this.destinationRoot(this.props.path);
        // Ensure that path exists
        mkdirp(this.destinationRoot());
    }

    default() {
        // Main Prep
        if (this.props.type === 'mono') {
            this.composeWith(require.resolve('../lerna'), this.props);
        } else {
            // Mono repos don't get base node setup
            this.composeWith(require.resolve('../node'), this.props);
        }

        // Next, add our default .editorconfig file
        this.composeWith(require.resolve('../editorconfig'), this.props);

        // Public projects require an MIT license, private projects should NOT have one
        this.composeWith(require.resolve('../license'), this.props);

        // Tests go first so that lint can interact with the test folder
        if (!this.options.skipTest) { // @TODO add this option?
            this.composeWith(require.resolve('../test'), this.props);
        }

        this.composeWith(require.resolve('../lint'), this.props);

        if (this.props.type !== 'pkg') {
            this.composeWith(require.resolve('../gitroot'), this.props);
            this.composeWith(require.resolve('../githubactions'), this.props);
        }
    }

    writing() {
        // Create a README.md
        this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            this.props
        );
    }

    end() {
        this.log(chalk.green('Slimer') + ' has finished creating ' + chalk.cyan(this.props.name));
    }
};
