const rules = [
  { type: 'feat', release: 'minor', title: 'New features' },
  { type: 'feature', release: 'minor', title: 'New features' },
  { type: 'fix', release: 'patch', title: 'Bug fixes' },
  { type: 'refactor', release: 'patch', title: 'Code changes' },
  { type: 'chore', release: 'patch', title: 'Other chores' },
  { type: 'docs', release: 'patch', title: 'Documentation changes' },
];

module.exports = {
  branches: ['main'],
  tagFormat: '${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      releaseRules: rules.map(({ type, release }) => ({ type, release })),
    }],
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      writerOpts: {
        transform: (commit) => {
          const rule = rules.find(({ type }) => type === commit.type.toLowerCase());
          if (rule) {
            commit.type = rule.title;
          }
          return commit;
        },
      },
    }],
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/git', {
      message: 'chore: create new release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      assets: ['package.json', 'CHANGELOG.md'],
    }],
    '@semantic-release/github',
  ],
};
