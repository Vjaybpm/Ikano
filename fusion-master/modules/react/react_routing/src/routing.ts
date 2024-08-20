import { NameAnd } from "@laoban/utils";
import { Optional } from "@focuson/lens";
import { extractPathVariables, getQueryParams, makeSearchString } from "@fusionconfig/react_routing";

export type RoutingData<S> = {
  optionals: NameAnd<Optional<S, string>>
  templates: NameAnd<string>
  selectionO: Optional<S, string>
  parametersO: Optional<S, NameAnd<string>>
}

export function calculateRoute<S> ( data: RoutingData<S>, s: S ): string | undefined {
  const selected = data.selectionO.getOption ( s )
  if ( selected === undefined ) return undefined
  let template = data.templates[ selected ]
  if ( template === undefined ) return undefined
  for ( const key in data.optionals ) {
    const opt = data.optionals[ key ]
    const value = opt.getOption ( s )
    if ( value !== undefined )
      template = template.replace ( `{${key}}`, value )
  }
  const search = makeSearchString ( data.parametersO.getOption ( s ) )
  return template + (search.length > 0 ? '?' + search : '')
}

export function placeRouteInto<S> ( data: RoutingData<S>, path: string, s: S ): S {
  const index = path.indexOf ( '?' )
  const actualPath = index === -1 ? path : path.substring ( 0, index )
  const query = index === -1 ? '' : path.substring ( index + 1 )
  const params = getQueryParams ( query )
  const sWithParams = Object.keys ( params ).length > 0 ? data.parametersO.set ( s, params ) : s
  for ( const templateKey in data.templates ) {
    const template = data.templates[ templateKey ];
    const extracted = extractPathVariables ( template, actualPath );
    if ( extracted !== null ) {
      let acc: S = data.selectionO.set ( sWithParams, templateKey )
      for ( const key in extracted ) {
        const value = extracted[ key ];
        const opt = data.optionals[ key ];
        if ( opt === undefined ) throw new Error ( `No optional for ${key} in ${Object.keys ( data.optionals )}` )
        acc = opt.set ( acc, extracted[ key ] )
      }
      return acc
    }
  }
  return s
}
