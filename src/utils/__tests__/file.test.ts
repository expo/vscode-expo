import { expect } from 'chai';

import { fileIsExcluded, fileIsHidden, getDirectoryPath } from '../file';

describe('getDirectoryPath', () => {
  it('returns root (.) for paths without directories', () => {
    expect(getDirectoryPath('')).to.be.null;
    expect(getDirectoryPath('.')).to.be.null;
    expect(getDirectoryPath('./')).to.be.null;
    expect(getDirectoryPath('./some-file')).to.be.null;
    expect(getDirectoryPath('./some-file.jpg')).to.be.null;
  });

  it('returns directory name for paths with directories', () => {
    expect(getDirectoryPath('./some-dir/this')).to.equal('./some-dir');
    expect(getDirectoryPath('./other-dir/some-file')).to.equal('./other-dir');
    expect(getDirectoryPath('./this-dir/some-file.jpg')).to.equal('./this-dir');
  });
});

describe('fileIsHidden', () => {
  it('returns true for dotfiles', () => {
    expect(fileIsHidden('.gitignore')).to.be.true;
    expect(fileIsHidden('.npmrc')).to.be.true;
    expect(fileIsHidden('.env')).to.be.true;
  });

  it('returns false for other files', () => {
    expect(fileIsHidden('App.js')).to.be.false;
    expect(fileIsHidden('splash.jpg')).to.be.false;
    expect(fileIsHidden('package.json')).to.be.false;
  });
});

describe('fileIsExcluded', () => {
  it('returns false without exclusion', () => {
    expect(fileIsExcluded('App.js')).to.be.false;
    expect(fileIsExcluded('.gitignore')).to.be.false;
  });

  it('returns true for files matching exclusion', () => {
    expect(fileIsExcluded('App.js', { 'App.js': true })).to.be.true;
    expect(fileIsExcluded('my-app/package.json', { '**/package.json': true })).to.be.true;
  });

  it('returns false for files not matching exclusion', () => {
    expect(fileIsExcluded('App.tsx', { 'App.js': true })).to.be.false;
    expect(fileIsExcluded('my-app/package.json', { '**/App.js': true })).to.be.false;
    expect(fileIsExcluded('my-app/package.json', { '**/package.json': false })).to.be.false;
  });
});
