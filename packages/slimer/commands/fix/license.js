const cliYo = require('../../lib/cli-yo');
const fs = require('../../lib/fs-utils');
const ui = require('@tryghost/pretty-cli').ui;

// Internal ID in case we need one.
exports.id = 'license';

// The command to run and any params
exports.flags = 'license';

// Description for the top level command
exports.desc = 'Fixup the license information';

// What to do when this command is executed
exports.run = async (argv, cb) => {
    // @TODO make a generic tool that can read type and public into argv instead of this
    argv.type = fs.getType();

    if (argv.type === 'pkg') {
        ui.log.error('License should be configured at the project root');
        return;
    }

    return cliYo.callGenerator('@tryghost/slimer:license', argv, cb);
};
