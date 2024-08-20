import { NameAnd } from "@laoban/utils";
import { useWorkflowHookState } from "./async.hooks";

export type IncMetric = ( metricName: string ) => void
export type Sideeffect = () => Promise<void>
export function inMemoryIncMetric ( metrics: NameAnd<number> ): IncMetric {
  return ( metricName: string ) => {
    if ( metrics[ metricName ] === undefined ) metrics[ metricName ] = 0
    metrics[ metricName ]++
  }
}
export const nullIncMetric: IncMetric = () => {}

export function withWriteMetrics<T> ( fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  return async ( ...args: any[] ) => {
    const state = useWorkflowHookState ()
    try {
      return await fn ( ...args )
    } finally {
      await state.writeMetrics?. ()
    }
  }
}

export function withSideeffectAtEnd<T> ( sideeffect: Sideeffect | undefined, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  if ( sideeffect === undefined ) return fn
  return async ( ...args: any[] ) => {
    try {
      return await fn ( ...args )
    } finally {
      sideeffect ()
    }
  }
}
