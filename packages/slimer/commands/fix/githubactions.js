const cliYo = require('../../lib/cli-yo');
const fs = require('../../lib/fs-utils');
const ui = require('@tryghost/pretty-cli').ui;

// Internal ID in case we need one.
exports.id = 'githubactions';

// The command to run and any params
exports.flags = 'githubactions [supportPolicy]';

// Description for the top level command
exports.desc = 'Rewrite the local GitHub Actions file';

// Alias to a shorthand version
exports.aliases = ['ga'];

// Descriptions for the individual params
exports.paramsDesc = ['A renovate-style support policy (autodetected)'];

// What to do when this command is executed
exports.run = async (argv, cb) => {
    // @TODO make a generic tool that can read type and public into argv instead of this
    argv.type = fs.getType();

    if (argv.type === 'pkg') {
        ui.log.error('test.yml should exist under .github/workflows at the project root');
        return;
    }

    return cliYo.callGenerator('@tryghost/slimer:githubactions', argv, cb);
};
