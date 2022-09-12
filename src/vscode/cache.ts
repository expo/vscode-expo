import vscode from 'vscode';

/**
 * The map cache provider is a self-disposable cache of agnostic types.
 * Use this to cache calculation intense results by custom keys.
 */
export abstract class MapCacheProvider<T> implements vscode.Disposable {
  protected cache: Map<string, T>;

  constructor(context: vscode.ExtensionContext, cache: Map<string, T> = new Map()) {
    this.cache = cache;
    context.subscriptions.push(this);
  }

  dispose() {
    this.cache.clear();
  }
}
