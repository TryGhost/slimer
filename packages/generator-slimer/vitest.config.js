const {defineConfig} = require('vitest/config');

module.exports = defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: [
                'generators/**/*.js',
                'lib/**/*.js'
            ],
            exclude: [
                'generators/**/templates/**'
            ],
            reporter: ['text', 'cobertura'],
            thresholds: {
                lines: 80,
                branches: 80,
                functions: 80,
                statements: 80
            }
        }
    }
});
