'use strict';
const Generator = require('../../lib/Generator');
const mkdirp = require('mkdirp');

// lerna handles uncommitted changes for us
// "ship": "lerna"
const shipScript = 'lerna publish';

const knownOptions = {
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
    repoName: {
        type: String,
        required: false,
        desc: 'Repo name'
    }
};

const knownArguments = {};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();

        // Remove any scope formatting here
        this.props.scope = this.props.scope.replace(/\/$/, '');
    }

    configuring() {
        mkdirp(this.destinationPath('packages'));

        this.fs.copy(
            this.templatePath('.gitkeep'),
            this.destinationPath('packages', '.gitkeep')
        );
    }

    default() {
        // For mono repos, we use a base https URL, so that we can use it to construct subpackage URLs.
        let repo = `https://github.com/${this.props.org}/${this.props.repoName}`;

        // Add package.json file (super important!)
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            {repo}
        );

        // This includes some local settings which we use when generating sub packages
        this.fs.copyTpl(
            this.templatePath('lerna.json'),
            this.destinationPath('lerna.json'),
            {
                repo,
                public: this.props.public,
                scope: this.props.scope
            }
        );
    }

    _ship() {
        // Handle shipping in package.json scripts
        let destination = this.fs.readJSON(this.destinationPath('package.json'));
        if (destination) {
            if (!this.props.skipTest && destination.scripts.test) {
                // "preship": "yarn test",
                destination.scripts.preship = 'yarn test';
            }

            // "ship": "STATUS=$(git status --porcelain); echo $STATUS; if [ -z \"$STATUS\" ]; then lerna publish; fi"
            destination.scripts.ship = shipScript;

            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    writing() {
        this._ship();
    }
};
