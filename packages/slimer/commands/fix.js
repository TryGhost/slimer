/**
 * Fix is a top level command a little bit like "new"
 * Except it has sub-commands, each one represented by a file in the 'fix' directory
 */

// Internal ID in case we need one.
exports.id = 'fix';

// The command to run and any params
exports.flags = 'fix <subcommand> [args]';

// Description for the top level command
exports.desc = 'Fix an issue with an existing project setup';

exports.ignore = ['<subcommand>', '[args]'],

// Configure all the options
exports.setup = (sywac) => {
    sywac.commandDirectory('fix');

    sywac.example('$0 githubactions', {
        desc: 'Rewrite the local GitHub Actions file'
    });

    sywac.example('$0 githubactions lts', {
        desc: 'Rewrite the local GitHub Actions file with the "lts" support policy'
    });

    sywac.example('$0 license --public=false', {
        desc: 'Update licensing information to be private'
    });
};
