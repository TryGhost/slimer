const cliYo = require('../../lib/cli-yo');
const fs = require('../../lib/fs-utils');
const ui = require('@tryghost/pretty-cli').ui;

// Internal ID in case we need one.
exports.id = 'editorconfig';

// The command to run and any params
exports.flags = 'editorconfig';

// Alias these hard to type commands
exports.aliases = ['edconf', 'ec'];

// Description for the top level command
exports.desc = 'Rewrite the local .editorconfig';

// What to do when this command is executed
exports.run = (argv, cb) => {
    if (fs.isMonoPackage()) {
        ui.log.ok('.editorconfig exists at project root');
    } else {
        return cliYo.callGenerator('@tryghost/slimer:editorconfig', argv, cb);
    }
};
