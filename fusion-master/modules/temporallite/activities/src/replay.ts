import { K0, K1, K2, K3, K4, K5 } from "./kleisli";
import { useWorkflowHookState } from "./async.hooks";
import { isActivityFailedEvent, isActivitySucessfulEvent } from "./activity.events";


export function withReplay<T> ( activityId: string, fn: K0<T> ): K0<T>
export function withReplay<P1, T> ( activityId: string, fn: K1<P1, T> ): K1<P1, T>
export function withReplay<P1, P2, T> ( activityId: string, fn: K2<P1, P2, T> ): K2<P1, P2, T>
export function withReplay<P1, P2, P3, T> ( activityId: string, fn: K3<P1, P2, P3, T> ): K3<P1, P2, P3, T>
export function withReplay<P1, P2, P3, P4, T> ( activityId: string, fn: K4<P1, P2, P3, P4, T> ): K4<P1, P2, P3, P4, T>
export function withReplay<P1, P2, P3, P4, P5, T> ( activityId: string, fn: K5<P1, P2, P3, P4, P5, T> ): K5<P1, P2, P3, P4, P5, T>
export function withReplay<T, Args extends any[]> (
  activityId: string,
  fn: (  ...args: Args ) => Promise<T> ): ( ...args: Args ) => Promise<T> {
  return async ( ...args: Args ): Promise<T> => {
    let state = useWorkflowHookState ()
    const { currentReplayIndex, replayState, updateEventHistory, incMetric } = state
    // Retrieve the current replay item if it exists
    const replayItem = replayState[ currentReplayIndex ];

    // Move to the next index
    state.currentReplayIndex++;
    // Check if we can use a cached result
    if ( replayItem && replayItem.id === activityId ) {
      if ( isActivitySucessfulEvent<T> ( replayItem ) ) {
        incMetric ( 'activity.replay.success' )
        return replayItem.success;
      }  // Return the successful result from cache
      if ( isActivityFailedEvent ( replayItem ) ) {
        incMetric ( 'activity.replay.success' )
        throw enhanceErrorWithOriginalProperties ( replayItem.failure );
      } else {
        incMetric ( 'activity.replay.invalid' )
        throw new Error ( `Invalid replay item: ${JSON.stringify ( replayItem )}` );
      }  // Rethrow the cached failure
    }

    // Execute the function and update the cache if no valid cache item was found
    try {
      const result = await fn ( ...args );
      updateEventHistory ( { id: activityId, success: result } );
      return result;
    } catch ( failure ) {
      updateEventHistory ( { id: activityId, failure } );
      throw failure;
    }
  };
}

function enhanceErrorWithOriginalProperties ( originalError: any ) {
  const newError = new Error ( originalError.message );
  newError.name = originalError.name;

  // Copy all enumerable properties from the original error to the new error
  Object.keys ( originalError ).forEach ( key => {
    newError[ key ] = originalError[ key ];
  } );

  return newError;
}