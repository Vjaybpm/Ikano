import { mapK } from "@laoban/utils";
import { callDDK, DD, DDK, findParams } from "./dependent.data.domain";
import { callListeners } from "@itsmworkbench/utils";
import { futureCache, FutureCache, getOrUpdateFromFutureCache } from "./future.cache";
import { AllDdStatus, calcStatusFor, DDStatus, findBasics, getFromOptional } from "./dependant.data.status";

function validateNoDuplicates<S> ( dds: DD<S, any>[] ) {
  const names = dds.map ( d => d.name )
  const duplicates = names.filter ( ( n, i ) => names.indexOf ( n ) !== i )
  if ( duplicates.length > 0 ) throw new Error ( `Duplicate names: ${duplicates}` )
}
function validateParamsDefined<S> ( dds: DD<S, any>[] ) {
  const names: string[] = []
  for ( const d of dds ) {
    const params = findParams ( d )
    for ( const p of params ) {
      if ( !names.includes ( p.name ) ) throw new Error ( `Param ${p.name} not found for ${d.name}` )
    }
    names.push ( d.name )
  }
}
export function validateDDs<S> ( dds: DD<S, any>[] ) {
  validateNoDuplicates ( dds );
  validateParamsDefined ( dds );
}

export function calcStatus<S> ( status: AllDdStatus<S>, dd: DD<S, any>, oldS: S, s: S ): DDStatus<S> {
  let basics = findBasics ( status, dd, oldS, s );
  return calcStatusFor ( status, dd, basics )
}

export function calcAllStatus<S> ( dds: DD<S, any>[], oldS: S, s: S ): AllDdStatus<S> {
  const status: AllDdStatus<S> = {}
  for ( const dd of dds ) {
    try {
      status[ dd.name ] = calcStatus ( status, dd, oldS, s )
    } catch ( e ) {
      console.error ( `Error calculating status for ${dd.name} in\n${JSON.stringify ( s, null, 2 )}` )
      throw e
    }
  }
  return status
}
export function foldIntoState<S> ( status: AllDdStatus<S>, dds: DD<S, any>[], s: S ) {
  let acc = s
  for ( const dd of dds ) {
    const st = status[ dd.name ];
    acc = st.changed ? dd.target.set ( acc, st.value ) : acc
  }
  return acc
}

export type  DependentDataEngine<S> = FutureCache<DD<S, any>> & {
  current: () => S,
  setS: ( s: S ) => void
}
export function dependentDataEngine<S> ( current: () => S, setS: ( s: S ) => void ): DependentDataEngine<S> {
  return {
    ...futureCache<DD<S, any>> (),
    current,
    setS
  }
}
export async function callAndWorkOutChanged<S> ( engine: DependentDataEngine<S>,
                                                 st: DDStatus<S>,
                                                 d: DDK<S, any> ): Promise<any> {
  const res: any = await getOrUpdateFromFutureCache ( engine, d, st.params, () => callDDK ( d, st.rawValue, st.params ) )
  const { current, setS } = engine
  const originalParamValues = st.params
  if ( originalParamValues === undefined ) throw new Error ( `Params are undefined for ${d.name}` )
  const s = current ()
  const params = findParams ( d )
  const currentParamValues = st.params.map ( ( p, i ) => getFromOptional ( 'asyncReturned', params[ i ].target, s ) )
  const changed = currentParamValues.filter ( ( cv, i ) => cv !== originalParamValues[ i ] )
  return { setS, res, s, changed };
}

async function callAsync<S> ( engine: DependentDataEngine<S>, st: DDStatus<S>, d: DDK<S, any>, setJson: ( s: S ) => void ) {
  const { setS, res, s, changed } = await callAndWorkOutChanged ( engine, st, d );
  if ( changed.length > 0 )
    callListeners ( engine.listeners, 'loadAbandoned', l => l.loadAbandoned ( d, `Changed ${changed}` ) )
  else
    setJson ( d.target.set ( s, res ) )
  return res;
}
/** The promise is just for testing. Normally we wouldn't wait for it. */
export function callAsyncs<S> ( engine: DependentDataEngine<S>, status: AllDdStatus<any>, dds: DD<S, any>[], setJson: ( s: S ) => void ): Promise<any[]> {
  const asyncs = dds.filter ( d => d.wait && status[ d.name ].needsLoad ) as DDK<S, any>[]
  return mapK ( asyncs, async ( d ) => {
    const st = status[ d.name ]
    return await callAsync ( engine, st, d, setJson )
  } )
}

export type SetJsonForDepDataOptions<S> = {
  debug?: () => boolean | undefined
  updateLogs?: ( s: S ) => S // called just before we update the value in the store allowing us to add in any logging/debugging into the state
  delay?: number
}
function extractDepDataOptionsWithSafeDefaults<S> ( options: SetJsonForDepDataOptions<S> ): Required<SetJsonForDepDataOptions<S>> {
  let { debug, updateLogs, delay } = options
  if ( debug === undefined ) debug = () => false
  if ( updateLogs === undefined ) updateLogs = ( s ) => s
  if ( delay === undefined ) delay = 100
  return { debug, updateLogs, delay };
}
let count = 0
export const setJsonForDepData = <S extends any> ( depEngine: DependentDataEngine<S> ) =>
  ( deps: DD<S, any>[], options: SetJsonForDepDataOptions<S> ) => {
    validateDDs ( deps )
    const cleanOptions = extractDepDataOptionsWithSafeDefaults<S> ( options );
    const { debug: debugFn, updateLogs, delay } = cleanOptions
    const setJson = ( s: S ) => {
      const debug = debugFn () === true;
      if ( debug ) console.log ( 'setJson', count++, s )
      const allStatus = calcAllStatus ( deps, depEngine.current (), s )
      if ( debug ) console.log ( 'allStatus', allStatus )
      const newS = foldIntoState ( allStatus, deps, s )
      const cleanedS = updateLogs ( newS )
      if ( debug ) console.log ( 'cleanedS', count, cleanedS )
      depEngine.setS ( cleanedS )
      setTimeout ( () => callAsyncs ( depEngine, allStatus, deps, setJson ), delay )
    };
    return setJson
  }
