const policies = {
    lts: [10, 12],
    active: [10, 12, 13],
    current: [13],
    lts_active: [10, 12],
    lts_latest: [12]
};

const defaultPolicy = 'lts';

const nodeEngines = '^10.21.0 || ^12.18.0';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
