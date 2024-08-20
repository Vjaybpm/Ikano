import { flatMap, NameAnd } from "@laoban/utils";
import { isLegalParameter, Parameter } from "./config";

export function validateHierarchy ( hierarchy: NameAnd<string> ): string[] {
  if ( hierarchy === undefined ) return []
  if ( typeof hierarchy !== 'object' ) return [ `Hierarchy must be an object` ]
  return flatMap ( Object.entries ( hierarchy ), ( [ k, v ] ) => {
    if ( typeof v !== 'string' ) return [ `Hierarchy value for '${k}' must be a string` ]
    return []
  } )
}
export function validateParameters ( dic: any, properties: NameAnd<Parameter> ): string[] {
  if ( properties === undefined ) return []
  if ( typeof properties !== 'object' ) return [ `Parameters must be an object` ]
  const notInProperties = Object.keys ( dic ).filter ( k => properties[ k ] === undefined )
  if ( notInProperties.length > 0 ) return [ `The parameters ${notInProperties.join ( ', ' )} are not allowed` ]
  return flatMap ( Object.entries ( properties ), ( [ k, v ] ) => {
    if ( dic[ k ] === undefined ) return [ `The parameter '${k}' is not defined` ]
    if ( isLegalParameter ( v ) ) {
      if ( !Array.isArray ( v.legal ) ) return [ `Legal values for '${k}' must be an array` ]
      for ( let lv in v.legal ) if ( typeof lv !== 'string' )
        return [ `Legal value for '${k}' must be a string` ]
      if ( !v.legal.includes ( dic[ k ] ) )
        return [ `The value '${dic[ k ]}' for '${k}' is not legal. Legal values are ${JSON.stringify ( v.legal )}` ]
    }
    return []
  } )
}

