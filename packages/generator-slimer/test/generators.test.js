require('./utils');

const {loadModule, StubGenerator} = require('./utils/generator-stub');

const chalk = {
    green: value => value,
    cyan: value => value
};

const loadGenerator = (name, mocks) => {
    return loadModule(`generators/${name}`, Object.assign({
        '../../lib/Generator': StubGenerator,
        chalk
    }, mocks));
};

describe('generators', function () {
    it('initializes app naming, prompts, composition, and README output', function () {
        const mkdirp = sinon.spy();
        const App = loadGenerator('app', {mkdirp});
        const generator = new App([], {
            name: 'mg-medium-export',
            type: 'mono',
            org: 'nexes',
            desc: 'Migrate Medium',
            public: true
        });

        generator.initializing();
        generator.props.org.should.equal('NexesJS');
        generator.props.scope.should.equal('@nexes/');
        generator.props.repoName.should.equal('mg-medium-export');
        generator.props.npmName.should.equal('@nexes/mg-medium-export');
        generator.props.projectName.should.equal('Migrate Medium Export');

        generator.promptAnswers = {typescript: true};
        return generator.prompting().then(() => {
            generator.props.typescript.should.be.true();

            generator.configuring();
            mkdirp.calledWith('mg-medium-export').should.be.true();

            generator.default();
            generator.composeWith.callCount.should.equal(7);

            generator.writing();
            generator.fs.copyTpl.calledWith(
                'template/README.md',
                'README.md',
                generator.props
            ).should.be.true();

            generator.end();
            generator.logs[1].should.match(/finished creating/);
        });
    });

    it('writes simple project configuration generators', function () {
        const Editorconfig = loadGenerator('editorconfig');
        const editorconfig = new Editorconfig([], {type: 'module'});
        editorconfig.initializing();
        editorconfig.configuring();
        editorconfig.fs.copy.calledWith('template/.editorconfig', '.editorconfig').should.be.true();

        const subpackageEditorconfig = new Editorconfig([], {type: 'pkg'});
        subpackageEditorconfig.initializing();
        subpackageEditorconfig.configuring();
        subpackageEditorconfig.fs.copy.called.should.be.false();

        const Engines = loadGenerator('engines');
        const engines = new Engines([], {});
        engines.fs.readJSON.returns({engines: {npm: '>=10'}});
        engines.configuring();
        engines.fs.writeJSON.firstCall.args[1].engines.node.should.equal('^20.11.1 || ^22.13.1 || ^24.0.0');

        const missingPackage = new Engines([], {});
        missingPackage.fs.readJSON.returns();
        missingPackage.configuring();
        missingPackage.fs.writeJSON.called.should.be.false();
        missingPackage.logs[0].should.match(/package\.json/);

        const withoutEngines = new Engines([], {});
        withoutEngines.fs.readJSON.returns({});
        withoutEngines.configuring();
        withoutEngines.fs.writeJSON.firstCall.args[1].engines.node.should.equal('^20.11.1 || ^22.13.1 || ^24.0.0');

        const PackageJson = loadGenerator('pkgjson');
        const pkgjson = new PackageJson([], {});
        pkgjson.fs.readJSON.returns({
            name: 'pkg',
            scripts: {},
            main: 'index.js'
        });
        pkgjson.default();
        pkgjson.fs.writeJSON.firstCall.args[1].files.should.eql(['index.js', 'lib']);

        const packageWithoutMain = new PackageJson([], {});
        packageWithoutMain.fs.readJSON.returns({scripts: {}});
        packageWithoutMain.default();
        packageWithoutMain.fs.writeJSON.called.should.be.false();
    });

    it('creates GitHub Actions from explicit or renovate support policies', function () {
        const GitHubActions = loadGenerator('githubactions');
        const generator = new GitHubActions([], {type: 'module'});
        generator.fs.readJSON.withArgs('renovate.json').returns({
            node: {
                supportPolicy: ['lts_latest']
            }
        });

        generator.initializing();
        generator.props.supportPolicy.should.equal('lts_latest');

        generator.configuring();
        generator.fs.copyTpl.firstCall.args[2].should.eql({
            nodeVersions: [24],
            type: 'module'
        });

        const subpackage = new GitHubActions([], {type: 'pkg'});
        subpackage.initializing();
        subpackage.configuring();
        subpackage.fs.copyTpl.called.should.be.false();
        subpackage.logs[0].should.match(/Skipping/);
    });

    it('sets up lint and test scripts for generated packages', function () {
        const Lint = loadGenerator('lint');
        const lint = new Lint([], {type: 'pkg', typescript: true});
        lint.initializing();
        lint.fs.readJSON.returns({scripts: {test: 'yarn test:unit'}});
        lint.configuring();
        lint.default();
        lint.install();

        lint.fs.copyTpl.calledTwice.should.be.true();
        lint.fs.writeJSON.firstCall.args[1].scripts.lint.should.equal('yarn lint:code && yarn lint:test');
        lint.yarnInstall.called.should.be.false();

        const monoLint = new Lint([], {type: 'mono'});
        monoLint.initializing();
        monoLint.fs.readJSON.returns({scripts: {test: 'yarn test'}});
        monoLint.configuring();
        monoLint.default();
        monoLint.install();

        monoLint.fs.copyTpl.called.should.be.false();
        monoLint.fs.writeJSON.firstCall.args[1].scripts.lint.should.equal('lerna run lint && yarn lint:test');
        monoLint.yarnInstall.firstCall.args[1]['ignore-workspace-root-check'].should.be.true();

        const moduleLint = new Lint([], {type: 'module'});
        moduleLint.initializing();
        moduleLint.props.skipTest = true;
        moduleLint.fs.readJSON.returns({scripts: {test: 'yarn test'}});
        moduleLint.configuring();
        moduleLint.default();
        moduleLint.install();

        moduleLint.fs.copyTpl.calledOnce.should.be.true();
        moduleLint.fs.writeJSON.firstCall.args[1].scripts.lint.should.equal('yarn lint:code');
        moduleLint.yarnInstall.firstCall.args[0].should.eql(['eslint', 'eslint-plugin-ghost']);

        const Test = loadGenerator('test');
        const test = new Test([], {type: 'mono', typescript: true});
        test.initializing();
        test.fs.readJSON.returns({scripts: {}});
        test.configuring();
        test.default();
        test.install();

        test.fs.copy.calledWith('template/test/hello.test.ts', 'test/hello.test.ts').should.be.true();
        test.fs.writeJSON.firstCall.args[1].scripts.test.should.match(/^yarn test:types/);
        test.yarnInstall.firstCall.args[0].should.eql(['vitest', '@vitest/coverage-v8', 'sinon', 'typescript']);
        test.yarnInstall.firstCall.args[1]['ignore-workspace-root-check'].should.be.true();

        const jsTest = new Test([], {type: 'module'});
        jsTest.initializing();
        jsTest.fs.readJSON.returns({scripts: {}});
        jsTest.configuring();
        jsTest.default();
        jsTest.install();

        jsTest.fs.copy.calledWith('template/test/hello.test.js', 'test/hello.test.js').should.be.true();
        jsTest.fs.writeJSON.firstCall.args[1].scripts['test:unit'].should.match(/vitest run --globals/);
        jsTest.fs.writeJSON.firstCall.args[1].scripts.test.should.equal('yarn test:unit');
        jsTest.yarnInstall.firstCall.args[0].should.eql(['vitest', '@vitest/coverage-v8', 'sinon']);
    });

    it('writes node package structure and shipping scripts', function () {
        const Node = loadGenerator('node');
        const node = new Node([], {
            type: 'pkg',
            typescript: true,
            npmName: '@tryghost/demo',
            repoName: 'demo',
            repo: 'monorepo',
            org: 'TryGhost',
            public: true,
            desc: 'Demo package'
        });

        node.initializing();
        node.default();
        node.props.main.should.equal('./src/index.ts');
        node.fs.copyTpl.callCount.should.equal(4);
        node.fs.copyTpl.thirdCall.args[2].repo.should.eql({
            type: 'git',
            url: 'git+https://github.com/TryGhost/monorepo.git',
            directory: 'packages/demo'
        });

        node.fs.readJSON.returns({scripts: {test: 'yarn test'}});
        node.writing();
        node.fs.writeJSON.called.should.be.false();

        const app = new Node([], {
            type: 'app',
            npmName: 'demo',
            repoName: 'demo',
            org: 'TryGhost',
            public: false
        });
        app.initializing();
        app.default();
        app.fs.readJSON.returns({scripts: {test: 'yarn test'}});
        app.writing();
        app.fs.writeJSON.firstCall.args[1].scripts.ship.should.match(/yarn version/);
    });

    it('handles alternate prompt and composition branches', function () {
        const App = loadGenerator('app');
        const app = new App([], {name: 'demo', type: 'invalid', org: 'TryGhost'});
        app.initializing();
        app.promptAnswers = {
            type: 'pkg',
            public: false,
            desc: 'Demo',
            typescript: true
        };

        const appPrompting = app.prompting();
        app.prompts[0].when().should.be.true();
        app.prompts[1].when.should.be.true();
        app.prompts[2].when.should.be.true();
        app.prompts[3].when().should.be.false();

        return appPrompting.then(() => {
            app.prompts[0].when().should.be.false();
            app.prompts[3].when().should.be.false();

            app.default();
            app.composeWith.callCount.should.equal(5);

            const Node = loadGenerator('node');
            const node = new Node([], {
                type: 'module',
                npmName: 'demo',
                repoName: 'demo',
                org: 'TryGhost',
                public: true
            });
            node.initializing();
            node.promptAnswers = {type: 'app'};
            return node.prompting().then(() => {
                node.prompts[0].when().should.be.false();
                node.default();
                node.fs.copyTpl.firstCall.args[1].should.equal('index.js');
            });
        });
    });

    it('writes lerna and git root project files', function () {
        const mkdirp = sinon.spy();
        const Lerna = loadGenerator('lerna', {mkdirp});
        const lerna = new Lerna([], {
            public: true,
            org: 'TryGhost',
            scope: '@tryghost/',
            repoName: 'slimer'
        });

        lerna.initializing();
        lerna.props.scope.should.equal('@tryghost');
        lerna.configuring();
        lerna.default();
        lerna.fs.readJSON.returns({scripts: {test: 'yarn test'}});
        lerna.writing();

        mkdirp.calledWith('packages').should.be.true();
        lerna.fs.copyTpl.secondCall.args[2].scope.should.equal('@tryghost');
        lerna.fs.writeJSON.firstCall.args[1].scripts.ship.should.equal('lerna publish');

        const noPreship = new Lerna([], {
            public: false,
            org: 'TryGhost',
            scope: '@tryghost',
            repoName: 'slimer'
        });
        noPreship.initializing();
        noPreship.fs.readJSON.returns({scripts: {}});
        noPreship.writing();
        noPreship.fs.writeJSON.firstCall.args[1].scripts.should.not.have.property('preship');

        const GitRoot = loadGenerator('gitroot');
        const gitroot = new GitRoot([], {projectName: 'demo', extras: ['coverage']});
        gitroot.configuring();
        gitroot.end();

        gitroot.spawnCommandSync.calledWith('git', ['init', '--quiet', '-b', 'main']).should.be.true();
        gitroot.spawnCommandSync.calledWith('git', ['commit', '-m', '✨ Initial commit', '--quiet']).should.be.true();

        const customCommit = new GitRoot([], {projectName: 'demo'});
        customCommit.config.message = 'Initial';
        customCommit.end();
        customCommit.spawnCommandSync.calledWith('git', ['commit', '-m', 'Initial', '--quiet']).should.be.true();
    });

    it('writes license metadata for public and private projects', function () {
        const License = loadGenerator('license');
        const publicGenerator = new License([], {public: true, type: 'module'});
        publicGenerator.initializing();
        publicGenerator.fs.readJSON.returns({
            version: '1.0.0',
            private: true
        });
        publicGenerator.fs.read.returns('# Demo');
        publicGenerator.writing();
        publicGenerator.end();

        publicGenerator.fs.copyTpl.calledWith('template/LICENSE', 'LICENSE').should.be.true();
        publicGenerator.fs.writeJSON.firstCall.args[1].license.should.equal('MIT');
        publicGenerator.fs.writeJSON.firstCall.args[1].should.not.have.property('private');
        publicGenerator.fs.write.firstCall.args[1].should.match(/Released under the \[MIT license\]/);

        const privateGenerator = new License([], {public: false, type: 'module'});
        privateGenerator.initializing();
        privateGenerator.fs.readJSON.returns({
            version: '1.0.0',
            license: 'MIT'
        });
        privateGenerator.fs.read.returns('# Demo');
        privateGenerator.writing();
        privateGenerator.end();

        privateGenerator.fs.writeJSON.firstCall.args[1].private.should.be.true();
        privateGenerator.fs.write.firstCall.args[1].should.match(/closed-source/);

        const existingCopyright = new License([], {public: true, type: 'mono', internalPackages: true});
        existingCopyright.initializing();
        existingCopyright.fs.readJSON.returns({private: true});
        existingCopyright.fs.read.returns('# Demo\n\n# Copyright & License');
        existingCopyright.writing();
        existingCopyright.end();

        existingCopyright.fs.writeJSON.firstCall.args[1].private.should.be.true();
        existingCopyright.fs.write.called.should.be.false();

        const readmeWithCopyright = new License([], {public: true, type: 'module'});
        readmeWithCopyright.initializing();
        readmeWithCopyright.fs.readJSON.returns({
            version: '1.0.0',
            license: 'MIT'
        });
        readmeWithCopyright.fs.read.returns('# Demo\n\n# Copyright & License');
        readmeWithCopyright.writing();
        readmeWithCopyright.end();

        readmeWithCopyright.logs[0].should.match(/Unable to edit/);
    });

    it('updates existing React project metadata', function () {
        const React = loadGenerator('react');
        const react = new React([], {name: 'kg-editor', public: true});
        react.initializing();
        react.promptAnswers = {public: false};
        return react.prompting().then(() => {
            react.configuring();
            react.default();
            react.fs.readJSON.returns({version: '0.1.0'});
            react.fs.read.returns('Existing README');
            react.writing();
            react.end();

            react.props.projectName.should.equal('Koenig Editor');
            react.props.extras.should.containEql('build');
            react.composeWith.callCount.should.equal(3);
            react.fs.writeJSON.firstCall.args[1].repository.should.equal('git@github.com:TryGhost/kg-editor.git');
            react.fs.write.firstCall.args[1].should.startWith('# Koenig Editor');

            const existing = new React([], {name: 'editor', public: true});
            existing.initializing();
            existing.fs.readJSON.returns({
                version: '0.1.0',
                repository: 'git@github.com:TryGhost/editor.git',
                author: 'Ghost Foundation'
            });
            existing.fs.read.returns('# Editor\n\nExisting README');
            existing.writing();

            existing.fs.writeJSON.firstCall.args[1].repository.should.equal('git@github.com:TryGhost/editor.git');
            existing.fs.write.firstCall.args[1].should.equal('# Editor\n\nExisting README');
        });
    });
});
