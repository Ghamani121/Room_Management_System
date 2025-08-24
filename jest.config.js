// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    './src/**/*.ts', // Tell Jest to cover all .ts files in src
  ],
  coverageDirectory: './coverage', // Where to output the reports
};