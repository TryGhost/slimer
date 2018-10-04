const Promise = require('bluebird');
const _ = require('lodash');
const commands = require('./commands');

module.exports.loadCommands = () => {
    return Promise.map(commands, (command) => {
        if (_.has(command, 'init')) {
            return command
                .init()
                .then(() => command);
        }

        return Promise.resolve(command);
    });
};
