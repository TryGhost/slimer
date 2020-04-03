'use strict';
const Generator = require('../../lib/Generator');
const _ = require('lodash');

// These are the options that can be passed
const knownOptions = {
    projectName: {
        type: String,
        required: false,
        desc: 'Project name'
    },
    extras: {
        type: Array,
        required: false,
        desc: 'Array of additional gitignore lines'
    }
};

const knownArguments = {};

const getExtras = () => {
    // Array types grab all remaining opts and we end up nested here
    // But on Daniel's machine something different happens...
    if (!this.props.extras) {
        return [];
    }

    if (Array.isArray(this.props.extras) && this.props.extras.length > 1 && Array.isArray(this.props.extras[0])) {
        return this.props.extras[0];
    }

    return this.props.extras;
};

// TASKS:
// 1. Initialise current folder
// git init
// 2. First commit
// git add .
// git commit -m "Initial commit"

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();
    }

    // use https://github.com/iamstarkov/generator-git-init if it gets updated??
    _gitInit() {
        this.spawnCommandSync('git', ['init', '--quiet']);
    }

    _initialCommit() {
        // @TODO sort out this option!
        var message = this.config.message || '✨ Initial commit';
        this.spawnCommandSync('git', ['add', '--all']);
        this.spawnCommandSync('git', ['commit', '-m', message, '--quiet']);
    }

    configuring() {
        this._gitInit();

        // Add .gitignore file (Can have custom blocks at the end)
        this.fs.copyTpl(
            // This file is stored with a different name to prevent git & npm getting involved
            this.templatePath('gitignore.tpl'),
            this.destinationPath('.gitignore'),
            {
                name: _.startCase(this.props.projectName),
                extras: getExtras()
            }
        );
    }

    // Use end to ensure that commit & push happens at the very end writing but before dependencies
    end() {
        this._initialCommit();
    }
};
