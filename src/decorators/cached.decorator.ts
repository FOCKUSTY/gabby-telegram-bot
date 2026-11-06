import { BaseCache, MemoryCache } from "@/cache";

export interface CachedOptions {
  ttlMs?: number;
  maxOperations?: number;
  keyPrefix?: string;
  keyGenerator?: (args: unknown[]) => string;
  cache?: BaseCache;
  shouldCache?: (result: unknown) => boolean;
  skipRead?: (args: unknown[]) => boolean;
}

const defaultCache = new MemoryCache();

const serializeArg = (value: unknown): string => {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export function Cached(options: CachedOptions = {}): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    if (typeof original !== "function") {
      throw new Error(
        `@Cached применим только к методам (${String(propertyKey)})`,
      );
    }

    const className = target.constructor.name;
    const methodName = String(propertyKey);

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const cache = options.cache ?? defaultCache;

      if (options.skipRead?.(args)) {
        return original.apply(this, args);
      }

      const key =
        options.keyPrefix !== undefined || options.keyGenerator
          ? `${options.keyPrefix ?? className}:${
              options.keyGenerator?.(args) ?? methodName
            }`
          : `${className}:${methodName}:${args.map(serializeArg).join(":")}`;

      return cache
        .use(key, () => Promise.resolve(original.apply(this, args)), {
          timeToLiveMs: options.ttlMs,
          maxOperations: options.maxOperations,
        })
        .then((value) => {
          if (options.shouldCache && !options.shouldCache(value)) {
            void cache.delete(key);
          }
          return value;
        });
    };

    return descriptor;
  };
}
