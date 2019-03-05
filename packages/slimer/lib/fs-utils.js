const debug = require('debug')('slimer:fs');
const findRoot = require('find-root');
const fs = require('fs-extra');
const path = require('path');
const isPublic = require('is-public');

const fsUtils = {};
const LERNA_FILENAME = 'lerna.json';
const PKG_FILENAME = 'package.json';

fsUtils.getRootDir = (currentDir) => {
    try {
        return findRoot(currentDir);
    } catch (e) {
        return currentDir;
    }
};

fsUtils.resolveRootDir = (currentDir) => {
    let rootDir = fsUtils.getRootDir(currentDir);
    // If we are inside a package directory, we update rootDir
    // To be the mono repo root
    if (process.cwd() === rootDir) {
        let packagePath = path.resolve(rootDir, '../');
        if (/packages$/.test(packagePath)) {
            rootDir = fsUtils.getRootDir(packagePath);
        }
    }

    return rootDir;
};

fsUtils.pathExists = (...args) => {
    return fs.existsSync(path.join(...args));
};

fsUtils.isMonoPackage = () => {
    let rootDir = fsUtils.resolveRootDir(process.cwd());

    // It's only a mono package, if the lerna.json exists at the root
    // And the current dir is not the root
    if (fsUtils.pathExists(rootDir, LERNA_FILENAME) && process.cwd() !== rootDir) {
        return true;
    }

    return false;
};

fsUtils.isMonoRepo = () => {
    // We don't use resolve, because we deliberately only want to know if we are at the top level
    let rootDir = fsUtils.getRootDir(process.cwd());

    if (!fsUtils.pathExists(rootDir, LERNA_FILENAME)) {
        return false;
    }

    return true;
};

// Used to load config when creating a new package
// @TODO: why don't we need to resolve the root dir here?
fsUtils.loadMonoConfig = () => {
    let rootDir = fsUtils.getRootDir(process.cwd());

    if (!fsUtils.pathExists(rootDir, LERNA_FILENAME)) {
        return {};
    }

    let lernaJSON = require(path.join(rootDir, LERNA_FILENAME));
    let monoConfig = lernaJSON.local || {};

    monoConfig.type = 'pkg';
    monoConfig.path = path.join(rootDir, 'packages');

    debug('Loaded monoConfig', monoConfig);
    return monoConfig;
};

fsUtils.loadPkgConfig = () => {
    let rootDir = fsUtils.resolveRootDir(process.cwd());

    if (!fsUtils.pathExists(rootDir, PKG_FILENAME)) {
        return {};
    }

    return require(path.join(rootDir, PKG_FILENAME));
};

fsUtils.isPublic = async () => {
    let pkgJSON = fsUtils.loadPkgConfig();
    let repoUrl = pkgJSON.repository.url || pkgJSON.repository;
    let repo = repoUrl.match(/github\.com\/(.*)?$/)[1];

    return await isPublic(repo);
};

module.exports = {
    loadMonoConfig: fsUtils.loadMonoConfig,
    isMonoPackage: fsUtils.isMonoPackage,
    isMonoRepo: fsUtils.isMonoRepo,
    isPublic: fsUtils.isPublic
};
