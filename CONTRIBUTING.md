# Contributing to vscode-expo

## 📦 Download and Setup

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device. (`git remote add upstream git@github.com:expo/vscode-expo.git` 😉)
2. Make sure you have the following packages globally installed on your system:
   - [node](https://nodejs.org/) (active Node LTS or higher is recommended)
   - [npm](https://npmjs.com/)
3. Install the Node packages (`npm install`)

## 🚗 Start the plugin in development mode

In vscode, go to "Run and debug" and pick `Run Extension (development)`.

This will open up a new vscode window with the plugin loaded from source.
When changing code, it will auto-update and initialize the plugin in this window.

## 🏎️ Start the plugin in production mode

Because we want the plugin to install almost instantaneously, we avoid dependencies.
Everything is compiled to a single JS file and embedded within the plugin.

To test if the code is working using a single JS file, pick `Run Extension (production)`.

## ✅ Testing

Testing is done using [Jest](https://jestjs.io/https://jestjs.io/) within vscode.

You can try this locally by running `Extension Tests`.
In CI we are running tests with the oldest supported version ([see test workflow](https://github.com/expo/vscode-expo/blob/main/.github/workflows/test.yml#L10)), latest stable, and latest insider.

## 📝 Writing a Commit Message

> If this is your first time committing to a large public repo, you could look through this neat tutorial: ["How to Write a Git Commit Message"](https://chris.beams.io/posts/git-commit/)

Commit messages are formatted using the [Conventional Commits](https://www.conventionalcommits.org/) format.

```
docs: fix typo in xxx
feature: add support for SDK 40
chore: add test-case for custom completions
fix: improve logging for errors
refactor: update loading icon
```

## 🔎 Before Submitting a PR

To help keep CI green, please make sure of the following:

- Run `npm run lint -- --fix` to fix the formatting of the code. Ensure that `npm run lint` succeeds without errors or warnings.
- Run `npm run build` to ensure the build runs correctly and without errors or warnings.
- Run `npm run build:production` to ensure the build runs correctly and without errors or warnings, in production mode.

## 🚀 Releasing a new version

We have multiple workflows working together to publish a new release to the vscode marketplace.

1. The `Release` workflow generates a new version based on the commits.
  - This is a manually triggered workflow.
  - This will also update the changelog, package, tags, and publish a new release to github.
2. The `Publish` workflow builds and submits a new version to vscode marketplace.
  - This is triggered once a new release is created on github.
  - It builds the project in production mode and sends it to the vscode marketplace.
