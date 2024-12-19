import { expect } from 'chai';

import { mockDevice } from '../../__tests__/utils/debugging';
import { stubFetch } from '../../__tests__/utils/fetch';
import { fetchDevicesToInspect, findDeviceByName, inferDevicePlatform } from '../bundler';

const host = '127.0.0.2';
const port = '1337';

describe('fetchDevicesToInspect', () => {
  it('fetches devices from the bundler', async () => {
    using fetch = stubFetch();
    await fetchDevicesToInspect({ host, port });
    expect(fetch).to.have.been.calledWith(`http://${host}:${port}/json/list`);
  });

  // TODO: find out why the stubbing isnt working for this fetch
  xit('filters by page id', async () => {
    using _fetch = stubFetch([
      mockDevice({
        title: 'React Native Bridgeless [C++ connection]',
        deviceName: 'iPhone 15 Pro',
        webSocketDebuggerUrl: 'ws://localhost:8081/inspector/device?page=1',
      }),
      mockDevice({
        title: 'React Native Bridgeless [C++ connection]',
        deviceName: 'iPhone 15 Pro',
        webSocketDebuggerUrl: 'ws://localhost:8081/inspector/device?page=2',
      }),
    ]);

    const devices = await fetchDevicesToInspect({ host, port });

    expect(devices).to.have.length(1);
    expect(devices).to.deep.equal([
      mockDevice({
        deviceName: 'iPhone 15 Pro',
        webSocketDebuggerUrl: 'ws://localhost:8081/inspector/device?page=2',
      }),
    ]);
  });
});

describe('findDeviceByName', () => {
  it('returns first device by its name', () => {
    const target = mockDevice({ deviceName: 'iPhone 15 Pro', id: 'page1' });
    const devices = [
      mockDevice({ deviceName: 'Pixel 7 Pro', id: 'page1' }),
      mockDevice({ deviceName: 'Pixel 7 Pro', id: 'page2' }),
      target,
      mockDevice({ deviceName: 'iPhone 15 Pro', id: 'page2' }),
    ];

    expect(findDeviceByName(devices, 'iPhone 15 Pro')).to.equal(target);
  });
});

describe('inferDevicePlatform', () => {
  it('returns ios for standard simulator device names', () => {
    expect(inferDevicePlatform({ deviceName: 'iPhone 15 pro' })).to.equal('ios');
    expect(inferDevicePlatform({ deviceName: 'iPhone 12 mini' })).to.equal('ios');
    expect(inferDevicePlatform({ deviceName: 'iPhone 15' })).to.equal('ios');
    expect(inferDevicePlatform({ deviceName: 'iPad Air' })).to.equal('ios');
    expect(inferDevicePlatform({ deviceName: 'iPad mini' })).to.equal('ios');
    expect(inferDevicePlatform({ deviceName: 'iPadPro 12.9"' })).to.equal('ios');
  });

  it('returns android for standard emulator device names', () => {
    expect(inferDevicePlatform({ deviceName: 'sdk_gphone64_arm64' })).to.equal('android');
    expect(inferDevicePlatform({ deviceName: 'Pixel 8 API 31' })).to.equal('android');
  });

  it('returns windows for standard Windows desktop device names', () => {
    expect(inferDevicePlatform({ deviceName: 'Cedrics-Desktop' })).to.equal('windows');
    expect(inferDevicePlatform({ deviceName: 'Windows 10' })).to.equal('windows');
  });

  it('returns macos for standard MacOS device names', () => {
    expect(inferDevicePlatform({ deviceName: 'Cedric’s MacBook Pro' })).to.equal('macos');
  });
});
