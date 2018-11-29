const debug = require('debug')('slimer:fs');
const findRoot = require('find-root');
const fs = require('fs-extra');
const path = require('path');

const fsUtils = {};

fsUtils.getRootDir = (currentDir) => {
    try {
        return findRoot(currentDir);
    } catch (e) {
        return currentDir;
    }
};

fsUtils.pathExists = (...args) => {
    return fs.existsSync(path.join(...args));
};

module.exports.isMonoPackage = () => {
    let rootDir = fsUtils.getRootDir(process.cwd());

    // If we are inside a package directory, we update rootDir
    // To be the mono repo root
    if (process.cwd() === rootDir) {
        let packagePath = path.resolve(rootDir, '../');
        if (/packages$/.test(packagePath)) {
            rootDir = fsUtils.getRootDir(packagePath);
        }
    }

    // It's only a mono package, if the lerna.json exists at the root
    // And the current dir is not the root
    if (fsUtils.pathExists(rootDir, 'lerna.json') && process.cwd() !== rootDir) {
        return true;
    }

    return false;
};

// Used to load config when creating a new package
module.exports.loadMonoConfig = () => {
    let rootDir = fsUtils.getRootDir(process.cwd());

    if (!fsUtils.pathExists(rootDir, 'lerna.json')) {
        return {};
    }

    let lernaJSON = require(path.join(rootDir, 'lerna.json'));
    let monoConfig = lernaJSON.local || {};

    monoConfig.type = 'pkg';
    monoConfig.path = path.join(rootDir, 'packages');

    debug('Loaded monoConfig', monoConfig);
    return monoConfig;
};
