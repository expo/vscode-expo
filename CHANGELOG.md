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

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
