export type Throttling = {
  current: number;
  max: number;
  throttlingDelay: number;    // Max random delay before retrying in ms
  tokensPer100ms: number;
  kill?: boolean
};
export function withThrottle<T> ( throttle: Throttling, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  if ( throttle === undefined ) return fn;
  return async ( ...args: any[] ) => {
    const attemptInvoke = async () => {
      if ( throttle.kill ) throw Error ( 'Throttling killed' )
      if ( throttle.current > 0 ) {
        throttle.current--;
        return fn ( ...args );
      } else {
        const delay = Math.random () * throttle.throttlingDelay;
        await new Promise ( resolve => setTimeout ( resolve, delay ) );
        return attemptInvoke ();  // Retry the invocation
      }
    };
    return attemptInvoke ();
  };
}

export function startIncrementLoop ( throttle: Throttling ) {
  const intervalId = setInterval ( () => {
    if ( throttle.kill ) {
      clearInterval ( intervalId );  // Stop the interval if kill is true
      return;  // Exit the function to prevent further execution
    }
    throttle.current = Math.min ( throttle.max, throttle.current + throttle.tokensPer100ms );
  }, 100 );
}
