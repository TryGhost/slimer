require('./utils');

const Module = require('module');

const loadCommandList = () => {
    const modulePath = require.resolve('../commands');
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === './new') {
            return {id: 'new'};
        }

        if (request === './react') {
            return {id: 'react'};
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require('../commands');
    } finally {
        Module._load = originalLoad;
    }
};

describe('command list', function () {
    it('exposes commands in the expected display order', function () {
        const commands = loadCommandList();

        commands.map(command => command.id).should.eql(['new', 'fix', 'react']);
    });

    it('configures the fix command directory and examples', function () {
        const fix = require('../commands/fix');
        const sywac = {
            commandDirectory: sinon.spy(),
            example: sinon.spy()
        };

        fix.setup(sywac);

        sywac.commandDirectory.calledWith('fix').should.be.true();
        sywac.example.calledThrice.should.be.true();
    });
});
