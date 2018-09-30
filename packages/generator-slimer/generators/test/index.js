'use strict';
const Generator = require('../../lib/Generator');

// "test": "NODE_ENV=testing mocha ./test/**/*.test.js",
const testScript = 'NODE_ENV=testing mocha ./test/**/*.test.js';

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
        this.fs.copy(
            this.templatePath('test/utils/assertions.js'),
            this.destinationPath('test/utils/assertions.js')
        );
        this.fs.copy(
            this.templatePath('test/utils/index.js'),
            this.destinationPath('test/utils/index.js')
        );
        this.fs.copy(
            this.templatePath('test/utils/overrides.js'),
            this.destinationPath('test/utils/overrides.js')
        );
        this.fs.copy(
            this.templatePath('test/hello.test.js'),
            this.destinationPath('test/hello.test.js')
        );
    }

    // We use default, so that writing can be used to add more scripts after this
    default() {
        // Add test script to package.json
        const destination = this.fs.readJSON(this.destinationPath('package.json'));
        if (destination) {
            if (this.props.type === 'mono') {
                destination.scripts['test:parent'] = testScript;
                destination.scripts.test = 'yarn test:parent && lerna run test';
            } else {
                destination.scripts.test = testScript;
            }

            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    install() {
        let options = {dev: true, exact: true};

        if (this.props.type === 'mono') {
            options['ignore-workspace-root-check'] = true;
        }

        // Test dependencies
        this.yarnInstall(['mocha', 'should', 'sinon'], options);
    }
};
