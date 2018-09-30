'use strict';
const Generator = require('../../lib/Generator');

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
        let main = this.props.type === 'app' ? 'app.js' : 'index.js';

        this.fs.copyTpl(
            this.templatePath('blank.js'),
            this.destinationPath(main)
        );
    }

    default() {
        // Create a "main" JS file
        this._writeMainFile();
    }
};
