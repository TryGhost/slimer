const policies = {
    lts: [12, 14, 16],
    active: [14, 15, 16],
    current: [17],
    lts_active: [16],
    lts_latest: [16]
};

const defaultPolicy = 'lts';

const nodeEngines = '^12.10.0 || ^14.17.0 || ^16.13.0';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
