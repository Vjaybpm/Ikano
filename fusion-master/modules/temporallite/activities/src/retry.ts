import { defaultRetryPolicy, RetryPolicyConfig } from "@fusionconfig/indexing";
import { K0, K1, K2, K3, K4, K5, Kleisli } from "./kleisli";
import { useMetricHookState } from "./async.hooks";

export type RetryResult<T> = { result: T, attempts: number };
export function withRetry<T> ( retryPolicy: RetryPolicyConfig, fn: K0<T> ): K0<T>;
export function withRetry<P1, T> ( retryPolicy: RetryPolicyConfig, fn: K1<P1, T> ): K1<P1, T>;
export function withRetry<P1, P2, T> ( retryPolicy: RetryPolicyConfig, fn: K2<P1, P2, T> ): K2<P1, P2, T>;
export function withRetry<P1, P2, P3, T> ( retryPolicy: RetryPolicyConfig, fn: K3<P1, P2, P3, T> ): K3<P1, P2, P3, T>;
export function withRetry<P1, P2, P3, P4, T> ( retryPolicy: RetryPolicyConfig, fn: K4<P1, P2, P3, P4, T> ): K4<P1, P2, P3, P4, T>;
export function withRetry<P1, P2, P3, P4, P5, T> ( retryPolicy: RetryPolicyConfig, fn: K5<P1, P2, P3, P4, P5, T> ): K5<P1, P2, P3, P4, P5, T>;

export function withRetry<T> ( retryPolicy: RetryPolicyConfig | undefined, fn: ( ...args: any[] ) => Promise<T> ): Kleisli<T> {
  if ( retryPolicy === undefined ) retryPolicy = defaultRetryPolicy
  const nonRecoverableErrors = retryPolicy.nonRecoverableErrors || [];
  return async ( ...args: any ): Promise<T> => {
    let attempts = 0;
    let delay = retryPolicy.initialInterval;
    let incMetric = useMetricHookState ();
    const attemptExecution = async (): Promise<T> => {
      try {
        incMetric ( 'activity.attempts' );
        let result = await fn ( ...args );
        incMetric ( 'activity.success' );
        return result;
      } catch ( error ) {
        if ( nonRecoverableErrors.includes ( error.message ) ) {
          incMetric ( 'activity.non_recoverable_error' );
          throw error;
        }  // Rethrow if non-recoverable
        if ( ++attempts < retryPolicy.maximumAttempts ) {
          // Calculate next delay
          delay = Math.min ( delay * 2, retryPolicy.maximumInterval );
          await new Promise ( resolve => setTimeout ( resolve, delay ) );
          incMetric ( 'activity.retry[' + attempts + ']' )
          return attemptExecution (); // Retry recursively
        } else {
          incMetric ( 'activity.error_max_attempts' );
          throw error;  // Rethrow after max attempts
        }
      }
    };

    return attemptExecution ();
  };
}
