import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  preset: 'ts-jest',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@/tests/(.*)': '<rootDir>/tests/$1',
  },
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts)',
    '<rootDir>/tests/**/*.spec.(ts)',
    '<rootDir>/tests/*.test.(ts)',
    '<rootDir>/tests/*.spec.(ts)',
  ],
  verbose: true,
};

export default config;
