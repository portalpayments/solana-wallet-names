/** @type {import('ts-jest').JestConfigWithTsJest} */

const SECONDS = 1000;

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // Most of the time the services are <2 secs, but sometimes they're slow
  // and we don't want to fail tests because of that.
  testTimeout: 8 * SECONDS,
};
