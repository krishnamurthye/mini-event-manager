// jest.config.ts
import { defaultsESM } from 'ts-jest/presets';
import type { Config } from 'jest';

const config: Config = {
  ...defaultsESM,
  preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
    globals: {
        'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json',
    },
    },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],

  rootDir: 'src', // Or 'src' if your TS rootDir is src
  transformIgnorePatterns: ['node_modules/(?!(your-esm-lib)/)'], // optional

};

export default config;
