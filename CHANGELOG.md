## [0.5.0](https://github.com/expo/vscode-expo/compare/0.4.0...0.5.0) (2021-06-08)


### New features

* add previews to ejected native files (#45) ([](https://github.com/expo/vscode-expo/commit/5228f00ca0107c87c6888b15f8c4feaa5099cb13)), closes [#45](https://github.com/expo/vscode-expo/issues/45)


### Code changes

* scope clear module to project modules only (#48) ([](https://github.com/expo/vscode-expo/commit/d49214cc67d0113a02fc96e98249f9dca972cfd4)), closes [#48](https://github.com/expo/vscode-expo/issues/48)


### Other chores

* add proper group sorting to changelog ([](https://github.com/expo/vscode-expo/commit/02e9634c10c1f51f84b03f2917bb11a0d9bc8c8f))
* bump dns-packet from 1.3.1 to 1.3.4 (#44) ([](https://github.com/expo/vscode-expo/commit/c036581fc67b1f4158bdd91bb2c3e45322c7ef12)), closes [#44](https://github.com/expo/vscode-expo/issues/44)
* clean up linting issue in create completion item ([](https://github.com/expo/vscode-expo/commit/63d2f5dfdc46fbd76d07cb24c9c5880ab103d783))
* fix typo in release workflow name ([](https://github.com/expo/vscode-expo/commit/8fa7e502c2039b40f9414901131e1eb4e6bb1808))
* remove duplicated repository url ([](https://github.com/expo/vscode-expo/commit/a2a6f0a4c692bd5217e0e82e2f103d8a499e0777))
* setup up automated release flow and usage documentation (#43) ([](https://github.com/expo/vscode-expo/commit/8e2ae190a23deda22e3e88eaed6edb889bbd7717)), closes [#43](https://github.com/expo/vscode-expo/issues/43)

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 0.4.0 (2021-05-27)

#### New features

* auto-complete paths for plugins and assets ([#41](https://github.com/expo/vscode-expo/pull/41))

### 0.3.0 (2021-05-20)

#### New features

* link to assets and file references ([#39](https://github.com/expo/vscode-expo/pull/39))

#### Other chores

* Bump to node 12 ([#40](https://github.com/expo/vscode-expo/pull/40))

### 0.2.2 (2021-05-10)

#### Bug fixes

* add webpack ignore patch to dynamic config plugins import ([#33](https://github.com/expo/vscode-expo/pull/33))
* webpack memory issues on github actions ([#37](https://github.com/expo/vscode-expo/pull/37))

#### Code changes

* update all dependencies to latest versions ([#32](https://github.com/expo/vscode-expo/pull/32))
* swap master for main branch ([de5685d](https://github.com/expo/vscode-expo/commit/de5685d2dcd3ff8048a3e6922d6d23b54ad24ce5))

#### Other chores

* bump hosted-git-info from 2.8.8 to 2.8.9 ([#34](https://github.com/expo/vscode-expo/pull/34))
* bump url-parse from 1.4.7 to 1.5.1 ([#35](https://github.com/expo/vscode-expo/pull/35))
* add manual trigger to production build test ([d816bf7](https://github.com/expo/vscode-expo/commit/d816bf7e175d79fea4996f3010714436f49dfb56))
* add manual trigger to test workflow ([b3ad41c](https://github.com/expo/vscode-expo/commit/b3ad41cbe574fe29123ebc4d1e7b0d7e47851380))

### 0.2.1 (2021-05-07)

> This version is a rollback to `0.1.2` because of issues in `0.2.0`. No tag exist because it's the exact content of `0.1.2`.

### 0.2.0 (2021-05-07)

#### New features

* add support for config plugins ([#30](https://github.com/expo/vscode-expo/pull/25))

#### Documentation changes

* update the readme with new features and authors ([c76f328](https://github.com/expo/vscode-expo/commit/c76f3289dcf3980e355286db11fea998b9642061))

### 0.1.2 (2020-09-30)

#### Bug fixes

* handle definitions from xdl schema properly ([#25](https://github.com/expo/vscode-expo/pull/25))

### 0.1.1 (2020-08-30)

#### Bug fixes

* add missing bare workflow notes to schema ([#20](https://github.com/expo-community/vscode-expo/pull/20))

#### Code changes

* use expo universe eslint configuration ([#18](https://github.com/expo-community/vscode-expo/pull/18))
* use custom branding with expo logo ([#19](https://github.com/expo-community/vscode-expo/pull/19))

#### Documentation changes

* add overview animation for the extension ([#21](https://github.com/expo-community/vscode-expo/pull/21))
* update short description to match name ([539fe5f](https://github.com/expo-community/vscode-expo/commit/539fe5ff64b39c0cfb5b4e26761ae7a44210a092))
* update logo path to default branch ([d3c1125](https://github.com/expo-community/vscode-expo/commit/d3c11257f48dbfea472acba6f4b6554dc466dd0a))

#### Other chores

* add missing test when failing to enhance schema ([#15](https://github.com/expo-community/vscode-expo/pull/13))


### 0.1.0 (2020-08-25)

#### New features

* render schema description as markdown ([#13](https://github.com/expo-community/vscode-expo/pull/13))

#### Other chores

* add integrated vscode tests with jest ([#14](https://github.com/expo-community/vscode-expo/pull/14))


### 0.0.4 (2020-08-17)

#### Documentation changes

* add link to marketplace in usage ([4440142](https://github.com/expo-community/vscode-expo/commit/44401424ada710f4c8a2fdd56eced62965e16213))
* add contributors using all-contributors ([f7e3138](https://github.com/expo-community/vscode-expo/commit/f7e3138fdb61d350126c3412a048a178aa492b69), [5a84d63](https://github.com/expo-community/vscode-expo/commit/5a84d637f85d1a77897d1988b12bb4e55ff1ae63))

#### Other chores

* add expo icon ([#4](https://github.com/expo-community/vscode-expo/pull/4))
* bump websocket-extensions from 0.1.3 to 0.1.4 ([#5](https://github.com/expo-community/vscode-expo/pull/5))
* bump npm-registry-fetch from 8.0.2 to 8.1.1 ([#6](https://github.com/expo-community/vscode-expo/pull/6))
* bump elliptic from 6.5.2 to 6.5.3 ([#8](https://github.com/expo-community/vscode-expo/pull/8))
* deploy from ci and improve performance ([#9](https://github.com/expo-community/vscode-expo/pull/9))


### 0.0.3 (2020-05-13)

#### Code changes

* fine tune the pipelines ([5ce065c](https://github.com/expo-community/vscode-expo/commit/5ce065cc3610d037baf056e331854a0e3158942b))
* clean up repository files and prepare publish ([99de851](https://github.com/expo-community/vscode-expo/commit/99de851ab530a27fb7ae66f355c11b568456cdd4))
* switch to expo community organisation ([99479bc](https://github.com/expo-community/vscode-expo/commit/99479bc995b4054b6d28394b4f28ee206792d4b1))
* add webpack to compile to single file ([f445881](https://github.com/expo-community/vscode-expo/commit/f44588187d22354ea60443e38eae7ed216000736))

#### Other chores

* add repository configuration files ([8562e92](https://github.com/expo-community/vscode-expo/commit/8562e924f2ba5c8823a2940be9cb0ea88dff118c))


### 0.0.2 (2020-05-06)

#### Bug fixes

* use empty array if json.schemas is not set ([cc51ef6](https://github.com/expo-community/vscode-expo/commit/cc51ef6a3a06c5dae6b01c5809aad5719239e248))


### 0.0.1 (2020-05-06)

#### New features

* created first draft of vscode-expo ([420afa1](https://github.com/expo-community/vscode-expo/commit/420afa1b090b3a5fefa2a587f399a7db26473bbd))


### 0.0.0 (2020-05-03)

#### Other chores

* inital project setup ([bf1127f](https://github.com/expo-community/vscode-expo/commit/bf1127fee592d8b6e93b708c54b3f986593b45f1))
