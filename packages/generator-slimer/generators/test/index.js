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
            ? `NODE_ENV=testing vitest run --globals --coverage --coverage.provider=v8 --coverage.include 'src/**/*.ts' --coverage.thresholds.100 --coverage.reporter text --coverage.reporter cobertura`
            : `NODE_ENV=testing vitest run --globals --coverage --coverage.provider=v8 --coverage.include '*.js' --coverage.include 'lib/**/*.js' --coverage.thresholds.100 --coverage.reporter text --coverage.reporter cobertura`;

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
        const testPackages = ['vitest', '@vitest/coverage-v8', 'sinon'];
        if (this.props.typescript) {
            testPackages.push('typescript');
        }
        this.yarnInstall(testPackages, options);
    }
};
