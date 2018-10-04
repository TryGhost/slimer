const debug = require('debug')('slimer:new');
const _ = require('lodash');
const cliYo = require('./cli-yo');
const fs = require('./fs-utils');
const ui = require('@tryghost/pretty-cli').ui;

module.exports = (argv, cb) => {
    debug('command start');

    // Check if this is a mono repo, and if so load in any extra config
    _.merge(argv, fs.loadMonoConfig());

    // Fun bit of UI logic to print a useful message
    ui.log.info(`Will create new project "${argv.name}" ${((type) => {
        if (type) {
            return `with type ${type}.`;
        }
        return `and prompt for type.`;
    })(argv.type)}`);

    // Call the generator
    return cliYo.callGenerator('@tryghost/slimer', argv, cb);
};
