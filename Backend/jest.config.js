module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "services/**/*.js",
    "utils/**/*.js",
    "validators/**/*.js",
    "!sockets/**/*.js",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
  ],
};
