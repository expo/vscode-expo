module.exports = {
  ignorePatterns: ['node_modules/**', 'out/**', 'test/fixture/**'],
  extends: 'universe/node',
  overrides: [
    {
      files: ['*.test.ts', '*.e2e.ts'],
      rules: {
        // Chai uses patterns such as `expect(true).to.be.true`
        'no-unused-expressions': 'off',
        // Allow unused parameters starting with `_`, mostly for tests
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
      },
    },
  ],
};
