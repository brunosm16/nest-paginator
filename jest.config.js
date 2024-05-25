module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '<rootDir>/src/*.ts'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@/tests/(.*)': '<rootDir>/tests/$1',
  },
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
};
