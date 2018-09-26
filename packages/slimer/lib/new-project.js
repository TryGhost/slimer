const debug = require('debug')('slimer:new');
const cliYo = require('./cli-yo');

module.exports = (argv) => {
    debug('new project', argv);

    return cliYo.callGenerator('@tryghost/slimer', argv);
};