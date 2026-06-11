const policies = {
    lts: [20, 22, 24],
    active: [20, 22, 24],
    current: [24],
    lts_active: [24],
    lts_latest: [24]
};

const defaultPolicy = 'lts';

const nodeEngines = '^20.11.1 || ^22.13.1 || ^24.0.0';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
