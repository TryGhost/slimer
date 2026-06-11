const Module = require('module');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..', '..');

class StubGenerator {
    constructor(args, options, knownArguments, knownOptions) {
        this.args = args || [];
        this.options = options || {};
        this.knownArguments = knownArguments || {};
        this.knownOptions = knownOptions || {};
        this.props = {};
        this.logs = [];
        this._destinationRoot = '';
        this.config = {};
        this.argument = sinon.spy();
        this.option = sinon.spy();
        this.composeWith = sinon.spy();
        this.spawnCommandSync = sinon.spy();
        this.yarnInstall = sinon.spy();
        this.fs = {
            copy: sinon.spy(),
            copyTpl: sinon.spy(),
            readJSON: sinon.stub(),
            writeJSON: sinon.spy(),
            read: sinon.stub(),
            write: sinon.spy()
        };
    }

    initializing() {
        const propNames = Object.keys(this.knownArguments).concat(Object.keys(this.knownOptions));
        this.props = propNames.reduce((props, name) => {
            if (this.options[name] !== undefined) {
                props[name] = this.options[name];
            }

            return props;
        }, {});
    }

    _mergeAnswers(answers) {
        Object.assign(this.props, answers);
    }

    prompt(prompts) {
        this.prompts = prompts;
        return Promise.resolve(this.promptAnswers || {});
    }

    destinationPath(...segments) {
        return path.join(...segments);
    }

    templatePath(...segments) {
        return path.join('template', ...segments);
    }

    destinationRoot(value) {
        if (value) {
            this._destinationRoot = value;
        }

        return this._destinationRoot;
    }

    log(...args) {
        this.logs.push(args.join(' '));
    }
}

const loadModule = (packageRelativePath, mocks) => {
    const modulePath = require.resolve(path.join(packageRoot, packageRelativePath));
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (mocks && Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require(modulePath);
    } finally {
        Module._load = originalLoad;
    }
};

module.exports = {
    loadModule,
    StubGenerator
};
