const print = (...args) => console.log(...args); // eslint-disable-line no-console

module.exports.commands = [
    {
        id: 'new',
        flags: 'new <name>',
        aliases: ['create', 'project'],
        paramsDesc: ['Name for the project folder'],
        desc: 'Start a new project',
        run: (argv) => {
            print('Will evenually run yeoman to create', argv.name);
        }
    }
];
