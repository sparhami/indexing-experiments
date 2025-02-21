module.exports = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", {}],
  },
  testMatch: ["**/src/**/*.test.ts"],
};
