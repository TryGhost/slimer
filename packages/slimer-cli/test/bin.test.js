require('./utils');

const Module = require('module');

const flushPromises = () => {
    return new Promise(resolve => setImmediate(resolve));
};

describe('slimer bin', function () {
    it('registers loaded commands with pretty-cli before parsing', function () {
        const command = {id: 'new'};
        const prettyCLI = {
            command: sinon.spy(),
            parseAndExit: sinon.spy()
        };
        const slimer = {
            loadCommands: sinon.stub().resolves([command])
        };

        const modulePath = require.resolve('../bin/slimer');
        delete require.cache[modulePath];

        const originalLoad = Module._load;
        Module._load = function (request, parent, isMain) {
            if (request === '@tryghost/pretty-cli') {
                return prettyCLI;
            }

            if (request === '@tryghost/slimer') {
                return slimer;
            }

            return originalLoad.call(this, request, parent, isMain);
        };

        require('../bin/slimer');

        return flushPromises().then(() => {
            Module._load = originalLoad;

            slimer.loadCommands.calledOnce.should.be.true();
            prettyCLI.command.calledWith(command).should.be.true();
            prettyCLI.parseAndExit.calledOnce.should.be.true();
        }, (err) => {
            Module._load = originalLoad;
            throw err;
        });
    });
});
