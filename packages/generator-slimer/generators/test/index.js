'use strict';
const Generator = require('../../lib/Generator');

const knownOptions = {
    type: {
        type: String,
        required: true,
        desc: 'What kind of project to create: [module, app, pkg, mono]'
    },
    typescript: {
        type: Boolean,
        desc: 'Create a TypeScript module?'
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
        const extension = this.props.typescript ? 'ts' : 'js';
        this.fs.copy(
            this.templatePath(`test/hello.test.${extension}`),
            this.destinationPath(`test/hello.test.${extension}`)
        );
    }

    // We use default, so that writing can be used to add more scripts after this
    default() {
        const testScript = this.props.typescript
            ? `NODE_ENV=testing c8 --src src --all --check-coverage --100 --reporter text --reporter cobertura mocha -r ts-node/register './test/**/*.test.ts'`
            : `NODE_ENV=testing c8 --all --check-coverage --100  --reporter text --reporter cobertura mocha './test/**/*.test.js'`;

        // Add test script to package.json
        const destination = this.fs.readJSON(this.destinationPath('package.json'));
        if (destination) {
            if (this.props.type === 'mono') {
                destination.scripts['test:parent'] = testScript;
                destination.scripts.test = 'yarn test:parent && lerna run test';
            } else {
                destination.scripts['test:unit'] = testScript;
                destination.scripts.test = 'yarn test:unit';
            }

            if (this.props.typescript) {
                destination.scripts['test:types'] = 'tsc --noEmit';
                destination.scripts.test = `yarn test:types && ${destination.scripts.test}`;
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
        const testPackages = ['c8', 'mocha', 'sinon'];
        if (this.props.typescript) {
            testPackages.push('ts-node', 'typescript');
        }
        this.yarnInstall(testPackages, options);
    }
};
