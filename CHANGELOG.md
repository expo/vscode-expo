## [1.5.0](https://github.com/expo/vscode-expo/compare/1.4.3...1.5.0) (2024-03-13)


### New features

* add more infers to determine device platform when debugging ([#260](https://github.com/expo/vscode-expo/issues/260)) ([d89a982](https://github.com/expo/vscode-expo/commit/d89a9825fed42aaa086ffbe46104b93701bbb1ce))


### Bug fixes

* add `workspace.fs.stat` error handling when files are missing ([#259](https://github.com/expo/vscode-expo/issues/259)) ([a5c6199](https://github.com/expo/vscode-expo/commit/a5c6199e11909ea2003e197563fab69a2ee2f245))
* use optional chaining when validating relative paths in manifest asset completions ([#258](https://github.com/expo/vscode-expo/issues/258)) ([ee37364](https://github.com/expo/vscode-expo/commit/ee37364b97f39a2f327aea80489feafc0bdfc56d))

## [1.4.3](https://github.com/expo/vscode-expo/compare/1.4.2...1.4.3) (2024-03-12)


### Bug fixes

* fallback to device name when platform cant be derrived ([4aa895b](https://github.com/expo/vscode-expo/commit/4aa895b19056da6f24b9c705333e9afd63b25d8c))

## [1.4.2](https://github.com/expo/vscode-expo/compare/1.4.1...1.4.2) (2024-03-10)


### Bug fixes

* activate extension after startup is finished ([#257](https://github.com/expo/vscode-expo/issues/257)) ([fd07af8](https://github.com/expo/vscode-expo/commit/fd07af825767591c4e599361b923292057f9722d))
* use proper vsix file name when adding to github release ([1b88b19](https://github.com/expo/vscode-expo/commit/1b88b194e45abbadffb137e5506b49dc946f823c))


### Code changes

* only re-fetch config when affected ([#256](https://github.com/expo/vscode-expo/issues/256)) ([f5a2986](https://github.com/expo/vscode-expo/commit/f5a2986db374869cc53bcf27cb32d23cf1271429))

## [1.4.1](https://github.com/expo/vscode-expo/compare/1.4.0...1.4.1) (2024-03-09)


### Bug fixes

* set `GH_TOKEN` when adding artifact to release ([8ef750e](https://github.com/expo/vscode-expo/commit/8ef750eb5d945e98e722cc354073a87e18925700))


### Code changes

* project quality of life improvements ([#254](https://github.com/expo/vscode-expo/issues/254)) ([deeca27](https://github.com/expo/vscode-expo/commit/deeca27cc4290ef02d4f793ce5189dd18cf023ec))

## [1.4.0](https://github.com/expo/vscode-expo/compare/1.3.0...1.4.0) (2024-03-08)


### New features

* use `vscode.workspace.fs` API to load Expo projects ([#252](https://github.com/expo/vscode-expo/issues/252)) ([5a596d1](https://github.com/expo/vscode-expo/commit/5a596d1415b225b69036fb4d8d1ffd99330e8722))


### Code changes

* add tests and replace minimatch with picomatch ([#248](https://github.com/expo/vscode-expo/issues/248)) ([519d179](https://github.com/expo/vscode-expo/commit/519d179991700ad84369f15240e02347577f69f9))


### Other chores

* bump all workflow actions to latest versions ([#250](https://github.com/expo/vscode-expo/issues/250)) ([5a4bf25](https://github.com/expo/vscode-expo/commit/5a4bf257705e9b0de13d8dcaedef47f798f4416c))
* bump minimal required vscode version ([#249](https://github.com/expo/vscode-expo/issues/249)) ([6c789b8](https://github.com/expo/vscode-expo/commit/6c789b8f749946118ced0cd66adc7c5bb0e32e3d))
* enable tests for vscode insiders versions ([#253](https://github.com/expo/vscode-expo/issues/253)) ([036af2b](https://github.com/expo/vscode-expo/commit/036af2bf33f7f77b6b02cb142e659218f9e78cba))
* use composite action to resolve exact npm package version ([#251](https://github.com/expo/vscode-expo/issues/251)) ([2d0efa6](https://github.com/expo/vscode-expo/commit/2d0efa620bc9b75cfad27a07fe5572d6b8e93b3a))

## [1.3.0](https://github.com/expo/vscode-expo/compare/1.2.2...1.3.0) (2024-03-06)


### New features

* support React Native `0.74` logical device id when debugging ([#247](https://github.com/expo/vscode-expo/issues/247)) ([97555e7](https://github.com/expo/vscode-expo/commit/97555e7969cb0ca27a29606400275b34a304d413))


### Code changes

* **fixtures:** upgrade all fixtures to SDK 50 ([#246](https://github.com/expo/vscode-expo/issues/246)) ([feceea4](https://github.com/expo/vscode-expo/commit/feceea42cc1309cfd0d498f4623ad632bed33a7e))

## [1.2.2](https://github.com/expo/vscode-expo/compare/1.2.1...1.2.2) (2024-03-06)


### Bug fixes

* add `userAgent` query parameter in debugger ([#237](https://github.com/expo/vscode-expo/issues/237)) ([7c978e5](https://github.com/expo/vscode-expo/commit/7c978e537c2e3c625e7b37d819d1b47d66e56a3a))
* bump `@vscode/test-electron` to `2.3.9` ([913cb7f](https://github.com/expo/vscode-expo/commit/913cb7fb13186eafecae2270004890544c3bd13c))
* only change to underlying vscode adapter when starting debug session ([#245](https://github.com/expo/vscode-expo/issues/245)) ([7a3190f](https://github.com/expo/vscode-expo/commit/7a3190fa7fbcf45f2b69990c82517d69b5ba54ea)), closes [microsoft/vscode#188979](https://github.com/microsoft/vscode/issues/188979)


### Other chores

* bump @babel/traverse from 7.22.11 to 7.23.2 ([#233](https://github.com/expo/vscode-expo/issues/233)) ([2047870](https://github.com/expo/vscode-expo/commit/2047870550beb7e26ab9d02a67af6b7edef5cc62))
* bump @babel/traverse from 7.22.11 to 7.23.2 in /test/fixture ([#232](https://github.com/expo/vscode-expo/issues/232)) ([51d7292](https://github.com/expo/vscode-expo/commit/51d7292cde8d6fc0001a50b4ce54f2719a039931))
* bump postcss from 8.4.29 to 8.4.31 in /test/fixture ([#230](https://github.com/expo/vscode-expo/issues/230)) ([a3ecf90](https://github.com/expo/vscode-expo/commit/a3ecf90fef1a07c7354c318ca696d51cc05b5aad))
* bump react-devtools-core from 4.28.0 to 4.28.4 in /test/fixture ([#234](https://github.com/expo/vscode-expo/issues/234)) ([747d308](https://github.com/expo/vscode-expo/commit/747d308d819956ce27246e00ee5f6056f14a218a))
* **ci:** rotate and update repository secrets ([#236](https://github.com/expo/vscode-expo/issues/236)) ([3fba51a](https://github.com/expo/vscode-expo/commit/3fba51a22ce8f5d221b32cef324b9dd585393f26))

## [1.2.1](https://github.com/expo/vscode-expo/compare/1.2.0...1.2.1) (2023-09-04)


### Bug fixes

* resolve the project "realpath" on Windows to avoid drive letter mismatch in sourcemap ([#227](https://github.com/expo/vscode-expo/issues/227)) ([f20d7b7](https://github.com/expo/vscode-expo/commit/f20d7b7c6bd4760c2bfcdb876401879f0267f5d3))

## [1.2.0](https://github.com/expo/vscode-expo/compare/1.1.0...1.2.0) (2023-09-04)


### New features

* diagnose manifest with dirty or changed documents ([#225](https://github.com/expo/vscode-expo/issues/225)) ([82c8dd3](https://github.com/expo/vscode-expo/commit/82c8dd303d151f917ca68ec50c2a023bfacae0ed))
* use `npx expo config` to generate preview data ([#223](https://github.com/expo/vscode-expo/issues/223)) ([640de3a](https://github.com/expo/vscode-expo/commit/640de3a23bc1be4f946fadd1d3aa4718a766243e))


### Bug fixes

* manually resolve absolute file paths with `__dirname` ([7f4951e](https://github.com/expo/vscode-expo/commit/7f4951eea81469ceea0aaff61d2d7f22b60a55d5))
* upgrade `schema-expo-module` script to `expo@49` ([#219](https://github.com/expo/vscode-expo/issues/219)) ([a610842](https://github.com/expo/vscode-expo/commit/a61084253234663c96623c5dd11618627fa6815f))


### Code changes

* emphasize bundled `@expo/*` packages and limit imports ([#222](https://github.com/expo/vscode-expo/issues/222)) ([0bd601d](https://github.com/expo/vscode-expo/commit/0bd601d974e8b53143718e54ea4a320428266894))


### Other chores

* disable `global.expect` workaround for `chai` ([324933c](https://github.com/expo/vscode-expo/commit/324933cea956a822237885d4d891e61be112575c))
* drop `npm run install:fixture` in favor of vscode task for windows ([6a624da](https://github.com/expo/vscode-expo/commit/6a624daed40d4ee379a4395470ef196a47560e03))
* fail when no tests are found ([8eda594](https://github.com/expo/vscode-expo/commit/8eda59447cc6efbcee396d02f8b9932377db8a44))
* re-enable windows tests on ci ([a782b4e](https://github.com/expo/vscode-expo/commit/a782b4ec920acd88898c2a2110d482463086ace3))
* test activation and remove useless activation event ([#221](https://github.com/expo/vscode-expo/issues/221)) ([b4dec03](https://github.com/expo/vscode-expo/commit/b4dec031f7a964f54109da90899d15e08782ee19))
* unify snapshot behavior on CI and local testing ([#224](https://github.com/expo/vscode-expo/issues/224)) ([bdd2efe](https://github.com/expo/vscode-expo/commit/bdd2efe6848061022611231f01eac51699f10738))

## [1.1.0](https://github.com/expo/vscode-expo/compare/1.0.7...1.1.0) (2023-09-01)


### New features

* allow `expo.*` properties as root properties without `expo` definition ([#217](https://github.com/expo/vscode-expo/issues/217)) ([c71ccbc](https://github.com/expo/vscode-expo/commit/c71ccbce468b8139767e7caf687333d3b615fb14))


### Bug fixes

* downgrade conventional commit preset for semantic release ([d392f89](https://github.com/expo/vscode-expo/commit/d392f8981b3d5edcc9721f85e3354ce206ccf6af))
* replace yarn with npm due to issues with `@isaacs/cliui` ([#209](https://github.com/expo/vscode-expo/issues/209)) ([f046f1d](https://github.com/expo/vscode-expo/commit/f046f1d10ea25d7c3d8bdf5267d114b958778179))


### Code changes

* bump minimum vscode version to `1.78.2` ([#211](https://github.com/expo/vscode-expo/issues/211)) ([602946c](https://github.com/expo/vscode-expo/commit/602946c774f9b2abac604fbc311850bd46fee790))
* consolidate the testing fixtures ([#218](https://github.com/expo/vscode-expo/issues/218)) ([fe00632](https://github.com/expo/vscode-expo/commit/fe00632b43bfe08386e4ff8debe82f58c67c917c))
* use mocha instead of jest to avoid crashes and other issues ([#208](https://github.com/expo/vscode-expo/issues/208)) ([92352ac](https://github.com/expo/vscode-expo/commit/92352ac29a5cc2fdb43c4a3c8ed41a934167a8cb))
* use proper `dependencies` instead of `devDependencies` only ([#214](https://github.com/expo/vscode-expo/issues/214)) ([d0f60eb](https://github.com/expo/vscode-expo/commit/d0f60ebfc14980184cdbc5a46697bfd87c2ffc02))


### Other chores

* add missing `permissions` to github workflow when dry-running release ([#205](https://github.com/expo/vscode-expo/issues/205)) ([7a78a92](https://github.com/expo/vscode-expo/commit/7a78a927b008cf9c45069651e856facd36088e07))
* add prerelease support in publish workflow ([6f8240e](https://github.com/expo/vscode-expo/commit/6f8240efad150fbd1b5594d5cef1f0aa4737744c))
* allow dry-run to test push verification in release workflow ([a9b6c92](https://github.com/expo/vscode-expo/commit/a9b6c92ad9f3781ae01cebc7621a84f6bf3c4aec))
* clean up log-clutter in test output ([#215](https://github.com/expo/vscode-expo/issues/215)) ([9f03f24](https://github.com/expo/vscode-expo/commit/9f03f24fbb0b36d6016484dd5d41132b15fd7ca2))
* clean up typo in `.gitignore` ([3bb248d](https://github.com/expo/vscode-expo/commit/3bb248d0bec51157320dbb03591c376960b8c098))
* clean up yarn-specific workarounds ([36093a0](https://github.com/expo/vscode-expo/commit/36093a083f16c2175f6e24b3bbd0a9a4d9e37875))
* emphasize the creation of a release instead of publish ([0eed055](https://github.com/expo/vscode-expo/commit/0eed055c3872ca90dbe5e3076f15b3fcf1d586f5))
* upgrade tooling to latest versions ([#212](https://github.com/expo/vscode-expo/issues/212)) ([0324b10](https://github.com/expo/vscode-expo/commit/0324b1099087626a42c0d92b1b1546959c867784))
* use authenticated Expo bot user for schema updates ([c91af9c](https://github.com/expo/vscode-expo/commit/c91af9cbf535ce7a8d87925da8747a4c4f756471))

## [1.0.7](https://github.com/expo/vscode-expo/compare/1.0.6...1.0.7) (2023-07-24)


### Bug fixes

* add missing `bundlerPort` for `remoteRoot` when debugging apps ([#204](https://github.com/expo/vscode-expo/issues/204)) ([ef670d3](https://github.com/expo/vscode-expo/commit/ef670d36d0fe7c182efb9335d9e6958802180453))


### Other chores

* bump semver from 5.7.1 to 5.7.2 in /test/fixture ([#201](https://github.com/expo/vscode-expo/issues/201)) ([1d890b8](https://github.com/expo/vscode-expo/commit/1d890b854930139a46fbfa48ee26de66bf1dc500))
* bump tough-cookie from 4.1.2 to 4.1.3 ([#200](https://github.com/expo/vscode-expo/issues/200)) ([05f5905](https://github.com/expo/vscode-expo/commit/05f59057ffd8c7f9b3e4ab650dfba3f8189c1cee))
* bump word-wrap from 1.2.3 to 1.2.4 ([#202](https://github.com/expo/vscode-expo/issues/202)) ([4a663d9](https://github.com/expo/vscode-expo/commit/4a663d984c4bb43b22b47a9c796d8ebb1444ab57))
* bump word-wrap from 1.2.3 to 1.2.4 in /test/fixture ([#203](https://github.com/expo/vscode-expo/issues/203)) ([16743d4](https://github.com/expo/vscode-expo/commit/16743d4f345476c487cdd490f74ec51d4b6bbf42))

## [1.0.6](https://github.com/expo/vscode-expo/compare/1.0.5...1.0.6) (2023-07-03)


### Bug fixes

* send the debugger type to inspector proxy ([#198](https://github.com/expo/vscode-expo/issues/198)) ([07fa7e5](https://github.com/expo/vscode-expo/commit/07fa7e54d594922ea23d4b2ff79c5522da306cf6))

## [1.0.5](https://github.com/expo/vscode-expo/compare/1.0.4...1.0.5) (2023-07-01)


### Other chores

* update debugging snippet using `8081` as default port ([#197](https://github.com/expo/vscode-expo/issues/197)) ([523beb2](https://github.com/expo/vscode-expo/commit/523beb22a71b304cda753c12d37c13c53d110d65))

## [1.0.4](https://github.com/expo/vscode-expo/compare/1.0.3...1.0.4) (2023-06-30)


### Bug fixes

* add missing `ms-vscode.js-debug` dependency and activate in expo monorepos ([#196](https://github.com/expo/vscode-expo/issues/196)) ([27b5550](https://github.com/expo/vscode-expo/commit/27b5550b7aa4ed3d384ce0a0a07e19162108ca2f)), closes [#L2-L5](https://github.com/expo/vscode-expo/issues/L2-L5)
* filter duplicate devices on first occurence ([#195](https://github.com/expo/vscode-expo/issues/195)) ([4e47403](https://github.com/expo/vscode-expo/commit/4e47403d72a0d3c9908f1497e0a5a3a5c89833d9))

## [1.0.3](https://github.com/expo/vscode-expo/compare/1.0.2...1.0.3) (2023-06-30)


### Bug fixes

* mute `react-devtools-core` sourcemap missing error ([#194](https://github.com/expo/vscode-expo/issues/194)) ([a4ffd16](https://github.com/expo/vscode-expo/commit/a4ffd1683999429b62d2c088458bae51954b7aa8))


### Other chores

* simplify and automate publish workflow ([56645de](https://github.com/expo/vscode-expo/commit/56645dec85f843509351e3bd7821da433bc08058))
* treat all fixtures as non-monorepo projects ([#192](https://github.com/expo/vscode-expo/issues/192)) ([ca83156](https://github.com/expo/vscode-expo/commit/ca83156cc9918b2edaf185921a157e7ca90dee7a))

## [1.0.2](https://github.com/expo/vscode-expo/compare/1.0.1...1.0.2) (2023-06-26)


### Bug fixes

* replace unreliable workflow detection with multiple connection attempts ([#188](https://github.com/expo/vscode-expo/issues/188)) ([24b358c](https://github.com/expo/vscode-expo/commit/24b358cae7a1bd08ae458c83a152ec9c2d27bcd6))


### Other chores

* bump @sideway/formula from 3.0.0 to 3.0.1 in /test/fixture ([#169](https://github.com/expo/vscode-expo/issues/169)) ([1950dcb](https://github.com/expo/vscode-expo/commit/1950dcb747c2b2ed8e53bbb7bf3cf2ba2e40fabc))
* bump @xmldom/xmldom from 0.7.5 to 0.7.11 ([#184](https://github.com/expo/vscode-expo/issues/184)) ([ac4b5fb](https://github.com/expo/vscode-expo/commit/ac4b5fb680f1a520b05954cb6bbba5abb5c53a1e))
* bump @xmldom/xmldom from 0.7.5 to 0.7.11 in /test/fixture ([#182](https://github.com/expo/vscode-expo/issues/182)) ([9c2ec33](https://github.com/expo/vscode-expo/commit/9c2ec3369c913a8bc152b4138d9dcb4dbcb7f1dc))
* bump semver from 7.3.7 to 7.5.2 ([#187](https://github.com/expo/vscode-expo/issues/187)) ([1607e59](https://github.com/expo/vscode-expo/commit/1607e59e85658c629e403a6acebdf6d1ff41dbbd))
* enable `contents` for drafting releases in release process ([022a753](https://github.com/expo/vscode-expo/commit/022a7530fe87b857e6febb6754b071e42c095891))
* fix broken link in changelog ([e89b3f0](https://github.com/expo/vscode-expo/commit/e89b3f03f0b8fd885b19f8ad3434ae4467ca828b))
* revert back to single `expo-bot` token ([493b93b](https://github.com/expo/vscode-expo/commit/493b93bbbdfd88234a670923b9bb4398a40a1340))
* separate `expo-bot` and automatic tokens in release process ([23b93ce](https://github.com/expo/vscode-expo/commit/23b93ce1ce3be65d4d4636f1123b245b68826bec))
* use `expo-bot` when cloning during release process ([d9cdd74](https://github.com/expo/vscode-expo/commit/d9cdd74f9f6991fe37a14084c0bb5eaada267ed0))
* use `expo-bot` when releasing new versions ([ed510c2](https://github.com/expo/vscode-expo/commit/ed510c2270e34d3404c80a4b5058f69c69cae654))


### Documentation changes

* update link to `open-vsx.org` ([957fce0](https://github.com/expo/vscode-expo/commit/957fce0f60faa2f29757f3e4c5507b0807a9dc5b))

## [1.0.1](https://github.com/expo/vscode-expo/compare/1.0.0...1.0.1) (2023-06-06)

### New features

* add debugger for Expo apps using Hermes ([#172](https://github.com/expo/vscode-expo/issues/172)) ([67f33c2](https://github.com/expo/vscode-expo/commit/67f33c25c9a2878cdbe04c2d803a556c6481a3d1))
* add expo project cache for efficient json parsing ([#141](https://github.com/expo/vscode-expo/issues/141)) ([01cc8e3](https://github.com/expo/vscode-expo/commit/01cc8e384348e4cfc9550a7499f6ed296cae0765))
* add manifest plugin completion provider ([#146](https://github.com/expo/vscode-expo/issues/146)) ([55a0c83](https://github.com/expo/vscode-expo/commit/55a0c83a2d639b7743ff8a406c386f821c94d422))

### Bug fixes

* always diagnose plugins from an empty modules cache ([#168](https://github.com/expo/vscode-expo/issues/168)) ([d900dc7](https://github.com/expo/vscode-expo/commit/d900dc78c1706c0e56ce5561d199b22c2933a71c))

### Code changes

* drop outdated manifest related code ([#151](https://github.com/expo/vscode-expo/issues/151)) ([312cc49](https://github.com/expo/vscode-expo/commit/312cc49ed8bf8909f61ec339adf6446be368dd91))
* drop superseded utilities from code preview ([#161](https://github.com/expo/vscode-expo/issues/161)) ([bc45d50](https://github.com/expo/vscode-expo/commit/bc45d502a06a2b920cc8f332de57681d949de248))
* drop unused code after dropping most superseded code ([#154](https://github.com/expo/vscode-expo/issues/154)) ([1b2339a](https://github.com/expo/vscode-expo/commit/1b2339a489d90876f36ccf9227b9a9aa6240662c))
* move asset property regex to constant ([d63557a](https://github.com/expo/vscode-expo/commit/d63557a1d34694a7236c166b45ba4e32e3814f30))
* move manifest asset completions to dedicated provider ([#153](https://github.com/expo/vscode-expo/issues/153)) ([52a2e17](https://github.com/expo/vscode-expo/commit/52a2e177674929b74aeecd2aafcc9a4cc3aad59e))
* move manifest diagnostics to dedicated provider  ([#145](https://github.com/expo/vscode-expo/issues/145)) ([634bc2b](https://github.com/expo/vscode-expo/commit/634bc2bc45a058e889c02dc5e75f5f9f89475ad9))
* move manifest links to dedicated provider ([#142](https://github.com/expo/vscode-expo/issues/142)) ([5759073](https://github.com/expo/vscode-expo/commit/5759073bea[309](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:310)a1f6a1777411cc188bbe23cbcf5))
* reformat package file moving vscode settings below standard npm ([91b429f](https://github.com/expo/vscode-expo/commit/91b429f8d32b32f5bd7adf7f6e605d0813e50053))
* update tests with new tricks to improve stability and performance ([#155](https://github.com/expo/vscode-expo/issues/155)) ([c7daf51](https://github.com/expo/vscode-expo/commit/c7daf51968e7aed575388554428c54b99fec5062))
* upgrade various development packages ([#158](https://github.com/expo/vscode-expo/issues/158)) ([38080ab](https://github.com/expo/vscode-expo/commit/38080ab62b0affc0a5267cacca69f12846b4fb23))
* change publisher to expo ([#174](https://github.com/expo/vscode-expo/issues/174)) ([747f1f7](https://github.com/expo/vscode-expo/commit/747f1f730a97f29a2aa52982fe08536e2d8593c8))
* change the name to vscode-expo-tools to publish under expo ([a69e264](https://github.com/expo/vscode-expo/commit/a69e26441fd27f0045d95adb1d245161b82d041b))

### Documentation changes

* add section about debugging in the readme ([#177](https://github.com/expo/vscode-expo/issues/177)) ([45509b1](https://github.com/expo/vscode-expo/commit/45509b1065a4ddd1acb7daef9792706f4a033baf))

### Other chores

* add current file test launch option ([#143](https://github.com/expo/vscode-expo/issues/143)) ([664baf3](https://github.com/expo/vscode-expo/commit/664baf3be6f6381[322](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:323)d28818b21bf1b5a1617b44))
* bump decode-uri-component from 0.2.0 to 0.2.2 ([#149](https://github.com/expo/vscode-expo/issues/149)) ([f841233](https://github.com/expo/vscode-expo/commit/f8412337e126d5e5bd35983cb349024c5b02ffa7))
* bump decode-uri-component from 0.2.0 to 0.2.2 in /test/fixture ([#150](https://github.com/expo/vscode-expo/issues/150)) ([22ea7f3](https://github.com/expo/vscode-expo/commit/22ea7f325c07561ec5456b72d854afcde11d71e0))
* bump http-cache-semantics from 4.1.0 to 4.1.1 ([#165](https://github.com/expo/vscode-expo/issues/165)) ([d12c951](https://github.com/expo/vscode-expo/commit/d12c9511d1bafe067d97568aa3c3024782854986))
* bump json5 from 2.2.1 to 2.2.2 ([#157](https://github.com/expo/vscode-expo/issues/157)) ([e9fb1c9](https://github.com/expo/vscode-expo/commit/e9fb1c92e8dc06ac7fc34f35a373c72aa706c76a))
* bump loader-utils from 1.4.0 to 1.4.2 ([#148](https://github.com/expo/vscode-expo/issues/148)) ([fbaf2c8](https://github.com/expo/vscode-expo/commit/fbaf2c88045c7995fb7049a430d0f73dc6d6ed15))
* bump ua-parser-js from 0.7.31 to 0.7.33 in /test/fixture ([#163](https://github.com/expo/vscode-expo/issues/163)) ([7144c18](https://github.com/expo/vscode-expo/commit/7144c1818c22088d53763a2cd058cfd236bf131f))
* bump vscode to min 1.67.0 ([#144](https://github.com/expo/vscode-expo/issues/144)) ([40f1d9f](https://github.com/expo/vscode-expo/commit/40f1d9f95b2353b33e5e19acb7c54c57[324](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:325)3fcd0))
* bump webpack from 5.74.0 to 5.76.0 ([#167](https://github.com/expo/vscode-expo/issues/167)) ([74e8a7a](https://github.com/expo/vscode-expo/commit/74e8a7a62c96ad896077374605188f004d79a2cb))
* re-enable all manifest diagnostic tests ([365d417](https://github.com/expo/vscode-expo/commit/365d417bd0f16957c0ec0ad0829e3d61fedf1acc))
* upgrade to latest vsce and support prerelease publish ([#162](https://github.com/expo/vscode-expo/issues/162)) ([cbd4360](https://github.com/expo/vscode-expo/commit/cbd43609fbbdbfa0c362af30a6a4cb962869adbe))
* **ci**: improve workflow check names in pull requests ([2109f57](https://github.com/expo/vscode-expo/commit/2109f5756fcfe0f8db4542e84c83b4a9a5eba6ab))
* improve telemetry around debugging ([#173](https://github.com/expo/vscode-expo/issues/173)) ([0a12ac3](https://github.com/expo/vscode-expo/commit/0a12ac3b6fea09b6b0be872dae0f7338756e3be3))
* fix wrong input property name in publish workflow ([b8ed21f](https://github.com/expo/vscode-expo/commit/b8ed21ffdc1bc163b1a858308a7e2a0e140a7dcc))
* move continue-on-error to failing test in experimental workflow ([50c0e3b](https://github.com/expo/vscode-expo/commit/50c0e3b6d8bbf4596c789ce0f379f603552034c5))
* swap to coactions/setup-xvfb for more stable headless vscode tests ([#176](https://github.com/expo/vscode-expo/issues/176)) ([f9d24da](https://github.com/expo/vscode-expo/commit/f9d24da4101b6ac783aed2a62fa4c6e9f15c4530))

## [1.0.0](https://github.com/expo/vscode-expo/compare/0.9.2...1.0.0) (2023-04-28)

### New features

* add debugger for Expo apps using Hermes ([#172](https://github.com/expo/vscode-expo/issues/172)) ([67f33c2](https://github.com/expo/vscode-expo/commit/67f33c25c9a2878cdbe04c2d803a556c6481a3d1))
* add expo project cache for efficient json parsing ([#141](https://github.com/expo/vscode-expo/issues/141)) ([01cc8e3](https://github.com/expo/vscode-expo/commit/01cc8e384348e4cfc9550a7499f6ed296cae0765))
* add manifest plugin completion provider ([#146](https://github.com/expo/vscode-expo/issues/146)) ([55a0c83](https://github.com/expo/vscode-expo/commit/55a0c83a2d639b7743ff8a406c386f821c94d422))

### Bug fixes

* always diagnose plugins from an empty modules cache ([#168](https://github.com/expo/vscode-expo/issues/168)) ([d900dc7](https://github.com/expo/vscode-expo/commit/d900dc78c1706c0e56ce5561d199b22c2933a71c))

### Code changes

* drop outdated manifest related code ([#151](https://github.com/expo/vscode-expo/issues/151)) ([312cc49](https://github.com/expo/vscode-expo/commit/312cc49ed8bf8909f61ec339adf6446be368dd91))
* drop superseded utilities from code preview ([#161](https://github.com/expo/vscode-expo/issues/161)) ([bc45d50](https://github.com/expo/vscode-expo/commit/bc45d502a06a2b920cc8f332de57681d949de248))
* drop unused code after dropping most superseded code ([#154](https://github.com/expo/vscode-expo/issues/154)) ([1b2339a](https://github.com/expo/vscode-expo/commit/1b2339a489d90876f36ccf9227b9a9aa6240662c))
* move asset property regex to constant (d63557a (https://github.com/expo/vscode-expo/commit/d63557a1d34694a7236c166b45ba4e32e3814f30))
* move manifest asset completions to dedicated provider ([#153](https://github.com/expo/vscode-expo/issues/153)) ([52a2e17](https://github.com/expo/vscode-expo/commit/52a2e177674929b74aeecd2aafcc9a4cc3aad59e))
* move manifest diagnostics to dedicated provider  ([#145](https://github.com/expo/vscode-expo/issues/145)) ([634bc2b](https://github.com/expo/vscode-expo/commit/634bc2bc45a058e889c02dc5e75f5f9f89475ad9))
* move manifest links to dedicated provider ([#142](https://github.com/expo/vscode-expo/issues/142)) ([5759073](https://github.com/expo/vscode-expo/commit/5759073bea[309](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:310)a1f6a1777411cc188bbe23cbcf5))
* reformat package file moving vscode settings below standard npm (91b429f (https://github.com/expo/vscode-expo/commit/91b429f8d32b32f5bd7adf7f6e605d0813e50053))
* update tests with new tricks to improve stability and performance ([#155](https://github.com/expo/vscode-expo/issues/155)) ([c7daf51](https://github.com/expo/vscode-expo/commit/c7daf51968e7aed575388554428c54b99fec5062))
* upgrade various development packages ([#158](https://github.com/expo/vscode-expo/issues/158)) ([38080ab](https://github.com/expo/vscode-expo/commit/38080ab62b0affc0a5267cacca69f12846b4fb23))

### Other chores

* add current file test launch option ([#143](https://github.com/expo/vscode-expo/issues/143)) ([664baf3](https://github.com/expo/vscode-expo/commit/664baf3be6f6381[322](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:323)d28818b21bf1b5a1617b44))
* bump decode-uri-component from 0.2.0 to 0.2.2 ([#149](https://github.com/expo/vscode-expo/issues/149)) ([f841233](https://github.com/expo/vscode-expo/commit/f8412337e126d5e5bd35983cb349024c5b02ffa7))
* bump decode-uri-component from 0.2.0 to 0.2.2 in /test/fixture ([#150](https://github.com/expo/vscode-expo/issues/150)) ([22ea7f3](https://github.com/expo/vscode-expo/commit/22ea7f325c07561ec5456b72d854afcde11d71e0))
* bump http-cache-semantics from 4.1.0 to 4.1.1 ([#165](https://github.com/expo/vscode-expo/issues/165)) ([d12c951](https://github.com/expo/vscode-expo/commit/d12c9511d1bafe067d97568aa3c3024782854986))
* bump json5 from 2.2.1 to 2.2.2 ([#157](https://github.com/expo/vscode-expo/issues/157)) ([e9fb1c9](https://github.com/expo/vscode-expo/commit/e9fb1c92e8dc06ac7fc34f35a373c72aa706c76a))
* bump loader-utils from 1.4.0 to 1.4.2 ([#148](https://github.com/expo/vscode-expo/issues/148)) ([fbaf2c8](https://github.com/expo/vscode-expo/commit/fbaf2c88045c7995fb7049a430d0f73dc6d6ed15))
* bump ua-parser-js from 0.7.31 to 0.7.33 in /test/fixture ([#163](https://github.com/expo/vscode-expo/issues/163)) ([7144c18](https://github.com/expo/vscode-expo/commit/7144c1818c22088d53763a2cd058cfd236bf131f))
* bump vscode to min 1.67.0 ([#144](https://github.com/expo/vscode-expo/issues/144)) ([40f1d9f](https://github.com/expo/vscode-expo/commit/40f1d9f95b2353b33e5e19acb7c54c57[324](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:325)3fcd0))
* bump webpack from 5.74.0 to 5.76.0 ([#167](https://github.com/expo/vscode-expo/issues/167)) ([74e8a7a](https://github.com/expo/vscode-expo/commit/74e8a7a62c96ad896077374605188f004d79a2cb))
* re-enable all manifest diagnostic tests (365d417 (https://github.com/expo/vscode-expo/commit/365d417bd0f16957c0ec0ad0829e3d61fedf1acc))
* upgrade to latest vsce and support prerelease publish ([#162](https://github.com/expo/vscode-expo/issues/162)) ([cbd4360](https://github.com/expo/vscode-expo/commit/cbd43609fbbdbfa0c362af30a6a4cb962869adbe))
* **ci**: improve workflow check names in pull requests ([2109f57](https://github.com/expo/vscode-expo/commit/2109f5756fcfe0f8db4542e84c83b4a9a5eba6ab))
* improve telemetry around debugging ([#173](https://github.com/expo/vscode-expo/issues/173)) ([0a12ac3](https://github.com/expo/vscode-expo/commit/0a12ac3b6fea09b6b0be872dae0f7338756e3be3))

### Documentation changes

* add comments for individual chunks of code ([#152](https://github.com/expo/vscode-expo/issues/152)) ([a70da3b](https://github.com/expo/vscode-expo/commit/a70da3bf574e7e[325](https://github.com/expo/vscode-expo/actions/runs/4699771689/jobs/8333643841#step:4:326)7f4209152f3a3a69c571b8e))
* update readme workflow status badge ([38eba2b](https://github.com/expo/vscode-expo/commit/38eba2bd85ec0cbb41de7bd5aed2da935e840ec3))


## [0.9.2](https://github.com/expo/vscode-expo/compare/0.9.1...0.9.2) (2022-10-25)


### Bug fixes

* app manifest asset linking ([#140](https://github.com/expo/vscode-expo/issues/140)) ([6a8d176](https://github.com/expo/vscode-expo/commit/6a8d176e6192c56eaad89d62500cd74c0b258f28))

## [0.9.1](https://github.com/expo/vscode-expo/compare/0.9.0...0.9.1) (2022-10-13)


### Bug fixes

* set `null` as default for exclude glob patterns ([#138](https://github.com/expo/vscode-expo/issues/138)) ([5403474](https://github.com/expo/vscode-expo/commit/5403474b10326b7b2b1c44caefb2a8f066987a5b))
* set language for app manifests and eas to jsonc ([#137](https://github.com/expo/vscode-expo/issues/137)) ([665983b](https://github.com/expo/vscode-expo/commit/665983be9cd8b0df909c6db8fae413f75525d2ff))


### Code changes

* use node lookup method instead of custom code ([#134](https://github.com/expo/vscode-expo/issues/134)) ([866d5c7](https://github.com/expo/vscode-expo/commit/866d5c7fdc6732e84b12a653a4de4eb981379afa))

## [0.9.0](https://github.com/expo/vscode-expo/compare/0.8.1...0.9.0) (2022-09-03)


### New features

* add configuration options to the extension ([#132](https://github.com/expo/vscode-expo/issues/132)) ([3b2d38b](https://github.com/expo/vscode-expo/commit/3b2d38b73e348f40d5c27426e5be05789ed8b566))


### Bug fixes

* set command category instead of in title ([#133](https://github.com/expo/vscode-expo/issues/133)) ([3dcd3b3](https://github.com/expo/vscode-expo/commit/3dcd3b39f498f8896d28c6086a28b685bd7e8420))


### Other chores

* add option to disable cache ([#130](https://github.com/expo/vscode-expo/issues/130)) ([f166546](https://github.com/expo/vscode-expo/commit/f166546a267b217560ccb6a2a1dd851cd373c696))
* add telemetry to extension ([#131](https://github.com/expo/vscode-expo/issues/131)) ([b61108e](https://github.com/expo/vscode-expo/commit/b61108e884008eec69a5b09418c17534706f035e))
* keep running tests even when one fails ([7a41f41](https://github.com/expo/vscode-expo/commit/7a41f41e5ab5eb053fd1a27252959af9d81bc026))
* make publish runnable from manual tag ([50b4c68](https://github.com/expo/vscode-expo/commit/50b4c68e2458d6122bad8d36516e1683b5c02a56))
* remove unsued configuration ([11a6ab9](https://github.com/expo/vscode-expo/commit/11a6ab96b9efddc330bb4746912598fb043c1f3d))
* simplify publish workflow ([c6abad2](https://github.com/expo/vscode-expo/commit/c6abad245aafdc37cbafc1f1d456e4880eb0f1dd))


### Documentation changes

* update readme links ([ef8b999](https://github.com/expo/vscode-expo/commit/ef8b999e095a14b1a2460e43ebc0afe15f3303c6))

## [0.8.1](https://github.com/expo/vscode-expo/compare/0.8.0...0.8.1) (2022-08-31)


### Code changes

* remove old global config manifest code ([#124](https://github.com/expo/vscode-expo/issues/124)) ([5b4d675](https://github.com/expo/vscode-expo/commit/5b4d675dc8b4d097b4471ea9ee3182c081a767ba))
* update components and minor refactors ([#129](https://github.com/expo/vscode-expo/issues/129)) ([e31dc08](https://github.com/expo/vscode-expo/commit/e31dc08d2eeadeb6898f32a11c5a052da51135c8))


### Other chores

* add automated eas schema workflow ([#126](https://github.com/expo/vscode-expo/issues/126)) ([6fa5182](https://github.com/expo/vscode-expo/commit/6fa5182b9b1666a96ab32bf5075f29a4cb9ca03e))
* bump terser from 5.9.0 to 5.14.2 ([#123](https://github.com/expo/vscode-expo/issues/123)) ([4dc492e](https://github.com/expo/vscode-expo/commit/4dc492e8ac2b3d1a1e52257b5a8399f7672393ad))
* only commit schema changes when actually changed ([#125](https://github.com/expo/vscode-expo/issues/125)) ([55fdf49](https://github.com/expo/vscode-expo/commit/55fdf49cd4a2e1047df58829a6a13a834e908025))


### Documentation changes

* rework the header of the readme ([#128](https://github.com/expo/vscode-expo/issues/128)) ([92079ac](https://github.com/expo/vscode-expo/commit/92079ac8bef7ba7767fdc8b657d828bb03287f13))

## [0.8.0](https://github.com/expo/vscode-expo/compare/0.7.4...0.8.0) (2022-07-18)


### New features

* add eas config intellisense ([#116](https://github.com/expo/vscode-expo/issues/116)) ([124aa68](https://github.com/expo/vscode-expo/commit/124aa684daa386c04e7f6665e72a2a78098e8954))
* add expo-module.config.json intellisense ([#114](https://github.com/expo/vscode-expo/issues/114)) ([a8024dd](https://github.com/expo/vscode-expo/commit/a8024dd1f460c0ae95db265e5394b761f97b152f))
* add human-readable regex error messages for expo xdl ([#122](https://github.com/expo/vscode-expo/issues/122)) ([61605be](https://github.com/expo/vscode-expo/commit/61605be3eb16c525530612259745467495867d58))
* add intellisense for eas metadata ([#108](https://github.com/expo/vscode-expo/issues/108)) ([d50bd86](https://github.com/expo/vscode-expo/commit/d50bd86c7f5fdf82e8fcc568568f712d8ee45ef9))
* prepare the json schemas in repository ([#107](https://github.com/expo/vscode-expo/issues/107)) ([2d567ac](https://github.com/expo/vscode-expo/commit/2d567acbbfac69abd304b7ad37bb1d26b846d5c6))


### Bug fixes

* add workaround for package json fetch from autolinking ([#118](https://github.com/expo/vscode-expo/issues/118)) ([d4812c8](https://github.com/expo/vscode-expo/commit/d4812c8baa542f2ddde6f238988cd7c8d0109fed))
* enable expo xdl intellisense on app.config.json ([#111](https://github.com/expo/vscode-expo/issues/111)) ([94cda4b](https://github.com/expo/vscode-expo/commit/94cda4ba2b8d4056f2dde53855feaa03149f97a3))
* extend the bundled autolinking workaround ([#120](https://github.com/expo/vscode-expo/issues/120)) ([1475a84](https://github.com/expo/vscode-expo/commit/1475a848f5b5353edeca3eddf19ea33959bf1c1a))
* preview modifiers for dynamic config apps ([#121](https://github.com/expo/vscode-expo/issues/121)) ([0c3f357](https://github.com/expo/vscode-expo/commit/0c3f3575b11b31d6f21409b5516c9f50f2d915cd))
* remove autogenerated xdl schema properties ([#100](https://github.com/expo/vscode-expo/issues/100)) ([a285503](https://github.com/expo/vscode-expo/commit/a28550359d78e171f55d9399518be880e8c2828d))


### Other chores

* add e2e tests for existing functionality ([#119](https://github.com/expo/vscode-expo/issues/119)) ([29c29e8](https://github.com/expo/vscode-expo/commit/29c29e81087ac250babf26b9be38ea2b1f8b8ccb))
* add publish to open-vsx ([#112](https://github.com/expo/vscode-expo/issues/112)) ([d80c518](https://github.com/expo/vscode-expo/commit/d80c51852e647432041c85612a6bbf7f025faf73))
* always dry-run release on push to main ([b9dc3ed](https://github.com/expo/vscode-expo/commit/b9dc3edb505b90d0533240aa048d1e1a335d9771))
* bump eventsource from 1.1.0 to 1.1.1 ([#96](https://github.com/expo/vscode-expo/issues/96)) ([acad5cd](https://github.com/expo/vscode-expo/commit/acad5cdff2942a4773ecfca84c391e1988ce1037))
* bump follow-redirects from 1.14.5 to 1.14.7 ([#85](https://github.com/expo/vscode-expo/issues/85)) ([5bfeb9d](https://github.com/expo/vscode-expo/commit/5bfeb9de0addef66c7e9774c1238b4b0b3c86a05))
* bump follow-redirects from 1.14.7 to 1.15.1 ([#103](https://github.com/expo/vscode-expo/issues/103)) ([b75e70e](https://github.com/expo/vscode-expo/commit/b75e70e43355b5dd51fb6750a07ea20d7ddd26f0))
* bump minimist from 1.2.5 to 1.2.6 ([#93](https://github.com/expo/vscode-expo/issues/93)) ([31745d4](https://github.com/expo/vscode-expo/commit/31745d4cddd223bb39d70f142f17799765a633c5))
* bump node-fetch from 2.6.6 to 2.6.7 ([#88](https://github.com/expo/vscode-expo/issues/88)) ([7cc64d9](https://github.com/expo/vscode-expo/commit/7cc64d9953432b36c33d1f9810ec1aea913c9029))
* bump semantic-release from 17.4.7 to 19.0.3 ([#99](https://github.com/expo/vscode-expo/issues/99)) ([0d3dd56](https://github.com/expo/vscode-expo/commit/0d3dd564cf1c45fa6fdcfd6235b0a92d58745365))
* bump semver-regex from 3.1.3 to 3.1.4 ([#98](https://github.com/expo/vscode-expo/issues/98)) ([4f24ce9](https://github.com/expo/vscode-expo/commit/4f24ce9200a25b2f05f57d07b3fd3729529ba953))
* bump simple-get from 3.1.0 to 3.1.1 ([#89](https://github.com/expo/vscode-expo/issues/89)) ([0a25efc](https://github.com/expo/vscode-expo/commit/0a25efc5741b35e00d3ac141cd951ad9c3be919d))
* bump simple-plist from 1.3.0 to 1.3.1 ([#97](https://github.com/expo/vscode-expo/issues/97)) ([ce69fea](https://github.com/expo/vscode-expo/commit/ce69feac5aca1ba9a1d0e8812180b58d5644792e))
* bump url-parse from 1.5.3 to 1.5.10 ([#92](https://github.com/expo/vscode-expo/issues/92)) ([0646296](https://github.com/expo/vscode-expo/commit/0646296b4bf2b1dccb7d067097158fb46179e539))
* clean metadata from package file ([06c4364](https://github.com/expo/vscode-expo/commit/06c43644568bef6887846d7569ba36add3f619b6))
* fix issue in xdl schema manual update ([6100163](https://github.com/expo/vscode-expo/commit/610016319f82c705fd0500d5b15e81cbd64d290e))
* make sure fixtures are installed before testing ([fbbe1a9](https://github.com/expo/vscode-expo/commit/fbbe1a9aae4faa269cddd88158e350112db3858f))
* remove build workflow in favor of test ([3aff929](https://github.com/expo/vscode-expo/commit/3aff9299c27a33740ed8305efb06c311f2eda0b8))
* update workflows with concurrency ([#86](https://github.com/expo/vscode-expo/issues/86)) ([6304121](https://github.com/expo/vscode-expo/commit/6304121f2d90161b15a26f2884c475b80dc0645e))
* upgrade all expo dependencies ([#109](https://github.com/expo/vscode-expo/issues/109)) ([de3494e](https://github.com/expo/vscode-expo/commit/de3494e663649616991ad18b242cd0266bf71780))
* upgrade eslint and prettier ([#106](https://github.com/expo/vscode-expo/issues/106)) ([6b56124](https://github.com/expo/vscode-expo/commit/6b5612408923faf090651d8cd1a875ba1801f262))
* upgrade node in workflows and use default setup action ([#104](https://github.com/expo/vscode-expo/issues/104)) ([6b6f0a5](https://github.com/expo/vscode-expo/commit/6b6f0a5ec960f9306c907dab50c4c8b08d176b0b))
* upgrade semantic release and dependencies ([#105](https://github.com/expo/vscode-expo/issues/105)) ([4a7553c](https://github.com/expo/vscode-expo/commit/4a7553c6c8286161b65fc5d242d3e9ac5f38dd99))
* upgrade vsce to 2.9.2 ([#110](https://github.com/expo/vscode-expo/issues/110)) ([21e6213](https://github.com/expo/vscode-expo/commit/21e6213bba1c80bb6860732f8a279c494fe76133))
* upgrade vscode test to improve ci stability ([#102](https://github.com/expo/vscode-expo/issues/102)) ([5fc58d5](https://github.com/expo/vscode-expo/commit/5fc58d5efaa0e86b06b9c41464030e3acdbeaa88))
* use allowlist for packaging the plugin ([04f79ea](https://github.com/expo/vscode-expo/commit/04f79ea1a8e8f1018a17512f25a105010868262f))


### Documentation changes

* add marketplace and open-vsx links ([cd10333](https://github.com/expo/vscode-expo/commit/cd10333411c795529f7c1d36a367a4fe75b6df56))
* fix typo in app config file ([#82](https://github.com/expo/vscode-expo/issues/82)) ([b3eaaeb](https://github.com/expo/vscode-expo/commit/b3eaaeba617780d59f0f2ac11d020de4a33655cb))
* fix typo in README ([5996763](https://github.com/expo/vscode-expo/commit/59967637314ba32f756896c73d2b434cf81fc10e))
* replace oldest supported version with link to workflow ([5d8481e](https://github.com/expo/vscode-expo/commit/5d8481e4be8a2bf03ffb338801c90f566bc6c32f))
* update repo organization to expo ([15d0ebb](https://github.com/expo/vscode-expo/commit/15d0ebbbe3ec6c834aa0d2e7f4e87eb8884b5e2f))
* update vscode casing in the README ([d8fd837](https://github.com/expo/vscode-expo/commit/d8fd83745b3c1891a406330635b991b1b0b1a9e3))
* update workflow badge in readme ([0a97081](https://github.com/expo/vscode-expo/commit/0a9708153bbc26766b37bae881f89b7ef48a3d94))
* use gray for open-vsx badge ([0751086](https://github.com/expo/vscode-expo/commit/075108626a91b893b76891912c47468ea711a2cc))

### [0.7.4](https://github.com/expo/vscode-expo/compare/0.7.3...0.7.4) (2021-11-10)


### Bug fixes

* activate extension after vscode is ready ([#76](https://github.com/expo/vscode-expo/issues/76)) ([0fe92da](https://github.com/expo/vscode-expo/commit/0fe92da055324d3daad748c32c0fa006d1a76e29))
* config plugin validation by upgrading dependencies ([#68](https://github.com/expo/vscode-expo/issues/68)) ([d3b1853](https://github.com/expo/vscode-expo/commit/d3b1853e03699a048102b2c18012ab0baf9a6665))
* parse file paths as uri as file explicitly ([#78](https://github.com/expo/vscode-expo/issues/78)) ([de6a331](https://github.com/expo/vscode-expo/commit/de6a3316cb134e063a3ec762e7a231345f338396))
* remove required expo root from app json file ([#74](https://github.com/expo/vscode-expo/issues/74)) ([785bf3a](https://github.com/expo/vscode-expo/commit/785bf3a75a570a13937c2573338c318f911be7d4))


### Code changes

* swap esbuild for sucrase ([#71](https://github.com/expo/vscode-expo/issues/71)) ([bf12211](https://github.com/expo/vscode-expo/commit/bf122110a2280f4e03d23b145a7e01bc627e9a9d))


### Other chores

* add package as release assets for open-source usage ([#77](https://github.com/expo/vscode-expo/issues/77)) ([97d9ad3](https://github.com/expo/vscode-expo/commit/97d9ad3a0c46b817596501aac7b7be2b28294617))
* bump path-parse from 1.0.6 to 1.0.7 ([#60](https://github.com/expo/vscode-expo/issues/60)) ([a037f53](https://github.com/expo/vscode-expo/commit/a037f53192722d4c92b64c0e319fc1240009ed1b))
* bump semver-regex from 3.1.2 to 3.1.3 ([#70](https://github.com/expo/vscode-expo/issues/70)) ([be73f8a](https://github.com/expo/vscode-expo/commit/be73f8aff8c3b481014eaa3389a5b6fbd9ed2427))
* bump tmpl from 1.0.4 to 1.0.5 ([#69](https://github.com/expo/vscode-expo/issues/69)) ([74cd121](https://github.com/expo/vscode-expo/commit/74cd121146194763d7991373f8a795d75fd1fb1b))
* bump url-parse from 1.5.1 to 1.5.3 ([#65](https://github.com/expo/vscode-expo/issues/65)) ([da50dcd](https://github.com/expo/vscode-expo/commit/da50dcd0819545ce38ed32acdcac2df8b8e7540f))
* upgrade all dependencies ([#75](https://github.com/expo/vscode-expo/issues/75)) ([96c90c4](https://github.com/expo/vscode-expo/commit/96c90c43a64a24e2eea93a60a76873c17bd31ecd))


### Documentation changes

* clean up header of readme ([#79](https://github.com/expo/vscode-expo/issues/79)) ([bab44c6](https://github.com/expo/vscode-expo/commit/bab44c6643f78cc0fbc5107fac00cd1965f86911))

### [0.7.3](https://github.com/expo/vscode-expo/compare/0.7.2...0.7.3) (2021-08-06)


### Bug fixes

* missing required libraries and make webpack work with xdl ([#59](https://github.com/expo/vscode-expo/issues/59)) ([1388715](https://github.com/expo/vscode-expo/commit/1388715c0f423351879500bd234cb8ad9f99c993))

### 0.7.2 (2021-08-06)

* _rollback to `7.0.0` because of issues with the bundled dependencies_


### [0.7.1](https://github.com/expo/vscode-expo/compare/0.7.0...0.7.1) (2021-08-06)


### Bug fixes

* resolve webpack bundling issues for production ([#57](https://github.com/expo/vscode-expo/issues/57)) ([5033685](https://github.com/expo/vscode-expo/commit/5033685ce2b1bb41db8037c3131a5d9a71f91738))


### Code changes

* move vscode-test over to @vscode/test-electron ([#58](https://github.com/expo/vscode-expo/issues/58)) ([28d7722](https://github.com/expo/vscode-expo/commit/28d77220dd5ae8877a3ad2f911069405e69c7e29))


### Other chores

* add breaking and revert rules to semantic release ([53936a8](https://github.com/expo/vscode-expo/commit/53936a8e98f5f7b7d1c862669b674f719519aa3d))
* bump lock file with new dependencies ([82e1eaa](https://github.com/expo/vscode-expo/commit/82e1eaafb1df26cd5374ca4f7a9468bfc975578c))
* bump postcss from 7.0.32 to 7.0.36 ([#54](https://github.com/expo/vscode-expo/issues/54)) ([721c9c2](https://github.com/expo/vscode-expo/commit/721c9c2caacfd1689924dc43a67a9745aecffeb4))


### Documentation changes

* update the title on contributing guide ([80b4219](https://github.com/expo/vscode-expo/commit/80b4219f2a46ddc126901c3e4a2f983bc2b7bb4b))

## [0.7.0](https://github.com/expo/vscode-expo/compare/0.6.0...0.7.0) (2021-06-15)


### New features

* add Android colors and styles to the prebuild modifier preview ([#53](https://github.com/expo/vscode-expo/issues/53)) ([3940a66](https://github.com/expo/vscode-expo/commit/3940a66352a9133e44d439bdeb45e4500466c7c8))


### Other chores

* add custom github token to trigger deployment on release ([0d676ff](https://github.com/expo/vscode-expo/commit/0d676fff2c9cfb96b34a39ea91b116c8b5e3a303))


### Documentation changes

* add color and style resources to the readme ([51b9000](https://github.com/expo/vscode-expo/commit/51b9000e1bb2c8a729d80c08267842953e8241c2))

## [0.6.0](https://github.com/expo/vscode-expo/compare/0.5.0...0.6.0) (2021-06-09)


### New features

* apply diff styling to modified preview lines ([#49](https://github.com/expo/vscode-expo/issues/49)) ([199dafe](https://github.com/expo/vscode-expo/commit/199dafee1ecf57d12a2906370a8cb270e681e396))


### Bug fixes

* app name change breaking ios previews ([#51](https://github.com/expo/vscode-expo/issues/51)) ([260883f](https://github.com/expo/vscode-expo/commit/260883f2d851a0e7c8cdb4045d41392856aa236a))
* broken commit links in changelog ([f148d13](https://github.com/expo/vscode-expo/commit/f148d13789cd27b61a1dd5f1aac4646adfc7b76d))
* clean up the clear modules file ([fd52236](https://github.com/expo/vscode-expo/commit/fd522369105c52b665cae0811848fde7458d25d8))
* disable helpers on preview files ([#50](https://github.com/expo/vscode-expo/issues/50)) ([2aad139](https://github.com/expo/vscode-expo/commit/2aad13900f15100ad6cefd1ce5e988ad97422a9f))
* sort mod result keys ([#52](https://github.com/expo/vscode-expo/issues/52)) ([3a5fd07](https://github.com/expo/vscode-expo/commit/3a5fd0790a7ad68c0bce93a6c2e1278f1947a184))


### Other chores

* be more strict with linting in ci ([0d0da51](https://github.com/expo/vscode-expo/commit/0d0da51287d80f4b3d06ca585400125183afbe26))
* reduce the lint annotations in pull requests ([4b15ef3](https://github.com/expo/vscode-expo/commit/4b15ef31d51e830149b4cb77dee0ac19db7302e9))
* remove skip ci from release commit ([d3eda4e](https://github.com/expo/vscode-expo/commit/d3eda4eddc13b3d2a680c046ed776d99f2b4b628))


## 0.5.0 (2021-06-08)

* chore: add proper group sorting to changelog ([02e9634](https://github.com/expo/vscode-expo/commit/02e9634))
* chore: bump dns-packet from 1.3.1 to 1.3.4 (#44) ([c036581](https://github.com/expo/vscode-expo/commit/c036581)), closes [#44](https://github.com/expo/vscode-expo/issues/44)
* chore: clean up linting issue in create completion item ([63d2f5d](https://github.com/expo/vscode-expo/commit/63d2f5d))
* chore: create new release 0.5.0 ([279666b](https://github.com/expo/vscode-expo/commit/279666b)), closes [#45](https://github.com/expo/vscode-expo/issues/45) [#48](https://github.com/expo/vscode-expo/issues/48) [#44](https://github.com/expo/vscode-expo/issues/44) [#43](https://github.com/expo/vscode-expo/issues/43)
* chore: fix typo in release workflow name ([8fa7e50](https://github.com/expo/vscode-expo/commit/8fa7e50))
* chore: remove duplicated repository url ([a2a6f0a](https://github.com/expo/vscode-expo/commit/a2a6f0a))
* chore: setup up automated release flow and usage documentation (#43) ([8e2ae19](https://github.com/expo/vscode-expo/commit/8e2ae19)), closes [#43](https://github.com/expo/vscode-expo/issues/43)
* refactor: scope clear module to project modules only (#48) ([d49214c](https://github.com/expo/vscode-expo/commit/d49214c)), closes [#48](https://github.com/expo/vscode-expo/issues/48)
* feature: add previews to ejected native files (#45) ([5228f00](https://github.com/expo/vscode-expo/commit/5228f00)), closes [#45](https://github.com/expo/vscode-expo/issues/45)



## 0.4.0 (2021-05-27)

* chore: update changelog and prepare for 0.4.0 ([b1953ec](https://github.com/expo/vscode-expo/commit/b1953ec))
* refactor: speed up production builds with esbuild loader (#42) ([e4a6177](https://github.com/expo/vscode-expo/commit/e4a6177)), closes [#42](https://github.com/expo/vscode-expo/issues/42)
* feature: auto-complete paths for plugins and assets (#41) ([4583c9a](https://github.com/expo/vscode-expo/commit/4583c9a)), closes [#41](https://github.com/expo/vscode-expo/issues/41)



## 0.3.0 (2021-05-20)

* chore: update changelog and prepare for 0.3.0 ([d6437c3](https://github.com/expo/vscode-expo/commit/d6437c3))
* feature: link to assets and file references (#39) ([4696e70](https://github.com/expo/vscode-expo/commit/4696e70)), closes [#39](https://github.com/expo/vscode-expo/issues/39)
* feature: link to failed plugins from app manifest (#38) ([f7ae4f4](https://github.com/expo/vscode-expo/commit/f7ae4f4)), closes [#38](https://github.com/expo/vscode-expo/issues/38)
* Bump to node 12 (#40) ([3a51e18](https://github.com/expo/vscode-expo/commit/3a51e18)), closes [#40](https://github.com/expo/vscode-expo/issues/40)



## <small>0.2.2 (2021-05-10)</small>

* chore: add manual trigger to production build test ([d816bf7](https://github.com/expo/vscode-expo/commit/d816bf7))
* chore: add manual trigger to test workflow ([b3ad41c](https://github.com/expo/vscode-expo/commit/b3ad41c))
* chore: bump hosted-git-info from 2.8.8 to 2.8.9 (#34) ([1cc4c8e](https://github.com/expo/vscode-expo/commit/1cc4c8e)), closes [#34](https://github.com/expo/vscode-expo/issues/34)
* chore: bump url-parse from 1.4.7 to 1.5.1 (#35) ([94a7d36](https://github.com/expo/vscode-expo/commit/94a7d36)), closes [#35](https://github.com/expo/vscode-expo/issues/35)
* chore: update changelog and prepare for 0.2.2 ([a5aa8c8](https://github.com/expo/vscode-expo/commit/a5aa8c8))
* fix: add webpack ignore patch to dynamic config plugins import (#33) ([dae77c0](https://github.com/expo/vscode-expo/commit/dae77c0)), closes [#33](https://github.com/expo/vscode-expo/issues/33)
* fix: webpack memory issues on github actions (#37) ([5e5b58c](https://github.com/expo/vscode-expo/commit/5e5b58c)), closes [#37](https://github.com/expo/vscode-expo/issues/37)
* refactor: swap master for main branch ([de5685d](https://github.com/expo/vscode-expo/commit/de5685d))
* refactor: update all dependencies to latest versions (#32) ([b29d27f](https://github.com/expo/vscode-expo/commit/b29d27f)), closes [#32](https://github.com/expo/vscode-expo/issues/32)



## 0.2.0 (2021-05-07)

* chore: bump up the release to version 0.2.0 ([571bf1a](https://github.com/expo/vscode-expo/commit/571bf1a))
* chore: update changelog and prepare for 0.2.0 ([a2b580c](https://github.com/expo/vscode-expo/commit/a2b580c))
* docs: fix typo in author name ([944fa52](https://github.com/expo/vscode-expo/commit/944fa52))
* docs: update the readme with new features and authors ([c76f328](https://github.com/expo/vscode-expo/commit/c76f328))
* feature: add support for config plugins (#30) ([9324fd5](https://github.com/expo/vscode-expo/commit/9324fd5)), closes [#30](https://github.com/expo/vscode-expo/issues/30)



## <small>0.1.2 (2020-09-30)</small>

* chore: bump node-fetch from 2.6.0 to 2.6.1 ([e0c14f3](https://github.com/expo/vscode-expo/commit/e0c14f3))
* chore: release new version 0.1.2 ([5902939](https://github.com/expo/vscode-expo/commit/5902939))
* chore: use higher quality overview gif ([b9b254b](https://github.com/expo/vscode-expo/commit/b9b254b))
* fix: handle definitions from xdl schema properly (#25) ([7afdc86](https://github.com/expo/vscode-expo/commit/7afdc86)), closes [#25](https://github.com/expo/vscode-expo/issues/25)



## <small>0.1.1 (2020-08-30)</small>

* chore: add missing test when failing to enhance schema (#15) ([a2ec2c4](https://github.com/expo/vscode-expo/commit/a2ec2c4)), closes [#15](https://github.com/expo/vscode-expo/issues/15)
* chore: release new version 0.1.1 ([5dabe5b](https://github.com/expo/vscode-expo/commit/5dabe5b))
* chore: update logo path to default branch ([d3c1125](https://github.com/expo/vscode-expo/commit/d3c1125))
* docs: add overview animation for the extension (#21) ([da3b633](https://github.com/expo/vscode-expo/commit/da3b633)), closes [#21](https://github.com/expo/vscode-expo/issues/21)
* docs: update short description to match name ([539fe5f](https://github.com/expo/vscode-expo/commit/539fe5f))
* fix: add missing bare workflow notes to schema (#20) ([19646cb](https://github.com/expo/vscode-expo/commit/19646cb)), closes [#20](https://github.com/expo/vscode-expo/issues/20)
* refactor: use custom branding with expo logo (#19) ([77a82a3](https://github.com/expo/vscode-expo/commit/77a82a3)), closes [#19](https://github.com/expo/vscode-expo/issues/19)
* refactor: use expo universe eslint configuration (#18) ([36c089f](https://github.com/expo/vscode-expo/commit/36c089f)), closes [#18](https://github.com/expo/vscode-expo/issues/18)



## 0.1.0 (2020-08-25)

* chore: add integrated vscode tests with jest (#14) ([ced77e0](https://github.com/expo/vscode-expo/commit/ced77e0)), closes [#14](https://github.com/expo/vscode-expo/issues/14)
* chore: release new version 0.1.0 ([9fcd0ae](https://github.com/expo/vscode-expo/commit/9fcd0ae))
* feat: render schema description as markdown (#13) ([6e1f32e](https://github.com/expo/vscode-expo/commit/6e1f32e)), closes [#13](https://github.com/expo/vscode-expo/issues/13)



## <small>0.0.5 (2020-08-17)</small>

* chore: release new version 0.0.5 ([c3c7f69](https://github.com/expo/vscode-expo/commit/c3c7f69))
* fix: remove extraneous files when packaging (#12) ([8e5c362](https://github.com/expo/vscode-expo/commit/8e5c362)), closes [#12](https://github.com/expo/vscode-expo/issues/12)



## <small>0.0.4 (2020-08-17)</small>

* chore: add expo icon (#4) ([ebafe07](https://github.com/expo/vscode-expo/commit/ebafe07)), closes [#4](https://github.com/expo/vscode-expo/issues/4)
* chore: bump elliptic from 6.5.2 to 6.5.3 (#8) ([1a0b68b](https://github.com/expo/vscode-expo/commit/1a0b68b)), closes [#8](https://github.com/expo/vscode-expo/issues/8)
* chore: deploy from ci and improve performance (#9) ([1ee6c70](https://github.com/expo/vscode-expo/commit/1ee6c70)), closes [#9](https://github.com/expo/vscode-expo/issues/9)
* chore: release new version 0.0.4 ([3705f66](https://github.com/expo/vscode-expo/commit/3705f66))
* chore(deps): bump npm-registry-fetch from 8.0.2 to 8.1.1 (#6) ([4a410fb](https://github.com/expo/vscode-expo/commit/4a410fb)), closes [#6](https://github.com/expo/vscode-expo/issues/6)
* chore(deps): bump websocket-extensions from 0.1.3 to 0.1.4 ([1eb9f90](https://github.com/expo/vscode-expo/commit/1eb9f90))
* docs: add ide as a contributor (#11) ([f7e3138](https://github.com/expo/vscode-expo/commit/f7e3138)), closes [#11](https://github.com/expo/vscode-expo/issues/11)
* docs: add JB1905 as a contributor (#10) ([5a84d63](https://github.com/expo/vscode-expo/commit/5a84d63)), closes [#10](https://github.com/expo/vscode-expo/issues/10)
* docs: add link to marketplace in usage ([4440142](https://github.com/expo/vscode-expo/commit/4440142))
* docs: make changelog a bit more readable ([b7b3da9](https://github.com/expo/vscode-expo/commit/b7b3da9))



## <small>0.0.3 (2020-05-13)</small>

* chore: add repository configuration files ([8562e92](https://github.com/expo/vscode-expo/commit/8562e92))
* chore: release new version 0.0.3 ([541a6ab](https://github.com/expo/vscode-expo/commit/541a6ab))
* refactor: add webpack to compile to single file ([f445881](https://github.com/expo/vscode-expo/commit/f445881))
* refactor: clean up repository files and prepare publish ([99de851](https://github.com/expo/vscode-expo/commit/99de851))
* refactor: fine tune the pipelines ([5ce065c](https://github.com/expo/vscode-expo/commit/5ce065c))
* refactor: switch to expo community organisation ([99479bc](https://github.com/expo/vscode-expo/commit/99479bc))



## <small>0.0.2 (2020-05-06)</small>

* fix: use empty array if json.schemas is not set ([cc51ef6](https://github.com/expo/vscode-expo/commit/cc51ef6))



## <small>0.0.1 (2020-05-06)</small>

* feat: created first draft of vscode-expo ([420afa1](https://github.com/expo/vscode-expo/commit/420afa1))



## 0.0.0 (2020-05-03)

* chore: initial project setup ([bf1127f](https://github.com/expo/vscode-expo/commit/bf1127f))
