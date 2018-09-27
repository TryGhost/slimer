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

module.exports.findMonoRoot = () => {
    let rootDir = fsUtils.getRootDir(process.cwd());

    if (!fsUtils.pathExists(rootDir, 'lerna.json')) {
        return false;
    }

    return path.join(rootDir, 'packages');
};
