require('./utils');

const Module = require('module');

const loadNewProject = (mocks) => {
    const modulePath = require.resolve('../lib/new-project');
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require('../lib/new-project');
    } finally {
        Module._load = originalLoad;
    }
};

describe('new-project', function () {
    it('merges mono config before calling the generator', function () {
        const cliYo = {
            callGenerator: sinon.stub().returns('called')
        };
        const fs = {
            loadMonoConfig: sinon.stub().returns({
                type: 'pkg',
                path: '/repo/packages',
                scope: '@tryghost'
            })
        };
        const ui = {
            log: {
                info: sinon.spy()
            }
        };
        const newProject = loadNewProject({
            './cli-yo': cliYo,
            './fs-utils': fs,
            '@tryghost/pretty-cli': {ui}
        });
        const argv = {name: 'demo'};

        newProject(argv, 'done').should.equal('called');

        argv.should.containEql({
            name: 'demo',
            type: 'pkg',
            path: '/repo/packages',
            scope: '@tryghost'
        });
        ui.log.info.firstCall.args[0].should.match(/with type pkg/);
        cliYo.callGenerator.calledWith('@tryghost/slimer', argv, 'done').should.be.true();
    });

    it('logs when project type will be prompted', function () {
        const cliYo = {
            callGenerator: sinon.stub()
        };
        const ui = {
            log: {
                info: sinon.spy()
            }
        };
        const newProject = loadNewProject({
            './cli-yo': cliYo,
            './fs-utils': {
                loadMonoConfig: sinon.stub().returns({})
            },
            '@tryghost/pretty-cli': {ui}
        });

        newProject({name: 'demo'});

        ui.log.info.firstCall.args[0].should.match(/prompt for type/);
    });
});
