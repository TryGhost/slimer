'use strict';
const Generator = require('../../lib/Generator');
const mkdirp = require('mkdirp');

// "ship": "STATUS=$(git status --porcelain); echo $STATUS; if [ -z \"$STATUS\" ]; then lerna publish; fi"
const shipScript = 'STATUS=$(git status --porcelain); echo $STATUS; if [ -z "$STATUS" ]; then lerna publish; fi';

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

        // @TODO maybe clean up package.json in favour of lerna.json
        // Add package.json file (super important!)
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            {repo}
        );

        // @TODO: add scope and publicness to local data in lerna.json
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

    install() {
        let options = {dev: true, exact: true};
        // This is a mono repo
        options['ignore-workspace-root-check'] = true;

        // Add lerna as a dependency
        this.yarnInstall(['lerna'], options);
    }
};
