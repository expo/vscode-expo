<h1 align="center">
  <a href="https://docs.expo.dev">
    <img width="150" alt="Expo Tools" src="https://raw.githubusercontent.com/expo/vscode-expo/main/images/logo-repository.png" />
  </a>
  <br />
  Expo Tools
</h1>

<p align="center">
  <a aria-label="Latest release" href="https://github.com/expo/vscode-expo/releases" target="_blank">
    <img alt="Latest release" src="https://img.shields.io/github/package-json/v/expo/vscode-expo?style=flat-square&color=0366D6&labelColor=49505A" />
  </a>
  <a aria-label="Workflow status"  href="https://github.com/expo/vscode-expo/actions" target="_blank">
    <img alt="Workflow status" src="https://img.shields.io/github/actions/workflow/status/expo/vscode-expo/test.yml?branch=main&style=flat-square&labelColor=49505A" />
  </a>
  <a aria-label="Install from VS Code Marketplace" href="https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools" target="_blank">
    <img alt="Install from VS Code Marketplace" src="https://img.shields.io/badge/vscode-marketplace-25292E?style=flat-square&label=%20&logoColor=BCC3CD&labelColor=49505A&logo=Visual%20Studio%20Code" />
  </a>
  <a aria-label="Install from Open VSX" href="https://open-vsx.org/extension/expo/vscode-expo-tools" target="_blank">
    <img alt="Install from Open VSX" src="https://img.shields.io/badge/vscode-open%20vsx-25292E?style=flat-square&label=%20&logoColor=BCC3CD&labelColor=49505A&logo=Eclipse%20IDE" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/expo/vscode-expo#intellisense-for-expo-configs">IntelliSense</a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo#debug-expo-apps">Debug apps</a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo#live-preview-for-native-files">Preview prebuild</a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo#live-preview-for-manifest">Preview manifest</a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo/blob/main/CHANGELOG.md">Changelog</a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo/blob/main/CONTRIBUTING.md">Contribute</a>
</p>

<br />

Expo Tools adds suggestions and docs for all Expo config. It also shows live previews for native files from prebuild, right in your editor!

<br />

## IntelliSense for Expo configs

<img alt="Expo config IntelliSense example" align="right" width="45%" src="https://raw.githubusercontent.com/expo/vscode-expo/main/images/feature-autocomplete.gif" />

Get suggestions and docs where you need them the most.

- EAS Build / Submit / Update → [`eas.json`](https://docs.expo.dev/build-reference/eas-json/)
- EAS Metadata → [`store.config.json`](https://docs.expo.dev/eas-metadata/introduction/)
- Expo Manifest → [`app.json`](https://docs.expo.dev/versions/latest/config/app/)
- Expo Modules → [`expo-module.config.json`](https://docs.expo.dev/modules/overview/)

<br />
<br />
<br />

## Debug Expo apps

Debug your app, without leaving your editor. The built-in `expo` debugger can connect directly to your simulator or phone, giving you complete insights into what your app is doing.

- `Expo: Debug ...` → Start debugging with the default settings, with just a single command.
- **.vscode/launch.json** → Fully configure the `expo` debugger through [VS Code launch scripts](https://code.visualstudio.com/docs/editor/debugging).

<br />

## Live preview for native files

See how your changes in **app.json** or **app.config.js** would affect the native files created by [`npx expo prebuild`](https://docs.expo.dev/workflow/prebuild/). The previews are generated whenever you save the app manifest and won't affect existing files.

> Open **app.json** or **app.config.js** and run the **`Expo: Preview Modifier`** command.

### Supported Android files

- [`AndroidManifest.xml`](https://developer.android.com/guide/topics/manifest/manifest-intro) → App manifest with settings for build tools, Android, and Google Play.
- [`gradle.properties`](https://developer.android.com/studio/build#properties-files) → Configuration for the Grdle build toolkit itself.
- [`colors.xml`](https://developer.android.com/guide/topics/resources/more-resources#Color) → Color resources defining the color and opacity.
- [`strings.xml`](https://developer.android.com/guide/topics/resources/string-resource) → String resources defining string content, styling, and formatting.
- [`styles.xml`](https://developer.android.com/guide/topics/resources/style-resource) → Style resources defining the format and look for a UI element.

### Supported iOS files

- [`Info.plist`](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AboutInformationPropertyListFiles.html) → Property list with core config for the app.
- [`[name].entitlements`](https://docs.expo.dev/build-reference/ios-capabilities/#entitlements) → Property list enabling permission to use services.
- [`Expo.plist`](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AboutInformationPropertyListFiles.html) → Supporting property list with config for Expo.
- [`Podfile.properties.json`](https://github.com/expo/fyi/blob/main/hermes-ios-config.md#create-iospodfilepropertiesjson) → JSON file with install or build config.

<br />

## Live preview for manifest

Preview the generated manifests for your app. You can do this for the different config types listed below.

> Open **app.json** or **app.config.js** and run the **`Expo: Preview Config`** command.

- **prebuild** - The local app manifest when running `npx expo prebuild`.
- **introspect** - The evaluated app manifest result when running `npx expo prebuild`.
- **public** - The hosted manifest when using Expo Updates.

<div align="center">
  <br />
  with&nbsp;❤️&nbsp;&nbsp;<strong>byCedric</strong>
  <br />
</div>
