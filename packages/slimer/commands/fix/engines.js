const cliYo = require('../../lib/cli-yo');

// Internal ID in case we need one.
exports.id = 'engines';

// The command to run and any params
exports.flags = 'engines';

// Description for the top level command
exports.desc = 'Update Node engines in package.json';

// What to do when this command is executed
exports.run = (argv, cb) => {
    return cliYo.callGenerator('@tryghost/slimer:engines', argv, cb);
};
