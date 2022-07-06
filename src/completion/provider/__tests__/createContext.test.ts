import { matchesImageProperty } from '../createContext';

const imageAssets = [
  'xxhdpi',
  'xhdpi',
  'hdpi',
  'mdpi',
  'image',
  'tabletImage',
  'foregroundImage',
  'backgroundImage',
  'icon',
  'favicon',
  'xxxhdpi',
];

xdescribe(matchesImageProperty, () => {
  it('matches known image properties', () => {
    for (const propName of imageAssets) {
      expect(matchesImageProperty(propName)).toBe(true);
    }
  });
  it('does not match known properties', () => {
    for (const propName of ['plugins', 'name', 'bundleIdentifier']) {
      expect(matchesImageProperty(propName)).toBe(false);
    }
  });
});
