const _ = require('lodash');
const cliYo = require('../lib/cli-yo');
const newProject = require('../lib/new-project');
const optOverrides = {
    type: {
        flags: '--type',
        type: 'enum',
        description: 'The type of project to create',
        choices: ['module', 'app', 'pkg', 'mono'],
        required: false
    },
    scope: {
        // sywac doesn't respect empty string as a valid default
        // @TODO push a fix to the main repo
        hints: '[required] [string] [default: ""]'
    }
};

let options = {};

// Internal ID in case we need one.
exports.id = 'new';

// The command to run and any params
exports.flags = 'new <name>';

// Aliases, other names for the command
exports.aliases = ['create', 'project'];

// Description for the top level command
exports.desc = 'Start a new project';

// Descriptions for the individual params
exports.paramsDesc = ['Name for the project folder'];

// Configure all the options
exports.setup = (sywac) => {
    sywac.example('$0 MyApp', {
        desc: 'Create a project called MyApp, will be a package if called inside a monorepo'
    });
    sywac.example('$0 MyProject --type=mono', {
        desc: 'Create a mono repo called MyProject'
    });
    sywac.example('$0 MySecretApp --public=false', {
        desc: 'Create a private project called MySecretApp'
    });
    sywac.example('$0 MyApp --skipRepo', {
        desc: 'Create a project called MyApp without a repo'
    });

    // Loop over the options we loaded from Yeoman
    // and load these into sywac
    _.each(options, (opt) => {
        sywac.option(opt);
    });
};

// What to do when this command is executed
exports.run = newProject;

// A function to run first, Must return a promise
exports.init = () => {
    return new Promise((resolve) => {
        // Load all of our options
        cliYo.yoToSywac('@tryghost/slimer', (args, opts) => {
            options = _.map(opts, (opt) => {
                // Allows us to override options with the optOverrides object above
                return optOverrides[opt.name] ? _.merge({}, opt, optOverrides[opt.name]) : opt;
            });

            resolve();
        });
    });
};
