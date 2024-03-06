import { expect } from 'chai';

import { stubFetch, withFetchError, withFetchResponse } from '../../__tests__/utils/fetch';
import {
  type InspectableDevice,
  fetchDevicesToInspect,
  fetchDevicesToInspectFromUnknownWorkflow,
  findDeviceByName,
} from '../bundler';

const host = '127.0.0.2';
const port = '1337';

describe('fetchDevicesToInspect', () => {
  it('fetches devices from the bundler', async () => {
    using fetch = stubFetch();
    await fetchDevicesToInspect({ host, port });
    expect(fetch).to.have.been.calledWith(`http://${host}:${port}/json/list`);
  });

  it('filters by predefined page title', async () => {
    using _fetch = withFetchResponse(stubFetch(), [
      mockDevice({ deviceName: 'iPhone 15 Pro', title: 'filter' }),
      mockDevice({ deviceName: 'iPhone 15 Pro' }),
    ]);

    const devices = await fetchDevicesToInspect({ host, port });

    expect(devices).to.have.length(1);
    expect(devices).to.deep.equal([mockDevice({ deviceName: 'iPhone 15 Pro' })]);
  });

  it('filters by device name for React Native <0.73', async () => {
    using _fetch = withFetchResponse(stubFetch(), [
      mockDevice({ deviceName: 'iPhone 15 Pro' }),
      mockDevice({ deviceName: 'iPhone 15 Pro' }),
    ]);

    const devices = await fetchDevicesToInspect({ host, port });

    expect(devices).to.have.length(1);
    expect(devices).to.deep.equal([mockDevice({ deviceName: 'iPhone 15 Pro' })]);
  });

  it('filters by logical device identifier for React Native +0.74', async () => {
    const reactNative: InspectableDevice['reactNative'] = { logicalDeviceId: '1337' };

    using _fetch = withFetchResponse(stubFetch(), [
      mockDevice({ deviceName: 'iPhone 16 Pro', reactNative }),
      mockDevice({ deviceName: 'iPhone 15 Pro', reactNative }),
    ]);

    const devices = await fetchDevicesToInspect({ host, port });

    expect(devices).to.have.length(1);
    expect(devices).to.deep.equal([mockDevice({ deviceName: 'iPhone 16 Pro', reactNative })]);
  });
});

describe('fetchDevicesToInspectFromUnknownWorkflow', () => {
  it('fetches devices from modern and classic bundler addresses', async () => {
    using fetch = stubFetch();

    await fetchDevicesToInspectFromUnknownWorkflow({ host });

    expect(fetch).to.be.calledWith(`http://${host}:19000/json/list`);
    expect(fetch).to.be.calledWith(`http://${host}:8081/json/list`);
  });

  it('returns devices from modern bundler address', async () => {
    const device = mockDevice({ deviceName: 'iPhone 7 Pro' });
    using fetch = stubFetch();

    withFetchError(fetch.withArgs(`http://${host}:19000/json/list`));
    withFetchResponse(fetch.withArgs(`http://${host}:8081/json/list`), [device]);

    const devices = await fetchDevicesToInspectFromUnknownWorkflow({ host });

    expect(devices).to.deep.equal([device]);
  });

  it('returns devices from classic bundler address', async () => {
    const device = mockDevice({ deviceName: 'Pixel 7 Pro' });
    using fetch = stubFetch();

    withFetchResponse(fetch.withArgs(`http://${host}:19000/json/list`), [device]);
    withFetchError(fetch.withArgs(`http://${host}:8081/json/list`));

    const devices = await fetchDevicesToInspectFromUnknownWorkflow({ host });

    expect(devices).to.deep.equal([device]);
  });

  it('prioritizes modern bundler address', async () => {
    const iphone = mockDevice({ deviceName: 'iPhone 15 Pro' });
    const android = mockDevice({ deviceName: 'Pixel 7 Pro' });
    using fetch = stubFetch();

    withFetchResponse(fetch.withArgs(`http://${host}:19000/json/list`), [iphone]);
    withFetchResponse(fetch.withArgs(`http://${host}:8081/json/list`), [android]);

    const devices = await fetchDevicesToInspectFromUnknownWorkflow({ host });

    expect(devices).to.deep.equal([android]);
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

function mockDevice(device: Partial<InspectableDevice>): InspectableDevice {
  return {
    id: 'device1',
    description: 'description1',
    title: 'React Native Experimental (Improved Chrome Reloads)', // Magic title, do not change
    faviconUrl: 'https://example.com/favicon.ico',
    devtoolsFrontendUrl: 'devtools://devtools/example',
    type: 'node',
    webSocketDebuggerUrl: 'ws://example.com',
    vm: 'hermes',
    deviceName: 'iPhone 15 Pro',
    ...device,
  };
}
