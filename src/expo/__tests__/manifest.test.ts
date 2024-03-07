import { expect } from 'chai';
import picomatch from 'picomatch';

import { manifestPattern, getFileReferences } from '../manifest';

describe('manifestPattern', () => {
  it('scheme is set to files', () => {
    expect(manifestPattern.scheme).to.equal('file');
  });

  it('language is set to json with comments', () => {
    expect(manifestPattern.language).to.equal('jsonc');
  });

  it('pattern includes all json variations of the Expo manifest', () => {
    const pattern = manifestPattern.pattern as string;
    const matcher = picomatch(pattern);

    expect(matcher('my-app/app.json')).to.be.true;
    expect(matcher('my-app/app.config.json')).to.be.true;
  });
});

describe('getFileReferences', () => {
  it('returns all local file references from manifest', () => {
    const manifest = {
      expo: {
        name: 'my-app',
        slug: 'my-app',
        icon: './assets/icon.png',
        splash: '../assets/splash.png',
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF',
          },
        },
      },
    };

    expect(getFileReferences(JSON.stringify(manifest, null, 2))).to.deep.include.members([
      { filePath: './assets/icon.png', fileRange: { offset: 71, length: 17 } },
      { filePath: '../assets/splash.png', fileRange: { offset: 106, length: 20 } },
      { filePath: './assets/adaptive-icon.png', fileRange: { offset: 198, length: 26 } },
    ]);
  });
});
