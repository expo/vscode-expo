import { expect } from 'chai';
import picomatch from 'picomatch';

import { type ExpoConfig } from '../../packages/config';
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
    const manifest: ExpoConfig = {
      name: 'my-app',
      slug: 'my-app',
      icon: './assets/icon.png',
      splash: {
        image: '../assets/splash.png',
        backgroundColor: '#FFFFFF',
        resizeMode: 'cover',
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#FFFFFF',
        },
      },
      plugins: ['./plugins/local-plugin.js'],
    };

    expect(getFileReferences(JSON.stringify({ expo: manifest }, null, 2))).to.deep.include.members([
      { filePath: './assets/icon.png', fileRange: { length: 17, offset: 71 } },
      { filePath: '../assets/splash.png', fileRange: { length: 20, offset: 123 } },
      { filePath: './assets/adaptive-icon.png', fileRange: { length: 26, offset: 286 } },
      { filePath: './plugins/local-plugin.js', fileRange: { length: 25, offset: 391 } },
    ]);
  });
});
