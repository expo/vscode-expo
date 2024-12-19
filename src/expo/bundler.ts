import fetch from 'node-fetch';
import vscode from 'vscode';

import { uniqueBy } from '../utils/array';

const INSPECTABLE_DEVICE_TITLE = 'React Native Experimental (Improved Chrome Reloads)';

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
  return await fetch(`http://${host}:${port}/json/list`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((devices: InspectableDevice[]): InspectableDevice[] =>
      devices
        .filter(
          (device) =>
            device.title === INSPECTABLE_DEVICE_TITLE || // SDK <51
            device.reactNative?.capabilities?.nativePageReloads === true // SDK 52+
        )
        .filter(uniqueBy((device) => device?.reactNative?.logicalDeviceId ?? device.deviceName))
    );
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
