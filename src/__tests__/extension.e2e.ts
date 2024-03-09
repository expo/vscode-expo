import { expect } from 'chai';
import { extensions } from 'vscode';

describe('extension', () => {
  it('is activated', () => {
    expect(extensions.getExtension(process.env.EXTENSION_ID)?.isActive).to.equal(true);
  });
});
