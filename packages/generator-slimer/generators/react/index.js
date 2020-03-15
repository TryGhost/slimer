'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');
const chalk = require('chalk');
const insertAfter = require('../../lib/insert-after');

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
    repo: {
        type: String,
        desc: 'The URL of the GitHub repository',
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

        this._initNaming(name);
    }

    // What gets passed to us is just the folder name
    _initNaming(name) {
        // Repo name rules - it should be the same as the folder name
        this.props.repoName = this.props.repoName || name;
        // Project name, should be Properly Capitalised For the README! If it starts with mg- or kg- convert to Migrate/Koenig
        this.props.projectName = this.props.projectName || _.startCase(name.replace(/^mg-/, 'Migrate ').replace(/^kg-/, 'Koenig '));
    }

    prompting() {
        const prompts = [
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

    configuring() {
        this.log(chalk.green('Slimer') + ' will configure this react project with the following settings:', JSON.stringify(this.props, null, 2));
    }

    default() {
        // Next, add our default .editorconfig file
        this.composeWith(require.resolve('../editorconfig'), this.props);

        // Public projects require an MIT license, private projects should NOT have one
        this.composeWith(require.resolve('../license'), this.props);

        // Ensure git is initialised with gitignore
        this.props.extras = [
            'build',
            '',
            '## config',
            '.env.local',
            '.env.development.local',
            '.env.test.local',
            '.env.production.local'
        ];

        this.composeWith(require.resolve('../gitroot'), this.props);
    }

    _writePackageJSON() {
        // Read the existing package.json
        let destination = this.fs.readJSON(this.destinationPath('package.json'));

        // Handle public/private
        if (destination) {
            if (!destination.repository) {
                destination = insertAfter(destination, 'version', 'repository', `git@github.com:TryGhost/${this.props.repoName}.git`);
            }
            if (!destination.author) {
                destination = insertAfter(destination, 'repository', 'author', 'Ghost Foundation');
            }
        }

        if (destination) {
            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    _writeREADME() {
        // Read the existing README.md
        let destination = this.fs.read(this.destinationPath('README.md'));
        let title = `# ${this.props.projectName}`;

        // Handle public/private
        if (destination && !destination.startsWith(title)) {
            destination = `${title}\n\n${destination}`;
        }

        if (destination) {
            this.fs.write(this.destinationPath('README.md'), destination);
        }
    }

    writing() {
        this._writePackageJSON();
        this._writeREADME();
    }

    end() {
        this.log(chalk.green('Slimer') + ' has finished configuring ' + chalk.cyan(this.props.name));
    }
};
