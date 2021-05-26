import * as vscode from 'vscode';

import * as storage from '../storage';

const stubContext: any = {
  globalStoragePath: 'storage/path',
};

describe('schemaUri', () => {
  it('returns full uri', () => {
    const uri = storage.schemaUri(stubContext, '39.0.0');
    expect(uri.toString()).toBe('file:///storage/path/manifest-39.0.0.json');
  });
});

describe('hasSchema', () => {
  xit('returns true when fs stat returns object', async () => {
    jest.spyOn(vscode.workspace.fs, 'stat').mockResolvedValue({
      type: vscode.FileType.File,
      ctime: 443782800, // ¯\_(ツ)_/¯
      mtime: 443782800,
      size: 1337,
    });

    await expect(storage.hasSchema(stubContext, '39.0.0')).resolves.toBe(true);
  });

  xit('returns false when fs stat throws error', async () => {
    jest.spyOn(vscode.workspace.fs, 'stat').mockRejectedValue(new Error(`File doesn't exists`));

    await expect(storage.hasSchema(stubContext, '5.0.0')).resolves.toBe(false);
  });
});

describe('storeSchema', () => {
  xit('writes file to expected uri', async () => {
    const schema = { version: '38.0.0' } as any;
    const spy = jest.spyOn(vscode.workspace.fs, 'writeFile').mockResolvedValue();

    const uri = await storage.storeSchema(stubContext, schema);

    expect(uri.toString()).toBe('file:///storage/path/manifest-38.0.0.json');
    expect(spy).toBeCalledWith(uri, expect.any(Buffer));
    expect(spy.mock.calls[0][1].toString()).toBe(JSON.stringify(schema));
  });
});
