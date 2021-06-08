const rules = [
  { type: 'feat', release: 'minor', title: 'New features' },
  { type: 'feature', release: 'minor', title: 'New features' },
  { type: 'fix', release: 'patch', title: 'Bug fixes' },
  { type: 'refactor', release: 'patch', title: 'Code changes' },
  { type: 'chore', release: 'patch', title: 'Other chores' },
  { type: 'docs', release: 'patch', title: 'Documentation changes' },
];

// Commit type to title mapping
const typeMap = Object.fromEntries(rules.map(rule => [rule.type, rule.title]));
// Commit title to order-index
const sortMap = Object.fromEntries(rules.map((rule, index) => [rule.title, index]));

module.exports = {
  branches: ['main'],
  tagFormat: '${version}',
  repositoryUrl: 'git@github.com:expo/vscode-expo.git',
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      releaseRules: rules.map(({ type, release }) => ({ type, release })),
    }],
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      writerOpts: {
        commitGroupsSort: (a, z) => sortMap[a.title] - sortMap[z.title],
        transform: (commit) => {
          commit.type = typeMap[commit.type.toLowerCase()] || commit.type;
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
