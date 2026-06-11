const {defineConfig} = require('vitest/config');

module.exports = defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: [
                'index.js',
                'lib/**/*.js',
                'commands/**/*.js'
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
