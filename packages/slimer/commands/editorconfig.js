const cliYo = require('../lib/cli-yo');

// Internal ID in case we need one.
exports.id = 'editorconfig';

// The command to run and any params
exports.flags = 'editorconfig';

// Description for the top level command
exports.desc = 'Rewrite the local editor config';

// Descriptions for the individual params
exports.paramsDesc = ['Name for the project folder'];

// What to do when this command is executed
exports.run = (argv, cb) => {
    return cliYo.callGenerator('@tryghost/slimer:editorconfig', argv, cb);
};
