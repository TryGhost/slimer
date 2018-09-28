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
