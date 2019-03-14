'use strict';
const Generator = require('../../lib/Generator');

// "lint": "eslint . --ext .js --cache",
const lintScript = 'eslint . --ext .js --cache';
//  "lint": "lerna run lint",
const monoLintScript = 'lerna run lint';

const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
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
        // Don't lint top-level of mono repos
        if (this.props.type !== 'mono') {
            // Add .eslintrc.js file (can be extended)
            this.fs.copy(
                this.templatePath('.eslintrc.js'),
                this.destinationPath('.eslintrc.js')
            );

            if (!this.props.skipTest) {
                // Add test/.eslintrc.js file (can be extended)
                this.fs.copy(
                    this.templatePath('test/.eslintrc.js'),
                    this.destinationPath('test/.eslintrc.js')
                );
            }
        }
    }

    // We use default, so that writing can be used to add more scripts after this
    default() {
        const destination = this.fs.readJSON(this.destinationPath('package.json'));
        if (destination) {
            // Add lint script to package.json
            if (this.props.type !== 'mono') {
                destination.scripts.lint = monoLintScript;
            } else {
                destination.scripts.lint = lintScript;
            }

            // Add posttest, but not for mono repos, or repos without tests
            if (this.props.type !== 'mono' && !this.props.skipTest && destination.scripts.test) {
                // "posttest": "yarn lint",
                destination.scripts.posttest = 'yarn lint';
            }
            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    install() {
        let options = {dev: true, exact: true};
        if (this.props.type === 'mono') {
            options['ignore-workspace-root-check'] = true;
        }

        // We don't need these dependencies if we're a mono repo package
        if (this.props.type !== 'pkg') {
            // Basic lint dependencies
            this.yarnInstall(['eslint', 'eslint-plugin-ghost'], options);
        }
    }
};
