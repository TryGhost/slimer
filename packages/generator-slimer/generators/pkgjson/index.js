'use strict';
const Generator = require('../../lib/Generator');
const insertAfter = require('../../lib/insert-after');

const knownOptions = {};
const knownArguments = {};

/**
 * This is a standalone generator, used to apply changes to multiple project's package.json
 * It was born out of the need to retro-actively apply the files array to multiple packages
 *
 */

module.exports = class extends Generator {
    constructor(args, options) {
        super(args, options, knownArguments, knownOptions);
    }

    initializing() {
        super.initializing();
    }

    // We use default, so that writing can be used to add more scripts after this
    default() {
        // Read the existing package.json
        let destination = this.fs.readJSON(this.destinationPath('package.json'));

        // Insert a files array
        if (destination && destination.main && !destination.files) {
            destination = insertAfter(destination, 'scripts', 'files', [
                destination.main,
                'lib'
            ]);

            this.fs.writeJSON(this.destinationPath('package.json'), destination);
        }
    }

    install() {
        // Use this if we need to retroactively install stuff later...
    }
};
