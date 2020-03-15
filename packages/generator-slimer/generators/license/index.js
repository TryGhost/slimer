'use strict';
const Generator = require('../../lib/Generator');
const insertAfter = require('../../lib/insert-after');
const _ = require('lodash');

const knownOptions = {
    public: {
        type: Boolean,
        desc: 'Is the project public?'
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
        const prompts = [
            {
                type: 'confirm',
                name: 'public',
                message: `Is your project public?`,
                when: _.isNil(this.props.public),
                default: true
            }
        ];

        return this.prompt(prompts).then((answer) => {
            this._mergeAnswers(answer);
        });
    }

    _writeLicense() {
        if (this.props.public) {
            // Write a license file
            this.fs.copyTpl(
                this.templatePath('LICENSE'),
                this.destinationPath('LICENSE'),
                {date: `2013-${new Date().getFullYear()}`}
            );
        } else {
            // Remove license file if present
            this.fs.delete(this.destinationPath('LICENSE'));
        }
    }
    _writePackageJSON() {
        // Read the existing package.json
        let destination = this.fs.readJSON(this.destinationPath('package.json'));

        // Handle public/private
        if (destination && this.props.public) {
            if (destination.private) {
                delete destination.private;
            }
            if (!destination.license) {
                destination = insertAfter(destination, 'version', 'license', 'MIT');
            }
        }

        if (destination && !this.props.public) {
            if (destination.license) {
                delete destination.license;
            }
            if (!destination.private) {
                destination = insertAfter(destination, 'version', 'private', true);
            }
        }

        if (destination) {
            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }
    _writeREADME() {
        // Setup copyright info
        const title = `# Copyright & License \n\n`;
        const notice = `${title}Copyright (c) ${new Date().getFullYear()} Ghost Foundation`;
        const publicCopyright = `${notice} - Released under the [MIT license](LICENSE).`;
        const privateCopyright = `${notice}. All rights reserved.\n\nThis code is considered closed-source and not for distribution. There is no opensource license associated with this project.`;
        const copyright = this.props.public ? publicCopyright : privateCopyright;

        // Read the existing README.md
        let destination = this.fs.read(this.destinationPath('README.md'));

        if (!destination.match(/Copyright & License/)) {
            destination = `${destination}\n\n${copyright}`;
        } else {
            this.log('Unable to edit existing Copyright & License in README, please edit manually');
            this.log('It should be set to:');
            this.log(copyright);
        }

        if (destination) {
            this.fs.write(this.destinationPath('README.md'), destination);
        }
    }
    writing() {
        this._writeLicense();
        this._writePackageJSON();
    }

    end() {
        // Do this at the very end, so any other edits to README are done, and copyright can be on the end
        this._writeREADME();
    }
};
