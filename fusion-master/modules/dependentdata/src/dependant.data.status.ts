import { NameAnd } from "@laoban/utils";
import { Optional } from "@focuson/lens";
import { callDDF, DD, DDDecisions, findParams } from "./dependent.data.domain";
import { chainOfResponsibility, PartialFunction } from "@itsmworkbench/utils";


export type BasicStatus<S> = {
  paramNames: string[]
  upstreamUndefined: string[]
  upstreamChanged: string[]
  rawValue: any
  rawChanged: boolean
}
export type DDStatus<S> = BasicStatus<S> & {
  changed: boolean
  value: any
  cleared?: Boolean
  evaluated?: boolean
  needsLoad?: boolean
  /* Used to decide whether this makes any change to 'newS'. Only if true will this immediately effect newS */
  params?: any[] // only set if needsLoad or evaluated
  reason: string // just for debugging/logging. Let's us know which 'branch' of the code made this status
}

export type AllDdStatus<S> = NameAnd<DDStatus<S>>

export function getFromOptional<S, T> ( context: string, o: Optional<S, T>, s: S ): T | undefined {
  try {
    return o.getOption ( s )
  } catch ( e ) {
    throw new Error ( `Error getting from optional ${o}  for ${context}in\n${JSON.stringify ( s, null, 2 )}` )
  }
}
export function findBasics<S> ( status: NameAnd<DDStatus<S>>, dd: DD<S, any>, oldS: S, s: S ): BasicStatus<S> {
  const ps = findParams ( dd )
  const oldValue = getFromOptional ( 'oldValue', dd.target, oldS )
  const newValue = getFromOptional ( 'newValue', dd.target, s )
  let paramNames = ps.map ( p => p.name );
  return {
    paramNames,
    upstreamUndefined: paramNames.filter ( p => status[ p ]?.value === undefined ),
    upstreamChanged: paramNames.filter ( p => status[ p ]?.rawChanged ),
    rawValue: newValue,
    rawChanged: oldValue !== newValue,
  };
}

export const calcParams = ( status: AllDdStatus<any> ) => ( paramNames: string[] ): any[] => paramNames.map ( p => {
  if ( status[ p ] === undefined ) throw new Error ( `No status for ${p} in ${Object.keys ( status )}` ) //defensive programming. We should already have 'validated' this can't happen
  return status[ p ]?.value;
} );

/** When the upstreams has undefined data, we can't calculate our value. We might want to clear the data if that's what the config asks for*/
export const upstreamsUndefined = <S> ( dd: DDDecisions ): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.upstreamUndefined.length > 0,
  apply: ( bs: BasicStatus<S> ) => {
    const cleared = dd.clear && bs.rawValue !== undefined;
    const value = cleared ? undefined : bs.rawValue
    const changed = value !== bs.rawValue
    return { ...bs, needsLoad: false, cleared, changed, value, reason: 'Upstream has undefined value' }
  }
});
type ParamFn = ( names: string[] ) => any[]

/** When we are an async and the upstream has changed, we need to load the data again. We might want to clear the data if that's specified*/
export const asyncUpstreamsChanged = <S> ( paramFn: ParamFn, dd: DDDecisions ): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.upstreamChanged.length > 0 && dd.wait === true,
  apply: ( bs: BasicStatus<S> ) => {
    const params = paramFn ( bs.paramNames )
    const cleared = dd.clear && bs.rawValue !== undefined;
    const value = cleared ? undefined : bs.rawValue;
    const changed = value !== bs.rawValue;
    return { ...bs, needsLoad: true, cleared, changed, value, params, reason: 'Async, upstream has changed' }
  }
})

/** When we are sync and the upstream has changed we can immediately calculate the value again. */
export const syncUpstreamsChanged = <S> ( paramFn: ParamFn, dd: DD<S, any> ): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.upstreamChanged.length > 0 && !dd.wait,
  apply: ( bs: BasicStatus<S> ) => {
    const params = paramFn ( bs.paramNames )
    const value = callDDF ( dd, bs.rawValue, params );
    const changed = value !== bs.rawValue;
    return { ...bs, evaluated: true, changed, value, params, reason: 'Sync, upstream has changed' }
  }
})


/** When we are sync and all upstreams are defined and unchanged, but we don't have a value yet, we need to calculate it*/
export const syncAllGoodButUndefined = <S> ( paramFn: ParamFn, dd: DD<S, any> ): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.rawValue === undefined && !dd.wait && bs.upstreamUndefined.length === 0 && bs.upstreamChanged.length === 0,
  apply: ( bs: BasicStatus<S> ) => {
    const params = paramFn ( bs.paramNames )
    const value = callDDF ( dd, bs.rawValue, params );
    return { ...bs, evaluated: true, changed: value !== bs.rawValue, value, params, reason: 'Sync, all upstreams are defined and unchanged, but we are undefined so need to evaluate' }
  }
})
/** When we async and all upstreams are defined and unchanged, but we don't have a value yet, we need to load it. It might be possible to merge this one into others*/
export const asyncAllGoodButUndefined = <S> ( paramFn: ParamFn, dd: DD<S, any> ): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.rawValue === undefined && dd.wait === true && bs.upstreamUndefined.length === 0 && bs.upstreamChanged.length === 0,
  apply: ( bs: BasicStatus<S> ) => {
    const params = paramFn ( bs.paramNames )
    return { ...bs, needsLoad: true, changed: false, value: bs.rawValue, params, reason: 'Async, all upstreams are defined and unchanged, but we are undefined so need to load' }
  }
})

/** Everything is OK. We have a value. Nothing has changed */
export const allGood = <S> (): PartialFunction<BasicStatus<S>, DDStatus<S>> => ({
  isDefinedAt: ( bs: BasicStatus<S> ) => bs.rawValue !== undefined && bs.upstreamUndefined.length === 0 && bs.upstreamChanged.length === 0,
  apply: ( bs: BasicStatus<S> ) => ({ ...bs, value: bs.rawValue, changed: bs.rawChanged, reason: 'All upstreams are defined and unchanged, our value is defined' })
})

export function calcStatusFor<S> ( status: NameAnd<DDStatus<S>>, dd: DD<S, any>, basics: BasicStatus<S> ): DDStatus<S> {
  const paramFn: ParamFn = calcParams ( status )
  const fn = chainOfResponsibility<BasicStatus<S>, DDStatus<S>> (
    ( bs ) => {throw new Error ( 'Chain didnt match for ' + JSON.stringify ( bs ) )},
    allGood<S> (),
    upstreamsUndefined<S> ( dd ),
    asyncUpstreamsChanged ( paramFn, dd ),
    syncUpstreamsChanged ( paramFn, dd ),
    syncAllGoodButUndefined ( paramFn, dd ),
    asyncAllGoodButUndefined ( paramFn, dd ),
  )
  return fn ( basics )
}
