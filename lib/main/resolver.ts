export interface Loader<T = never> {
  (resolve: (result: T) => void, reject: (reason: any) => void): void | PromiseLike<void>;
}

export const resolve = <T>(key: string, store: Map<string, Promise<T>>, loader: Loader<T>) => {
  let result = store.get(key);
  
  if (!result) {
    result = new Promise(loader);
    store.set(key, result);
  }

  return result;
};