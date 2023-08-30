import Mocha from 'mocha';
import { resolve } from 'path';

export async function run() {
  const tests = new Mocha();

  tests.addFile(resolve(__dirname, './mocha-test.js'));

  return new Promise<void>((resolve, reject) => {
    tests.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} failed tests`));
      } else {
        resolve();
      }
    });
  });
}
