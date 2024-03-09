import sinon from 'sinon';

/** Create an auto-disposable stub that can be created with `using` */
export function disposedStub<T extends { [K in P]: (...args: any[]) => any }, P extends keyof T>(
  api: T,
  method: P
) {
  const stub = sinon.stub(api, method);
  // @ts-expect-error
  stub[Symbol.dispose] = () => stub.restore();
  return stub as sinon.SinonStub<Parameters<T[P]>, ReturnType<T[P]>> & Disposable;
}
