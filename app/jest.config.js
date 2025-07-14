const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // or .ts if using TS

    testEnvironment: 'jest-environment-jsdom',

    moduleNameMapper: {
        // ✅ Handle module aliases
        '^@/components/(.*)$': '<rootDir>/app/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^mini-event/(.*)$': '<rootDir>/src/$1', // Your alias

        // ✅ Style mocks
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};

module.exports = createJestConfig(customJestConfig);
