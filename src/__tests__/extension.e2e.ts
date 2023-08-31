import { extensions } from 'vscode';

import { EXTENSION_ID } from './utils/vscode';

describe('extension', () => {
  it('is activated', () => {
    expect(extensions.getExtension(EXTENSION_ID)?.isActive).to.equal(true);
  });
});
