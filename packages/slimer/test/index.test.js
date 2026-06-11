require('./utils');

const Module = require('module');

const loadSlimer = (commands) => {
    const modulePath = require.resolve('../index');
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === './commands') {
            return commands;
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require('../index');
    } finally {
        Module._load = originalLoad;
    }
};

describe('slimer', function () {
    describe('loadCommands', function () {
        it('loads command init hooks before returning commands', function () {
            const init = sinon.stub().resolves();
            const commands = [
                {id: 'ready'},
                {id: 'needs-init', init}
            ];

            const slimer = loadSlimer(commands);

            return slimer.loadCommands().then((loaded) => {
                loaded.should.eql(commands);
                init.calledOnce.should.be.true();
            });
        });

        it('does not require init for static commands', function () {
            const command = {id: 'static'};
            const slimer = loadSlimer([command]);

            return slimer.loadCommands().then((loaded) => {
                loaded.should.eql([command]);
            });
        });
    });
});
