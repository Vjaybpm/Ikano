import { NameAnd, toArray } from "@laoban/utils";

export type MergeInput = {
  file: string
  yaml: any | undefined
}

export interface Merged {
  value: string | number | boolean | NameAnd<Merged> | Merged[];
  files: string[];
}
export function isMerged ( obj: any ): obj is Merged {
  return obj?.value !== undefined && obj?.files !== undefined
}

export function findPartInMerged ( dic: Merged | undefined, ref: string ): Merged | undefined {
  if ( dic === undefined ) return undefined
  if ( ref === undefined ) return undefined
  if ( ref === '' ) return dic
  const parts = ref.split ( '.' )
  try {
    return parts.reduce ( ( acc, part ) => (acc?.value as any)?.[ part ], dic )
  } catch ( e ) {return undefined}
}


export const intoMerged = ( file: string ) => ( input: any ): Merged => {
  const t = typeof input
  try {
    if ( t === 'string' || t === 'number' || t === 'boolean' ) return { value: input, files: [ file ] }
    if ( Array.isArray ( input ) ) return { value: input.map ( intoMerged ( file ) ), files: [ file ] }
    if ( t === 'object' ) return { value: Object.entries ( input ).reduce ( ( acc, [ key, value ] ) => ({ ...acc, [ key ]: intoMerged ( file ) ( value ) }), {} as NameAnd<Merged> ), files: [ file ] }
  } catch ( e ) {
    throw new Error ( `Being added by ${file} Don't know how to process ${input}\n ${e}` )
  }
  throw new Error ( `Being added by ${file} Don't know how to process ${t} - ${input}` )
};
export function mergeObjectInto ( acc: Merged, input: MergeInput ): Merged {
  if ( typeof acc?.value !== 'object' )
    return mergeObjectInto ( { value: {}, files: toArray ( acc?.files ) }, input )
  const accObj = acc.value as NameAnd<Merged>
  const newObj = input.yaml as NameAnd<any>
  if ( newObj === undefined ) return acc
  const allKeys = [ ...new Set ( [ ...Object.keys ( accObj ), ...Object.keys ( newObj ) ] ) ].sort ()
  const merged = allKeys.reduce ( ( acc, key ) => {
    let accValue = accObj[ key ]
    const newValue = newObj[ key ]
    if ( newValue === undefined )
      return { ...acc, [ key ]: accValue }
    if ( accValue === undefined )
      return { ...acc, [ key ]: intoMerged ( input.file ) ( newValue ) }
    else
      return { ...acc, [ key ]: merge ( accValue, { file: input.file, yaml: newValue } ) }
  }, {} as NameAnd<Merged> )
  return { value: merged, files: [ ...acc.files, input.file ] }

}
export function mergeArrayInto ( acc: Merged, input: MergeInput ) {
  if ( Array.isArray ( acc?.value ) )
    return {
      value: [ ...acc.value,
        ...input.yaml.map ( intoMerged ( input.file ) ) ],
      files: [ ...acc.files, input.file ]
    }
  return mergeArrayInto ( { value: [], files: toArray ( acc?.files ) }, input )
}
export function postProcessArray ( acc: Merged ): Merged {
  if ( !Array.isArray ( acc.value ) ) return acc
  const value = acc.value as Merged[]
  value.sort ( ( a, b ) => a.value.toString ().localeCompare ( b.value.toString () ) )
  //remove dups
  const set: NameAnd<string[]> = {}

  const withoutDups: Merged[] = []

  for ( let v of value ) {
    let s = v.value.toString ();
    let isDup = Object.keys ( set ).includes ( s );
    set[ s ] = [ ...set[ s ] || [], ...v.files ]
    if ( isDup ) continue
    withoutDups.push ( v )
  }
  const result: Merged[] = []
  for ( let v of withoutDups ) result.push ( { value: v.value, files: set[ v.value.toString () ] } )
  return { value: result, files: acc.files }

}
export function mergePrimitiveInto ( acc: Merged, input: MergeInput ): Merged {
  if ( input.yaml === undefined ) return { ...acc, files: [ ...acc.files, input.file ] }
  if ( acc.value === undefined ) return { value: input.yaml, files: [ input.file ] }
  return { value: input.yaml, files: [ ...acc.files, input.file ] }
}


export function merge ( acc: Merged , input: MergeInput ): Merged {
  // if ( acc.value === undefined ) return { value: input.yaml, files: [ input.file ] }
  if ( Array.isArray ( input.yaml ) ) return postProcessArray ( mergeArrayInto ( acc, input ) )
  if ( typeof input.yaml === 'object' ) return mergeObjectInto ( acc, input )
  if ( typeof input.yaml === 'string' || typeof input.yaml === 'number' || typeof input.yaml === 'boolean' )
    return mergePrimitiveInto ( acc, input )
  throw new Error ( `Don't know how to process ${typeof acc.value} - ${input.yaml}` )
}

