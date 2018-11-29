/**
 * This isn't guaranteed to work in lots of cases,
 * but should work for producing consistent pkgjson files etc
 */
const _ = require('lodash');

module.exports = (obj, after, newKey, newValue) => {
    const newObj = {};

    _.each(obj, (value, key) => {
        newObj[key] = value;
        if (key === after) {
            newObj[newKey] = newValue;
        }
    });

    return newObj;
};
