import { getSearchDirectoryPath } from '../file';

describe(getSearchDirectoryPath, () => {
  it('returns null for .', () => {
    expect(getSearchDirectoryPath('.')).toBeNull();
  });

  it('returns null for ./', () => {
    expect(getSearchDirectoryPath('./')).toBeNull();
  });

  it('returns null for ./abc', () => {
    expect(getSearchDirectoryPath('./abc')).toBeNull();
  });

  it('returns ./abc for ./abc/', () => {
    expect(getSearchDirectoryPath('./abc/')).toBe('./abc');
  });

  it('returns ./abc for ./abc/def', () => {
    expect(getSearchDirectoryPath('./abc/def')).toBe('./abc');
  });

  it('returns ./abc/def for ./abc/def/', () => {
    expect(getSearchDirectoryPath('./abc/def/')).toBe('./abc/def');
  });
});
