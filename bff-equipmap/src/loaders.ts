type BatchLoadFn<K, V> = (keys: readonly K[]) => Promise<readonly V[]>;

export class SimpleDataLoader<K, V> {
  private readonly cache = new Map<K, Promise<V>>();

  constructor(private readonly batchLoadFn: BatchLoadFn<K, V>) {}

  load(key: K): Promise<V> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const promise = this.batchLoadFn([key]).then((values) => values[0]);
    this.cache.set(key, promise);
    return promise;
  }

  loadMany(keys: readonly K[]): Promise<readonly V[]> {
    return Promise.all(keys.map((key) => this.load(key)));
  }
}
