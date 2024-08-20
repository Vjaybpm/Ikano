import { defaultRetryPolicy, RetryPolicyConfig } from "@fusionconfig/indexing/src/worker.domain";
import { K0, K1, K2, K3, K4, K5, Kleisli } from "./kleisli";
import { Throttling, withThrottle } from "./throttling";
import { withRetry } from "./retry";
import { LogConfig, LogConfig0, LogConfig1, LogConfig2, LogConfig3, LogConfig4, LogConfig5 } from "./log";
import { withDebug } from "./debug";
import { withWriteMetrics } from "./metrics";
import { useWorkflowHookState } from "./async.hooks";
import { ActivityEvents } from "./activity.events";
import { withReplay } from "./replay";

export type ActivityCommon = { id: string, retry?: RetryPolicyConfig, throttle?: Throttling, debug?: boolean }

export type Activity0<T> = K0<T> & { raw: K0<T>, config: ActivityCommon }
export type Activity1<P1, T> = K1<P1, T> & { raw: K1<P1, T>, config: ActivityCommon }
export type Activity2<P1, P2, T> = K2<P1, P2, T> & { raw: K2<P1, P2, T>, config: ActivityCommon }
export type Activity3<P1, P2, P3, T> = K3<P1, P2, P3, T> & { raw: K3<P1, P2, P3, T>, config: ActivityCommon }
export type Activity4<P1, P2, P3, P4, T> = K4<P1, P2, P3, P4, T> & { raw: K4<P1, P2, P3, P4, T>, config: ActivityCommon }
export type Activity5<P1, P2, P3, P4, P5, T> = K5<P1, P2, P3, P4, P5, T> & { raw: K5<P1, P2, P3, P4, P5, T>, config: ActivityCommon }

export function activity<T> ( config: ActivityCommon & LogConfig0<T>, fn: K0<T> ): Activity0<T>
export function activity<P1, T> ( config: ActivityCommon & LogConfig1<P1, T>, fn: K1<P1, T> ): Activity1<P1, T>
export function activity<P1, P2, T> ( config: ActivityCommon & LogConfig2<P1, P2, T>, fn: K2<P1, P2, T> ): Activity2<P1, P2, T>
export function activity<P1, P2, P3, T> ( config: ActivityCommon & LogConfig3<P1, P2, P3, T>, fn: K3<P1, P2, P3, T> ): Activity3<P1, P2, P3, T>
export function activity<P1, P2, P3, P4, T> ( config: ActivityCommon & LogConfig4<P1, P2, P3, P4, T>, fn: K4<P1, P2, P3, P4, T> ): Activity4<P1, P2, P3, P4, T>
export function activity<P1, P2, P3, P4, P5, T> ( config: ActivityCommon & LogConfig5<P1, P2, P3, P4, P5, T>, fn: K5<P1, P2, P3, P4, P5, T> ): Activity5<P1, P2, P3, P4, P5, T>

export function activity<T> ( config: ActivityCommon & LogConfig<T>, fn: ( ...args: any[] ) => Promise<T> ): any {
  const newFn: ( ...args: any[] ) => Promise<T> =
          withWriteMetrics (
            withReplay ( config.id,
              withRetry ( config.retry || defaultRetryPolicy,
                withThrottle ( config.throttle,
                  withDebug ( config, fn ) ) ) ) )
  newFn[ 'config' ] = config
  newFn[ 'raw' ] = fn
  return newFn as Kleisli<T> & ActivityCommon & { raw: Kleisli<T> }
}


export const rememberUpdateCache = <T> ( store: ActivityEvents ) => async e => {store.push ( e );}
