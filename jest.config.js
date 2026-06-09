/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^swagger-express-easy$': '<rootDir>/lib/index.ts',
    '^swagger-express-easy/(.*)$': '<rootDir>/lib/$1',
  },
};
