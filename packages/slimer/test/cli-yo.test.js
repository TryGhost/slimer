require('./utils');

const Module = require('module');

const loadCliYo = (env) => {
    const modulePath = require.resolve('../lib/cli-yo');
    delete require.cache[modulePath];

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'yeoman-environment') {
            return {
                createEnv: () => env
            };
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require('../lib/cli-yo');
    } finally {
        Module._load = originalLoad;
    }
};

const Generator = {
    namespace: '@tryghost/slimer:app'
};

describe('cli-yo', function () {
    it('loads the Yeoman environment before finding generators', function () {
        const env = {
            lookup: sinon.spy(),
            get: sinon.stub().returns(Generator)
        };
        const cliYo = loadCliYo(env);

        cliYo.findGenerator('@tryghost/slimer').should.equal(Generator);
        cliYo.findGenerator('@tryghost/slimer').should.equal(Generator);

        env.lookup.calledOnce.should.be.true();
        env.get.calledTwice.should.be.true();
        env.get.calledWith('@tryghost/slimer').should.be.true();
    });

    it('maps Yeoman help metadata to sywac options', function () {
        const env = {
            lookup: sinon.spy(),
            get: sinon.stub().returns(Generator),
            instantiate: sinon.stub().returns({
                _arguments: [{
                    name: 'name',
                    type: String
                }],
                _options: [{
                    name: 'type',
                    type: String,
                    default: 'module'
                }, {
                    name: 'public',
                    type: Boolean
                }, {
                    name: 'help',
                    type: Boolean
                }]
            })
        };
        const cliYo = loadCliYo(env);
        const callback = sinon.spy();

        cliYo.yoToSywac('@tryghost/slimer', callback);

        callback.firstCall.args[0].should.eql([{
            name: 'name',
            type: 'string',
            flags: '--name',
            defaultValue: undefined
        }]);
        callback.firstCall.args[1].should.eql([{
            name: 'type',
            type: 'string',
            default: 'module',
            flags: '--type',
            defaultValue: 'module'
        }, {
            name: 'public',
            type: 'boolean',
            flags: '--public',
            defaultValue: undefined
        }]);
    });

    it('passes only generator args and options when calling generators', function () {
        const generator = {
            run: sinon.stub().callsFake(callback => callback())
        };
        const env = {
            lookup: sinon.spy(),
            get: sinon.stub().returns(Generator),
            instantiate: sinon.stub().returns({
                _arguments: [{name: 'name', type: String}],
                _options: [{name: 'type', type: String}]
            }),
            create: sinon.stub().returns(generator)
        };
        const cliYo = loadCliYo(env);
        const callback = sinon.spy();

        cliYo.callGenerator('@tryghost/slimer', {
            name: 'demo',
            type: 'module',
            help: true,
            unused: undefined
        }, callback);

        env.create.calledWith('@tryghost/slimer:app', {
            args: ['demo'],
            options: {type: 'module'}
        }).should.be.true();
        callback.calledOnce.should.be.true();
    });
});
