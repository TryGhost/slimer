const policies = {
    lts: [16, 18],
    active: [16, 18, 20],
    current: [19],
    lts_active: [18],
    lts_latest: [18]
};

const defaultPolicy = 'lts';

const nodeEngines = '^16.13.0 || ^18.12.1';

module.exports = {
    defaultPolicy,
    policies,
    nodeEngines
};
