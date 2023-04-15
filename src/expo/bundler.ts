import fetch from 'node-fetch';
import vscode from 'vscode';

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
}

/** Get a list of unique device names */
function getDeviceNames(devices: InspectableDevice[]) {
  return devices
    .map((device) => device.deviceName ?? 'Unknown device')
    .filter((deviceName, index, self) => self.indexOf(deviceName) === index);
}

export async function fetchDevicesToInspect(metroUrl: string) {
  return await fetch(metroUrl + '/json/list')
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((devices: InspectableDevice[]) =>
      devices.filter((device) => device.title === INSPECTABLE_DEVICE_TITLE)
    );
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
  return name.includes('iphone') ? 'ios' : 'android';
}
