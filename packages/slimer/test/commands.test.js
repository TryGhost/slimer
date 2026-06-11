require('./utils');

const Module = require('module');

const loadCommand = (commandPath, mocks) => {
    const modulePath = require.resolve(commandPath);
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require(commandPath);
    } finally {
        Module._load = originalLoad;
    }
};

describe('commands', function () {
    it('maps Yeoman options into the new command setup', function () {
        const cliYo = {
            yoToSywac: sinon.stub().callsFake((name, cb) => cb([], [
                {name: 'type', flags: '--type', type: 'string'},
                {name: 'desc', flags: '--desc', type: 'string'},
                {name: 'scope', flags: '--scope', type: 'string'}
            ])),
            callGenerator: sinon.stub()
        };
        const command = loadCommand('../commands/new', {
            '../lib/cli-yo': cliYo,
            '../lib/new-project': sinon.stub()
        });

        return command.init().then(() => {
            const sywac = {
                option: sinon.spy(),
                example: sinon.spy()
            };
            command.setup(sywac);

            sywac.example.callCount.should.equal(4);
            sywac.option.firstCall.args[0].should.containEql({
                flags: '--type',
                type: 'enum'
            });
            sywac.option.secondCall.args[0].hints.should.equal('[required] [string] [default: ""]');
            cliYo.yoToSywac.calledWith('@tryghost/slimer').should.be.true();
        });
    });

    it('dispatches fix commands to generators when allowed', function () {
        const cliYo = {callGenerator: sinon.stub().returns('called')};
        const fs = {
            isMonoPackage: sinon.stub().returns(false),
            getType: sinon.stub().returns('module')
        };
        const ui = {log: {error: sinon.spy(), ok: sinon.spy()}};

        loadCommand('../commands/fix/editorconfig', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({name: 'repo'}, 'done').should.equal('called');

        cliYo.callGenerator.calledWith('@tryghost/slimer:editorconfig').should.be.true();

        loadCommand('../commands/fix/githubactions', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({supportPolicy: 'lts'}, 'done');

        cliYo.callGenerator.calledWith('@tryghost/slimer:githubactions').should.be.true();

        loadCommand('../commands/fix/license', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({public: true}, 'done');

        cliYo.callGenerator.calledWith('@tryghost/slimer:license').should.be.true();
    });

    it('does not write package-level root files from fix commands', function () {
        const cliYo = {callGenerator: sinon.spy()};
        const fs = {
            isMonoPackage: sinon.stub().returns(true),
            getType: sinon.stub().returns('pkg')
        };
        const ui = {log: {error: sinon.spy(), ok: sinon.spy()}};

        loadCommand('../commands/fix/editorconfig', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({});

        loadCommand('../commands/fix/githubactions', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({});

        loadCommand('../commands/fix/license', {
            '../../lib/cli-yo': cliYo,
            '../../lib/fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        }).run({});

        ui.log.ok.calledWith('.editorconfig exists at project root').should.be.true();
        ui.log.error.calledTwice.should.be.true();
        cliYo.callGenerator.called.should.be.false();
    });

    it('dispatches direct commands to the matching generators', function () {
        const cliYo = {callGenerator: sinon.stub().returns('called')};
        const fs = {
            getName: sinon.stub().returns('@tryghost/site')
        };

        loadCommand('../commands/fix/engines', {
            '../../lib/cli-yo': cliYo
        }).run({}).should.equal('called');

        loadCommand('../commands/fix/packagejson', {
            '../../lib/cli-yo': cliYo
        }).run({}).should.equal('called');

        loadCommand('../commands/react', {
            '../lib/cli-yo': cliYo,
            '../lib/fs-utils': fs
        }).run({}, 'done');

        cliYo.callGenerator.calledWith('@tryghost/slimer:engines').should.be.true();
        cliYo.callGenerator.calledWith('@tryghost/slimer:pkgjson').should.be.true();
        cliYo.callGenerator.calledWith('@tryghost/slimer:react', {
            name: '@tryghost/site',
            type: 'app'
        }, 'done').should.be.true();
    });
});
