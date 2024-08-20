import { findPartInMerged, isMerged, Merged } from "./merge";
import { ErrorsAnd, hasErrors, mapErrors, NameAnd } from "@laoban/utils";
import { IdentityUrl, NamedLoadResult, NamedUrl, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";
import { findStringArray } from "./extract.from.merged";
import { type } from "node:os";


//This is an implied contract at the moment that config is the actual json object that sorted represents.
//It's not enformed. config is really the 'place to get the info we need to post process and we update sorted with it'. but
//it's very cool if that is the sorted => yaml => json. Massively boosts config cohession

//A concrete example is we want to enrich this. We will add the request schema
//based on what schemas exist. We have a list of the file names that are schemas
//and pick the first one that is relevant based on the ordering in the config file
//the list of schemas would be curried into the specific post processor

// internal_pricingService:
//   description: "Internal pricing service for product and service pricing adjustments."
// request:
//   topic: "internal.pricing.request"
// response:
//   topic: "internal.pricing.response"

export type PostProcessor = {
  key: string //we modify this key. At the moment must be a root thing. Might change this later

  //sorted Value is the current value of the key we return a new value.
  //promise so that we can async things like file system look ups
  //ErrorsAnd so that we can return errors
  postProcess: ( full: Merged, sortedValue: Merged, params: NameAnd<string>, debug: boolean | undefined ) => Promise<ErrorsAnd<Merged>>
}

export async function postProcess ( processors: PostProcessor[], sorted: Merged, params: NameAnd<string>, debug?: boolean ): Promise<ErrorsAnd<Merged>> {
  const acc = sorted
  const errors: string[] = []
  for ( let p of processors ) {
    const value = (acc.value as any)[ p.key ]
    if ( isMerged ( value ) ) {
      const result = await p.postProcess ( sorted, value, params, debug )
      if ( hasErrors ( result ) ) errors.push ( ...result )
    }
  }
  if ( errors.length > 0 ) return errors
  return acc
}


// export function addNameStringToMerged ( merged: Merged, name: string, value: string, addedBy: string ): ErrorsAnd<Merged> {
//   if ( typeof merged.value !== 'object' ) return [ `Was trying to add ${name}:${value} # ${addedBy} but is not an object` ]
//   const newMerged = { value, files: [ addedBy ] }
//   if ( typeof merged.value === 'object' ) merged.value[ name ] = newMerged
//   return merged
// }
// export function addNameMergedToMerged ( merged: Merged, name: string, value: Merged, addedBy: string ): ErrorsAnd<Merged> {
//   if ( typeof merged.value !== 'object' ) return [ `Was trying to add ${name}:${JSON.stringify ( value )} # ${addedBy} but is not an object` ]
//   merged.value[ name ] = value
//   return merged
// }
export function addIdAndNameToMergedFromLoadResult ( merged: Merged | undefined, name: string, lr: NamedLoadResult<any>, addedBy: string ): ErrorsAnd<Merged> {
  return addIdAndNameToMerged ( merged, name, lr.id, lr.url, addedBy )
}
export function addIdAndNameToMerged ( merged: ErrorsAnd<Merged> | undefined, name: string, id: string, nameFromUrl: string, addedBy: string ): ErrorsAnd<Merged> {
  if ( merged === undefined ) return [ `Was trying to add ${name} = ${id}:${nameFromUrl} # ${addedBy} but the thing I am merging into is undefined` ]
  if ( hasErrors ( merged ) ) return merged
  if ( typeof merged.value !== 'object' ) return [ `Was trying to add ${name} = ${id}:${nameFromUrl} # ${addedBy} but is not an object` ]
  const nameMerged = { value: nameFromUrl, files: [ addedBy ] }
  const idMerged = { value: id, files: [ addedBy ] }
  const newMerged = { value: { name: nameMerged, id: idMerged, }, files: [ addedBy ] }
  const mergedValue: any = merged.value
  mergedValue[ name ] = newMerged
  return merged
}

export function addAllFieldsInMergedToMerge ( merged: Merged, value: Merged, addedBy: string ): ErrorsAnd<Merged> {
  if ( typeof merged.value !== 'object' ) return [ `Was trying to add ${JSON.stringify ( value )} # ${addedBy} but the thing I am merging into is not is not an object\n${JSON.stringify ( merged )}` ]
  if ( typeof value.value !== 'object' ) return [ `Was trying to add ${JSON.stringify ( value )} # ${addedBy} but the value is not an object` ]
  if ( Array.isArray ( merged.value ) ) return [ `Was trying to add ${JSON.stringify ( value )} # ${addedBy} but the thing I am merging into is an array\n${JSON.stringify ( merged )}` ]
  for ( let key in value.value ) {
    merged.value[ key ] = (value.value as any) [ key ]
  }
  return merged
}
export function removeKey ( key: string ): PostProcessor {
  return {
    key,
    postProcess:
      async ( full: Merged, ignore: Merged, params: NameAnd<string>, debug: boolean | undefined ): Promise<ErrorsAnd<Merged>> => {
        if ( typeof full.value === 'object' && !Array.isArray ( full.value ) ) delete full.value[ key ]
        return full
      }
  }
}
