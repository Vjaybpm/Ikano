import { callListeners, PromiseCacheListener } from "@itsmworkbench/utils";
import { shallowCompareArrays } from "@fusionconfig/utils";


/** This cache is written assuming that there won't be that many calls at once. It's for the dependant data. Thus a linear search for the params */

export interface CallStatus<Context> {
  context: Context
  params: any[]
  value: Promise<any>
  time: number
}
export interface CacheSearch<Context> {
  ( cache: CallStatus<any>[], context: Context, params: any[] ): CallStatus<Context> | undefined;
}
export const defaultCacheSearch = <Context> (): CacheSearch<Context> =>
  ( cache, context, params ) =>
    cache.find ( c => c.context === context && shallowCompareArrays ( c.params, params ) )

export type  CacheCleanup<Context> = ( cache: FutureCache<Context> ) => CallStatus<Context>[];

export const defaultCacheCleanup = <Context> (): CacheCleanup<Context> => ( cache ) => {
  const deadBefore = cache.timeService () - cache.ttl
  return cache.cache.filter ( c => c.time >= deadBefore );
}

export type CacheExecuteAsync<Context> =
  ( cache: FutureCache<Context>, context: Context, params: any[], raw: ( params: any[] ) => Promise<any> ) => Promise<any>

export const defaultCacheExecuteAsync = <Context> (): CacheExecuteAsync<Context> =>
  async ( cache, context, params, raw ) => {
    callListeners ( cache.listeners, 'callingLoad', l => l.callingLoad ( context ) )
    const result = raw ( params ).then ( res => {
      callListeners ( cache.listeners, 'loadArrived', l => l.loadArrived ( context, res ) )
      return res
    } ).catch ( e => {
      callListeners ( cache.listeners, 'loadError', l => l.loadError ( context, e ) )
      throw e
    } )
    return result
  }

export type CacheFound<Context> = ( cache: FutureCache<Context>, context: Context, found: CallStatus<Context> ) => Promise<any>
export const defaultCacheFound = <Context> (): CacheFound<Context> => ( cache: FutureCache<Context>, context: Context, found: CallStatus<Context> ) => {
  callListeners ( cache.listeners, 'duplicateCall', l => l.duplicateCall ( context ) )
  found.time = cache.timeService ()
  return found.value
};
export interface FutureCache<Context> {
  ttl: number
  timeService: () => number
  listeners: PromiseCacheListener<Context, any>[]
  cache: CallStatus<any>[]
  found: CacheFound<Context>
  search: CacheSearch<Context>
  cleanup: CacheCleanup<Context>
  execute: CacheExecuteAsync<Context>
}
export function futureCache<Context> (): FutureCache<Context> {
  return {
    ttl: 20000, // 20 seconds
    timeService: () => Date.now (),
    listeners: [],
    cache: [],
    found: defaultCacheFound (),
    search: defaultCacheSearch (),
    cleanup: defaultCacheCleanup (),
    execute: defaultCacheExecuteAsync ()
  }
}




/**
 * Retrieves data from cache or fetches it using a provided function if not present.
 * If data is found in the cache and still within its TTL, returns the cached promise.
 * If not found or expired, fetches new data, caches and returns the resulting promise.
 * Errors during fetch are logged and rethrown, to be handled by the caller.
 *
 * @param {FutureCache<Context>} cache - The cache object containing all cached calls and configurations.
 * @param {Context} context - The context in which the cache entry is used, for contextual uniqueness.
 * @param {any[]} params - The parameters used for the cache key and to fetch data if necessary.
 * @param {(params: any[]) => Promise<any>} raw - Function to fetch data if not present in the cache.
 * @returns {Promise<any>} A promise resolving to the fetched or cached data.
 */

export async function getOrUpdateFromFutureCache<Context> ( cache: FutureCache<Context>,
                                                            context: Context,
                                                            params: any[],
                                                            raw: ( params: any[] ) => Promise<any> ): Promise<any> {
  const { cleanup, search, found } = cache
  const existing = search ( cache.cache, context, params )
  if ( existing ) return found ( cache, context, existing )
  cache.cache = cleanup ( cache )
  const result = cache.execute ( cache, context, params, raw )

  cache.cache.push ( { context, params, value: result, time: cache.timeService () } )
  return result
}

