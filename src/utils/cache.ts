import { Disposable, ExtensionContext } from 'vscode';

export abstract class MapCacheProvider<V, K = string> implements Disposable {
  protected cache: Map<K, V> = new Map();

  constructor({ subscriptions }: Pick<ExtensionContext, 'subscriptions'>) {
    subscriptions.push(this);
  }

  dispose() {
    this.cache.clear();
  }
}
