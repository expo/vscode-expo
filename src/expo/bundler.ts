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
  deviceName?: string;
  /** Only available in this extension */
  _workflow: 'generic' | 'managed';
}

/** Get a list of unique device names */
function getDeviceNames(devices: InspectableDevice[]) {
  return devices
    .map((device) => device.deviceName ?? 'Unknown device')
    .filter((deviceName, index, self) => self.indexOf(deviceName) === index);
}

export async function fetchDevicesToInspect({ host, port }: { host: string; port: string }) {
  return await fetch(`http://${host}:${port}/json/list`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((devices: InspectableDevice[]): InspectableDevice[] =>
      devices
        .filter((device) => device.title === INSPECTABLE_DEVICE_TITLE)
        .filter(uniqueBy((device) => device.title))
        .map((device) => ({ ...device, _workflow: port === '19000' ? 'managed' : 'generic' }))
    );
}

/** Attempt to fetch from both `19000` and `8081`, return the data when one of these works */
export async function fetchDevicesToInspectFromUnknownWorkflow({ host }: { host: string }) {
  const [classic, modern] = await Promise.allSettled([
    fetchDevicesToInspect({ host, port: '19000' }),
    fetchDevicesToInspect({ host, port: '8081' }),
  ]);

  // Prefer data from modern Expo (dev clients)
  if (classic.status === 'fulfilled') return classic.value;
  if (modern.status === 'fulfilled') return modern.value;

  throw new Error(`No bundler found at ${host} on ports 19000 or 8081`);
}

export function findDeviceByName(devices: InspectableDevice[], deviceName: string) {
  const deviceId = getDeviceNames(devices).indexOf(deviceName);
  return devices[deviceId];
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
export function inferDevicePlatform(device: InspectableDevice) {
  const name = device.deviceName?.toLowerCase();
  if (!name) return null;
  if (name.includes('iphone')) return 'ios';
  if (name.includes('gphone')) return 'android';
  if (name.includes('desktop')) return 'windows';
  if (name.includes('mac')) return 'macos';
  return null;
}
