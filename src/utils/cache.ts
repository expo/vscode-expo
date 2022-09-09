import { Disposable } from 'vscode';

export class MapCache<T> implements Disposable {
  protected cache: Map<string, T> = new Map();

  dispose() {
    this.cache.clear();
  }
}
