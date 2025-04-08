const policies = {
    lts: [18, 20, 22],
    active: [18, 20, 22],
    current: [23],
    lts_active: [22],
    lts_latest: [22]
};

const defaultPolicy = 'lts';

const nodeEngines = '^18.12.1 || ^20.11.1 || ^22.13.1';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
