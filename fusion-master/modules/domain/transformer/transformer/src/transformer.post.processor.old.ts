import { NamedLoadResult, NamedUrl, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";
import { addIdAndNameToMergedFromLoadResult, findPartInMerged, findStringArray, Merged, PostProcessor } from "@fusionconfig/config";
import { ErrorsAnd, hasErrors, mapErrors, NameAnd } from "@laoban/utils";

export type TransformerNameFn = ( task: string, service: string, requestOrResponse: string, transformerPatterns: string[] ) => Promise<ErrorsAnd<NamedLoadResult<any>>>


//We won't be using this. Just keeping it around in case I change my mind on how we do them
export const defaultTransformerNameFn = ( nameToId: UrlLoadNamedFn, debug?: boolean ): TransformerNameFn =>
  async ( task: string, service: string, requestOrResponse: string, transformerPatterns: string[] ): Promise<ErrorsAnd<NamedLoadResult<any>>> => {
    const realTransformerNames = transformerPatterns.map ( t =>
      t.replace ( /<task>/g, task ).replace ( /<service>/g, service ).replace ( /<reqOrResp>/g, requestOrResponse ) )
    const taskUrls: NamedUrl[] = realTransformerNames.map ( t => ({ scheme: 'itsm', organisation: 'org', namespace: 'transformer', name: t }) )
    if ( debug ) {
      console.log ( 'taskName', task )
      console.log ( 'service', service )
      console.log ( 'requestOrResponse', requestOrResponse )
      console.log ( 'transformerPatterns', transformerPatterns )
      console.log ( 'realTransformerNames', realTransformerNames )
      console.log ( 'taskUrls', JSON.stringify ( taskUrls ) )
    }
    for ( let url of taskUrls ) {
      const found: ErrorsAnd<NamedLoadResult<any>> = await nameToId ( url )
      if ( !hasErrors ( found ) ) return { ...found, url: writeUrl ( url ) }
    }
    return [ `No transformers found for ${task}/${requestOrResponse} in ${realTransformerNames}` ]
  }


export async function addTransformerToRequestOrResponse ( transformerNameFn: TransformerNameFn,
                                                          taskName: string,
                                                          service: string,
                                                          task: Merged,
                                                          requestOrResponse: string,
                                                          transformerPatterns: string[],
                                                          addedBy: string ): Promise<ErrorsAnd<Merged>> {
  const reqResp = findPartInMerged ( task, requestOrResponse )
  return mapErrors ( await transformerNameFn ( taskName, service, requestOrResponse, transformerPatterns ),
    async ( transformerLoaded: NamedLoadResult<any> ) =>
      addIdAndNameToMergedFromLoadResult ( reqResp, 'transformer', transformerLoaded, addedBy ) )
}

export function addTransformersToTasks ( transformerNameFn: TransformerNameFn ): PostProcessor {
  return {
    key: 'tasks',
    postProcess: async ( full: Merged, tasks: Merged, params: NameAnd<string>, debug: boolean ): Promise<ErrorsAnd<Merged>> => {
      if ( debug ) console.log ( 'addTransformersToTasks' )
      if ( typeof tasks.value !== 'object' ) return [ 'tasks is not an object' ]
      const transformers = findPartInMerged ( full, 'where.transformers' )
      if ( !transformers ) return [ 'No where.transformers found. These are used to control where we look for transformers' ]
      const transformerNames = findStringArray ( transformers )
      if ( transformerNames.length === 0 ) return [ `No where.transformers found. These are used to control where we look for transformers - had value but wasn't an array of string. This might look like  "task.<task>.<reqOrResp>.\${geo}.\${product}.\${channel}"` ]
      const taskNames = Object.keys ( tasks.value )
      if ( debug ) {
        console.log ( 'taskNames', taskNames, )
        console.log ( 'transformerNames', transformerNames, )
      }
      const errors: string[] = []
      for ( let taskName of taskNames ) {
        const task = findPartInMerged ( tasks, taskName )
        const serviceName = findPartInMerged ( task, 'service' )?.value
        if ( !serviceName ) errors.push ( `No service found for tasks ${taskName}. This is mandatory field: we need to know which service will be providing the task` )
        else if ( typeof serviceName !== 'string' ) errors.push ( `The service found for tasks ${taskName} was not a string. It should just be the service name. It was ${JSON.stringify ( serviceName )}` )
        else {
          const req = await addTransformerToRequestOrResponse ( transformerNameFn, taskName, serviceName, task, 'request', transformerNames, 'addTransformersToTasks' )
          if ( hasErrors ( req ) ) errors.push ( ...req )
          const res = await addTransformerToRequestOrResponse ( transformerNameFn, taskName, serviceName, task, 'response', transformerNames, 'addTransformersToTasks' )
          if ( hasErrors ( res ) ) errors.push ( ...res )
        }
      }
      if ( errors.length > 0 ) return [ `Error processing 'addTransformersToTasks'`, ...errors ]
      return full
    }
  }
}