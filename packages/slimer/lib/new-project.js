const debug = require('debug')('slimer:new');
const cliYo = require('./cli-yo');
const fs = require('./fs-utils');
const ui = require('../ui');

module.exports = (argv) => {
    debug('command start');

    // @TODO cleaner?!
    let monoRoot = fs.findMonoRoot();
    if (monoRoot) {
        argv.type = 'pkg';
        argv.path = monoRoot;
    }

    // Fun bit of UI logic to print a useful message
    ui.log(`Will create new project "${argv.name}" ${((type) => {
        if (type) {
            return `with type ${type}.`;
        }   
        return `and prompt for type.`;
    })(argv.type)}`);

    // Call the generator
    return cliYo.callGenerator('@tryghost/slimer', argv);
};  