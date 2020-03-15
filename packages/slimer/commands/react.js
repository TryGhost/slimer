const _ = require('lodash');
const cliYo = require('../lib/cli-yo');
const fs = require('../lib/fs-utils');

let options = {};

// Internal ID in case we need one.
exports.id = 'react';

// The command to run and any params
exports.flags = 'react';

// Description for the top level command
exports.desc = 'Run after create-react-app to finalise setup';

// Configure all the options
exports.setup = (sywac) => {
    // Loop over the options we loaded from Yeoman
    // and load these into sywac
    _.each(options, (opt) => {
        sywac.option(opt);
    });
};

// What to do when this command is executed
exports.run = async (argv, cb) => {
    argv.name = fs.getName();
    argv.type = 'app';

    return cliYo.callGenerator('@tryghost/slimer:react', argv, cb);
};
