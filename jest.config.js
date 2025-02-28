/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
      "^(\\.{1,2}/src/ts/.*)\\.js$": "$1.ts"
  },  
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"]
};