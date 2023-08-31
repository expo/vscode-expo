export enum ExpoConfigType {
  PREBUILD = 'prebuild',
  INTROSPECT = 'introspect',
  PUBLIC = 'public',
}

export enum PreviewCommand {
  OpenExpoFilePrebuild = 'expo.config.prebuild.preview',
  OpenExpoFileJsonPrebuild = 'expo.config.prebuild.preview.json',
  OpenExpoConfigPrebuild = 'expo.config.preview',
}

export enum PreviewModProvider {
  iosInfoPlist = 'ios.infoPlist',
  iosEntitlements = 'ios.entitlements',
  iosExpoPlist = 'ios.expoPlist',
  iosPodfileProperties = 'ios.podfileProperties',
  androidManifest = 'android.manifest',
  androidStrings = 'android.strings',
  androidColors = 'android.colors',
  androidColorsNight = 'android.colorsNight',
  androidStyles = 'android.styles',
  androidGradleProperties = 'android.gradleProperties',
}
