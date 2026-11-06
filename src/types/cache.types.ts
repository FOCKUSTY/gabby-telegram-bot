import type { CacheStorage } from "./cache-storage.types";

export type CacheSettingsParameter = Partial<{
  memory: Partial<CacheUseSettings>;
  fallback: Partial<CacheUseSettings>;
}>;

export type CacheUseSettings = Partial<{
  timeToLiveMs: number;
  maxOperations: number;
  skip: boolean;
}>;

export type Cache = CacheStorage & {
  use(
    key: string,
    fallback: () => Promise<unknown>,
    settings?: Partial<CacheUseSettings>,
  ): Promise<unknown>;
};

export type SerializedCache<T> = {
  value: T;
  expiresAt?: string;
};
