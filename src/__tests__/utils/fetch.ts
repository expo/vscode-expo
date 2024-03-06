import * as nodeFetch from 'node-fetch';
import { stub, type SinonStub } from 'sinon';

/** Mock fetch with a default empty device list response */
export function stubFetch() {
  const fetch = withFetchResponse(stub(nodeFetch, 'default'), []);
  // @ts-expect-error
  fetch[Symbol.dispose] = () => fetch.restore();
  return fetch as Disposable & typeof fetch;
}

/** Add a valid response to the stubbed fetch, returning the response as json data */
export function withFetchResponse<T extends SinonStub>(fetch: T, response: any) {
  fetch.returns(
    Promise.resolve<any>({
      ok: true,
      json: () => Promise.resolve(response),
    })
  );
  return fetch;
}

/** Add an invalid response to the stubbed fetch, throwing an error when json is loaded */
export function withFetchError<T extends SinonStub>(
  fetch: T,
  error = new Error('JSON parse error')
) {
  fetch.returns(
    Promise.resolve<any>({
      ok: false,
      json: () => Promise.reject(error),
    })
  );
  return fetch;
}
