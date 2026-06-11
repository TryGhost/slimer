require('./utils');

const os = require('os');
const path = require('path');
const nativeFs = require('fs');
const fs = require('fs-extra');

const fsUtils = require('../lib/fs-utils');

const makeTempDir = () => {
    return nativeFs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'slimer-test-')));
};

const writeJSON = (filePath, data) => {
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

describe('fs-utils', function () {
    let originalCwd;
    let tempDir;

    beforeEach(function () {
        originalCwd = process.cwd();
        tempDir = makeTempDir();
    });

    afterEach(function () {
        process.chdir(originalCwd);
        fs.removeSync(tempDir);
    });

    it('detects a lerna workspace package and loads mono config', function () {
        writeJSON(path.join(tempDir, 'package.json'), {
            name: 'root',
            workspaces: ['packages/*']
        });
        writeJSON(path.join(tempDir, 'lerna.json'), {
            local: {
                public: true,
                repo: 'https://github.com/TryGhost/slimer',
                scope: '@tryghost'
            }
        });
        writeJSON(path.join(tempDir, 'packages', 'demo', 'package.json'), {
            name: '@tryghost/demo'
        });
        process.chdir(path.join(tempDir, 'packages', 'demo'));

        fsUtils.isMonoPackage().should.be.true();
        fsUtils.isMonoRepo().should.be.false();
        process.chdir(tempDir);

        fsUtils.isMonoRepo().should.be.true();
        const monoConfig = fsUtils.loadMonoConfig();
        monoConfig.should.containEql({
            public: true,
            repo: 'https://github.com/TryGhost/slimer',
            scope: '@tryghost',
            type: 'pkg',
            workspaceManager: 'lerna'
        });
        monoConfig.path.should.equal(path.join(tempDir, 'packages'));

        process.chdir(path.join(tempDir, 'packages', 'demo'));
        fsUtils.getName().should.equal('@tryghost/demo');
        fsUtils.getType().should.equal('pkg');
    });

    it('detects yarn workspaces without lerna', function () {
        writeJSON(path.join(tempDir, 'package.json'), {
            name: 'root',
            repository: 'https://github.com/TryGhost/root.git',
            workspaces: ['packages/*'],
            monorepo: {
                public: false,
                repo: 'https://github.com/TryGhost/root',
                scope: '@tryghost'
            }
        });
        writeJSON(path.join(tempDir, 'packages', 'demo', 'package.json'), {
            name: '@tryghost/demo'
        });
        process.chdir(path.join(tempDir, 'packages', 'demo'));

        fsUtils.isMonoPackage().should.be.true();
        process.chdir(tempDir);

        const monoConfig = fsUtils.loadMonoConfig();
        monoConfig.should.containEql({
            public: false,
            repo: 'https://github.com/TryGhost/root',
            scope: '@tryghost',
            type: 'pkg',
            workspaceManager: 'yarn'
        });
        monoConfig.path.should.equal(path.join(tempDir, 'packages'));
    });

    it('reads repo metadata from package.json and falls back to cwd', function () {
        writeJSON(path.join(tempDir, 'package.json'), {
            name: 'service',
            main: 'app.js',
            repository: {
                type: 'git',
                url: 'git+https://github.com/TryGhost/service.git'
            }
        });
        process.chdir(tempDir);

        fsUtils.isMonoPackage().should.be.false();
        fsUtils.isMonoRepo().should.be.false();
        fsUtils.getType().should.equal('app');
        fsUtils.getRepo().should.eql({
            url: 'git+https://github.com/TryGhost/service.git',
            repo: 'TryGhost/service.git',
            org: 'TryGhost',
            name: 'service'
        });

        const noPackageDir = path.join(tempDir, 'NoPackage');
        fs.ensureDirSync(noPackageDir);
        process.chdir(noPackageDir);

        fsUtils.getFallbackRepo('TryGhost').should.eql({
            url: 'https://github.com/TryGhost/NoPackage.git',
            repo: 'TryGhost/NoPackage',
            name: 'NoPackage',
            org: 'TryGhost'
        });
    });

    it('falls back to module type when package.json has no app entry', function () {
        nativeFs.mkdirSync(path.join(tempDir, 'nested'));
        nativeFs.writeFileSync(path.join(tempDir, 'nested', 'file.txt'), 'ok');
        writeJSON(path.join(tempDir, 'nested', 'package.json'), {
            name: 'module',
            repository: 'https://github.com/TryGhost/module.git'
        });
        process.chdir(path.join(tempDir, 'nested'));

        fsUtils.getType().should.equal('module');
    });
});
