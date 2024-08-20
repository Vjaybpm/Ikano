import { UrlLoadNamedFn, writeUrl } from '@itsmworkbench/urlstore';

export function cachedUrlLoadFn ( rawFn: UrlLoadNamedFn ): UrlLoadNamedFn {
  const cache = new Map<string, any> ();
  return async ( named, offset ) => {
    const key = writeUrl ( named )
    if ( cache.has ( key ) ) {
      return cache.get ( key );
    }
    const result = await rawFn ( named, offset );
    cache.set ( key, result );
    return result;
  };

}