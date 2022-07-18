<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/expo/vscode-expo/main/images/logo-repository.png" alt="vscode-expo" width="200">
  <br />
  <h1>Expo for vscode</h1>
  <p>Complementary <a href="https://github.com/expo/expo">Expo</a> tools for vscode</p>
  <p>
    <a href="https://github.com/expo/vscode-expo/releases">
      <img src="https://img.shields.io/github/package-json/v/expo/vscode-expo?style=flat-square" alt="releases" />
    </a>
    <a href="https://github.com/expo/vscode-expo/actions">
      <img src="https://img.shields.io/github/workflow/status/expo/vscode-expo/test/main.svg?style=flat-square" alt="builds" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=byCedric.vscode-expo">
      <img src="https://img.shields.io/badge/vscode-marketplace-%23000000?style=flat-square" alt="vscode marketplace" />
    </a>
    <a href="https://open-vsx.org/extension/byCedric/vscode-expo">
      <img src="https://img.shields.io/badge/vscode-open--vsx-%23000000?style=flat-square" alt="vscode open-vsx" />
    </a>
  </p>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=byCedric.vscode-expo"><b>Install</b></a>
    &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
    <a href="https://github.com/expo/vscode-expo/blob/main/CHANGELOG.md"><b>Changelog</b></a>
  </p>
  <br />
  <div align="center">
    <img src="https://raw.githubusercontent.com/expo/vscode-expo/main/images/feature-autocomplete.gif" alt="vscode-expo overview">
  </div>
  <br />
</div>

## Features

- Autocomplete and validation of your `app.json` or `app.config.json` manifest.
- Automatic [config plugins](https://docs.expo.io/guides/config-plugins/) validation and IntelliSense.

## Commands

We also provide some commands that helps you get the most out of Expo.

### `Expo: Preview Modifier`

Preview the introspected result as native code from your app manifest or config plugin. The following file types are supported:

- [iOS Entitlements](https://docs.expo.io/build-reference/ios-capabilities/#entitlements) - File written to `ios/[app]/[app].entitlements`.
- [iOS Info Plist](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AboutInformationPropertyListFiles.html) - File written to `ios/[app]/Info.plist`.
- [iOS Expo Plist](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AboutInformationPropertyListFiles.html) - File written to `ios/[app]/Supporting/Expo.plist`.

- [Android Color Resources](https://developer.android.com/guide/topics/resources/more-resources#Color) - File writen to `android/app/src/main/res/values/colors.xml`.
- [Android Style Resources](https://developer.android.com/guide/topics/resources/style-resource) - File writen to `android/app/src/main/res/values/styles.xml`.
- [Android String Resources](https://developer.android.com/guide/topics/resources/string-resource) - File writen to `android/app/src/main/res/values/strings.xml`.
- [Android Manifest](https://developer.android.com/guide/topics/manifest/manifest-intro) - File written to `android/app/src/main/AndroidManifest.xml`.
- [Android Gradle Properties](https://developer.android.com/studio/build#properties-files) - File written to `android/gradle.properties`.

### `Expo: Preview Config`

Preview the built manifest from your app manifest. You can do that for either:

- **prebuild** - The local manifest when running prebuild or eject, including all config plugins and modifiers.
- **introspect** - The evaluated results for for static config plugins modifiers.
- **public** - The hosted manifest for OTA updates.

## Contributors

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification ([emoji key](https://allcontributors.org/docs/en/emoji-key)). Contributions of any kind welcome!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bycedric.com"><img src="https://avatars2.githubusercontent.com/u/1203991?v=4" width="100px;" alt=""/><br /><sub><b>Cedric van Putten</b></sub></a><br /><a href="https://github.com/expo/vscode-expo/commits?author=byCedric" title="Code">💻</a> <a href="https://github.com/expo/vscode-expo/commits?author=byCedric" title="Documentation">📖</a></td>
    <td align="center"><a href="https://jb1905.github.io/portfolio/"><img src="https://avatars2.githubusercontent.com/u/28870390?v=4" width="100px;" alt=""/><br /><sub><b>Jakub Biesiada</b></sub></a><br /><a href="https://github.com/expo/vscode-expo/commits?author=JB1905" title="Code">💻</a></td>
    <td align="center"><a href="https://jameside.com"><img src="https://avatars0.githubusercontent.com/u/379606?v=4" width="100px;" alt=""/><br /><sub><b>James Ide</b></sub></a><br /><a href="https://github.com/expo/vscode-expo/commits?author=ide" title="Code">💻</a></td>
    <td align="center"><a href="https://evanbacon.dev/"><img src="https://avatars0.githubusercontent.com/u/9664363?v=4" width="100px;" alt=""/><br /><sub><b>Evan Bacon</b></sub></a><br /><a href="https://github.com/expo/vscode-expo/commits?author=EvanBacon" title="Code">💻</a></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<div align="center">
  <br />
  with&nbsp;:heart:&nbsp;&nbsp;<strong>byCedric</strong>
  <br />
</div>
