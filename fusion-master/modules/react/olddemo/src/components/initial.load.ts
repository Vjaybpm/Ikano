import { Optional } from "@focuson/lens";
import { allowedParamsL, currentParamsL, FusionState, selectedParamsL } from "../state/fusion.state";
import { EventStore } from "@itsmworkbench/eventstore";
import { setEventStoreValue } from "@itsmworkbench/eventstore/dist/src/event.store";
import { needToLoadIfNameAndStringDifferentOrUndefined } from "../state/fetchers";

export async function loadAndPlaceAtLens<S, T> ( container: EventStore<S>, url: string, optional: Optional<S, T> ) {
  const response = await fetch ( url )
  if ( response.status !== 200 ) {
    console.error ( 'Error loading config file', response )
  }
  const json = await response.json ()
  const oldValue = container.state
  const newValue = optional.set ( oldValue, json )
  if ( newValue !== undefined ) setEventStoreValue ( container ) ( newValue )
}

export function loadAndPlaceAtLensIfNeeded<S, T> ( container: EventStore<S>, url: string, optional: Optional<S, T>, needed: ( t: T | undefined ) => boolean ) {
  if ( needed ( optional.getOption ( container.state ) ) )
    loadAndPlaceAtLens ( container, url, optional )
}

export type InitialLoadContext = {
  container: EventStore<FusionState>
  baseUrl: string
  rootFileName: string //typically globaly.yaml.
}

const needToLoadParams = needToLoadIfNameAndStringDifferentOrUndefined ( currentParamsL, selectedParamsL )
export async function initialLoad ( context: InitialLoadContext ) {
  const { container, rootFileName, baseUrl } = context
  const s = container.state
  const loadedAllowedParams = s.allowed?.allowedParameters !== undefined

  loadAndPlaceAtLensIfNeeded ( container, `${baseUrl}/axes/${rootFileName}`, allowedParamsL, t => t === undefined )
  if (loadedAllowedParams){

    const loadedAllowedTasks = s.allowed?.allowedTasks !== undefined
    const loadedAllowedServices = s.allowed?.allowedTasks !== undefined

  }

}