module.exports = {
  ignorePatterns: ['node_modules/**', 'out/**', 'test/fixture/**'],
  extends: 'universe/node',
  overrides: [
    {
      files: ['*.test.ts', '*.e2e.ts'],
      rules: {
        // Chai uses patterns such as `expect(true).to.be.true`
        'no-unused-expressions': 'off',
      },
    },
  ],
};
