const cliYo = require('../../lib/cli-yo');

// Internal ID in case we need one.
exports.id = 'pkgjson';

// The command to run and any params
exports.flags = 'packagejson';

// Alias these hard to type commands
exports.aliases = ['pkgjson', 'pj'];

// Description for the top level command
exports.desc = 'Update package.json (add a files array)';

// What to do when this command is executed
exports.run = (argv, cb) => {
    return cliYo.callGenerator('@tryghost/slimer:pkgjson', argv, cb);
};
