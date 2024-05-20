import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  roots: ['src'],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts)',
    '<rootDir>/tests/**/*.spec.(ts)',
  ],
  testRegex: ['/tests/.*.test.ts$', '/tests/.*.spec.ts$'],
  verbose: true,
};

export default config;
