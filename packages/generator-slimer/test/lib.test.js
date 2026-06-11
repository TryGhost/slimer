require('./utils');

const {loadModule} = require('./utils/generator-stub');
const insertAfter = require('../lib/insert-after');
const nodePolicies = require('../lib/node-policies');

describe('generator libraries', function () {
    it('inserts new keys after the requested key', function () {
        insertAfter({name: 'pkg', scripts: {}, dependencies: {}}, 'scripts', 'files', ['index.js']).should.eql({
            name: 'pkg',
            scripts: {},
            files: ['index.js'],
            dependencies: {}
        });
    });

    it('exports current Node policy data', function () {
        nodePolicies.defaultPolicy.should.equal('lts');
        nodePolicies.policies.lts.should.eql([20, 22, 24]);
        nodePolicies.nodeEngines.should.equal('^20.11.1 || ^22.13.1 || ^24.0.0');
    });

    it('initializes known generator props and merges prompt answers', function () {
        class YeomanBase {
            constructor(args, options) {
                this.args = args;
                this.options = options;
                this.log = sinon.spy();
            }
        }

        YeomanBase.prototype.argument = sinon.spy();
        YeomanBase.prototype.option = sinon.spy();

        const Generator = loadModule('lib/Generator', {
            'yeoman-generator': YeomanBase,
            chalk: {
                red: value => value
            }
        });

        const generator = new Generator([], {
            name: 'demo',
            public: true,
            ignored: 'no'
        }, {
            name: {}
        }, {
            public: {}
        });

        generator.initializing();
        generator.props.should.eql({
            name: 'demo',
            public: true
        });

        generator._mergeAnswers({desc: 'A package'});
        generator.props.desc.should.equal('A package');
    });
});
