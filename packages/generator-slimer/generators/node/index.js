'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');

// "ship": STATUS=$(git status --porcelain); echo $STATUS; if [ -z \"$STATUS\" ]; then COMMAND && git push --follow-tags; fi
const shipScript = 'STATUS=$(git status --porcelain); echo $STATUS; if [ -z "$STATUS" ]; then SHIPCOMMAND && git push --follow-tags; fi';

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
    npmName: {
        type: String,
        required: true,
        desc: 'The npm package name for the project'
    },
    repoName: {
        type: String,
        required: true,
        desc: 'The GitHub repository name for the project'
    },
    repo: {
        type: String,
        desc: 'The URL of the GitHub repository',
        hidden: true
    }
};

const knownArguments = {};

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();

        this.props.main = this.props.type === 'app' ? 'app.js' : 'index.js';
    }

    prompting() {
        let prompts = [{
            type: 'list',
            name: 'type',
            message: 'Is this a standalone app or a module?',
            choices: ['app', 'module'],
            default: 'module',
            when: () => !this.props.type
        }];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }

    _writeMainFile() {
        this.fs.copyTpl(
            this.templatePath('blank.js'),
            this.destinationPath(this.props.main)
        );
    }

    // Add package.json file (super important!)
    _writePackageJson() {
        let repo = this.props.type === 'pkg' ?
            `${this.props.repo}/tree/master/packages/${this.props.repoName}` :
            `git@github.com:${this.props.org}/${this.props.repoName}.git`;

        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            {
                npmName: this.props.npmName,
                license: this.props.public ? '"license": "MIT",' : '"private": true,',
                publicScoped: this.props.public && _.startsWith(this.props.npmName, '@'),
                repo: repo,
                main: this.props.main
            }
        );
    }

    default() {
        // Create a "main" JS file
        this._writeMainFile();

        // Create a package.json file
        this._writePackageJson();
    }

    install() {
        // Lodash, the one dependency we use everywhere & don't usually install without a caret
        this.yarnInstall(['lodash', 'bluebird', 'ghost-ignition']);
    }

    _ship() {
        // Mono package shipping is handled by the root package
        if (this.props.type === 'pkg') {
            return;
        }

        let shipCmd = this.props.type === 'module' ? 'yarn publish' : 'yarn version';

        // Handle shipping in package.json scripts
        let destination = this.fs.readJSON(this.destinationPath('package.json'));
        if (destination) {
            if (!this.props.skipTest && destination.scripts.test) {
                // "preship": "yarn test",
                destination.scripts.preship = 'yarn test';
            }

            // "ship": "STATUS=$(git status --porcelain); echo $STATUS; if [ -z \"$STATUS\" ]; then COMMAND && git push --follow-tags; fi",
            destination.scripts.ship = shipScript.replace('SHIPCOMMAND', shipCmd);

            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    writing() {
        this._ship();
    }
};
