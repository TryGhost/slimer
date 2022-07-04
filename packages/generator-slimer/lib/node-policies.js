const policies = {
    lts: [14, 16],
    active: [14, 15, 16],
    current: [17],
    lts_active: [16],
    lts_latest: [16]
};

const defaultPolicy = 'lts';

const nodeEngines = '^14.17.0 || ^16.13.0';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
