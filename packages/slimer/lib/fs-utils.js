const findRoot = require('find-root');
const fs = require('fs-extra');
const path = require('path');

module.exports.getRootDir = (currentDir) => {
    try {
        return findRoot(currentDir);
    } catch (e) {
        return currentDir;
    }
};

module.exports.pathExists = (...args) => {
    return fs.existsSync(path.join(...args));
};