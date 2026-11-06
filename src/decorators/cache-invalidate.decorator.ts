import { BaseCache, MemoryCache } from "@/cache";

export interface CacheInvalidateOptions {
  cache?: BaseCache;
  keys?: string[];
  keysOf?: (args: unknown[]) => string[];
  all?: boolean;
}

const defaultCache = new MemoryCache();

export function CacheInvalidate(
  options: CacheInvalidateOptions = {},
): MethodDecorator {
  return (_target, _key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    if (typeof original !== "function") return descriptor;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      try {
        return await original.apply(this, args);
      } finally {
        const cache = options.cache ?? defaultCache;

        if (options.all) {
          await cache.clear();
        }

        const keys = [
          ...(options.keys ?? []),
          ...(options.keysOf?.(args) ?? []),
        ];
        await Promise.all(keys.map((k) => cache.delete(k)));
      }
    };

    return descriptor;
  };
}
