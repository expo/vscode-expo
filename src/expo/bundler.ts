import fetch from 'node-fetch';
import vscode from 'vscode';

import { truthy } from '../utils/array';

const INSPECTABLE_DEVICE_TITLE = 'React Native Experimental (Improved Chrome Reloads)';
const REACT_NATIVE_BRIDGELESS_CDP_RUNTIME = 'React Native Bridgeless [C++ connection]';
const REANIMATED_UI_CDP_RUNTIME = 'Reanimated UI runtime [C++ connection]';

export interface InspectableDevice {
  id: string;
  description: string;
  title: string;
  faviconUrl: string;
  devtoolsFrontendUrl: string;
  type: 'node';
  webSocketDebuggerUrl: string;
  vm: string;
  /** Added in Metro +0.75.x */
  deviceName: string;
  /** Added in React Native 0.74+ */
  reactNative?: Partial<{
    logicalDeviceId: string;
    capabilities: Record<string, boolean>;
  }>;
}

function getDeviceName(device: InspectableDevice) {
  return device.deviceName ?? 'Unknown device';
}

/** Get a list of unique device names */
function getDeviceNames(devices: InspectableDevice[]) {
  return devices
    .map((device) => device.deviceName ?? 'Unknown device')
    .filter((deviceName, index, self) => self.indexOf(deviceName) === index);
}

/** Fetch a list of all devices to inspect, filtered by known inspectable targets */
export async function fetchDevicesToInspect({
  host = '127.0.0.1',
  port = '8081',
}: {
  host?: string;
  port?: string;
}) {
  const response = await fetch(`http://${host}:${port}/json/list`);
  if (!response.ok) throw response;

  const devices = (await response.json()) as InspectableDevice[];
  const reloadable = devices.filter(
    (device) =>
      device.title === INSPECTABLE_DEVICE_TITLE || // SDK <51
      device.reactNative?.capabilities?.nativePageReloads || // SDK 52+
      device.description !== REANIMATED_UI_CDP_RUNTIME // SDK 53+
  );

  // Manual filter for Expo Go, we really need to fix this
  const inspectable = reloadable.filter((device, index, list) => {
    // Only apply this to SDK 52+
    if (
      ![
        // SDK 52
        device.title,
        // SDK 53+ (https://github.com/expo/expo/commit/f545f30fe1df3dd0d346b12aa65a2feb7cb27439)
        device.description,
      ].includes(REACT_NATIVE_BRIDGELESS_CDP_RUNTIME)
    )
      return true;

    // If there are multiple inspectable pages, only use highest page number
    const devicesByPageNumber = list
      .filter((other) => device.title === other.title)
      .sort((a, b) => getDevicePageNumber(b) - getDevicePageNumber(a));
    // Only use the highest page number
    return devicesByPageNumber[0] === device;
  });

  return inspectable.filter(truthy);
}

function getDevicePageNumber(device: InspectableDevice) {
  return parseInt(new URL(device.webSocketDebuggerUrl).searchParams.get('page') ?? '0', 10);
}

export function findDeviceByName(devices: InspectableDevice[], deviceName: string) {
  return devices.find((devices) => getDeviceName(devices) === deviceName);
}

export async function askDeviceByName(devices: InspectableDevice[]) {
  const deviceName = await vscode.window.showQuickPick(getDeviceNames(devices), {
    placeHolder: 'Select a device to debug',
  });

  if (!deviceName) {
    throw new Error('No device selected');
  }

  const device = findDeviceByName(devices, deviceName);
  if (!device) {
    throw new Error('Could not find device with name: ' + deviceName);
  }

  return device;
}

/** Try to infer the device platform, by device name */
export function inferDevicePlatform(device: Pick<InspectableDevice, 'deviceName'>) {
  const name = device.deviceName?.toLowerCase();
  if (!name) return null;
  if (name.includes('iphone')) return 'ios';
  if (name.includes('ipad')) return 'ios';
  if (name.includes('gphone')) return 'android';
  if (name.includes('desktop')) return 'windows';
  if (name.includes('mac')) return 'macos';

  // Android usually adds `XXX API 31` to the device name
  if (name.match(/api\s+[0-9]+/)) return 'android';
  // Windows might include the windows name
  if (name.includes('windows')) return 'windows';

  return null;
}
