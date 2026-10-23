import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { sourceMaps: 'inline' }],
  },
  moduleNameMapper: {
    '^@sentdm/voice-client-react$': '<rootDir>/packages/voice-client-react/src/index.ts',
    '^@sentdm/voice-client-core$': '<rootDir>/packages/voice-client-core/src/index.ts',
    '^@sentdm/voice-client$': '<rootDir>/packages/voice-client/src/index.ts',
    '^@sentdm/voice-client/(.*)$': '<rootDir>/packages/voice-client/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/packages/[^/]+/dist/'],
  testPathIgnorePatterns: ['scripts'],
  setupFiles: ['<rootDir>/packages/voice-client-core/tests/setup-exchange.ts'],
};

export default config;
