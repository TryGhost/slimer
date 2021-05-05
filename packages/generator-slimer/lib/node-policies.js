const policies = {
    lts: [12, 14],
    active: [14, 15, 16],
    current: [15, 16],
    lts_active: [14],
    lts_latest: [14]
};

const defaultPolicy = 'lts';

const nodeEngines = '^12.10.0 || ^14.15.0';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
