import { UrlLoadNamedFn, UrlStore } from "@itsmworkbench/urlstore";
import { addIdAndNameToMerged, addIdAndNameToMergedFromLoadResult, findPartInMerged, Merged, PostProcessor } from "@fusionconfig/config";
import { ErrorsAnd, hasErrors, mapErrors, NameAnd } from "@laoban/utils";
import { loadOneTransformerPathAndLoadResult, pathToTransformerMeta, TransformerPathAndLoadResult } from "./transformer";
import { defaultIgnoreFilter, FileOps } from "@laoban/fileops";
import { findChildFiles, findFirstPath, PathsInJson } from "@fusionconfig/utils";
import { defaultPathToUrl, loadAndMapTrans, TransMapAndErrors } from "./domain.transformation.loadfiles";
import { validateTrans } from "./domain.transform";

export async function addTransformerToRequestOrResponse (
  task: Merged,
  tx: TransformerPathAndLoadResult,
  addedBy: string ): Promise<ErrorsAnd<Merged>> {
  const reqResp = findPartInMerged ( task, tx.summary.reqOrResp )
  return addIdAndNameToMergedFromLoadResult ( reqResp, 'transformer', tx.loaded, addedBy )
}
function findSchemaName ( context: string, merged: Merged|undefined, path: string ): ErrorsAnd<string> {
  if ( merged === undefined ) return [ `${context}. No merged found when findSchemaName. Path is ${path}` ]
  const schemaName = findPartInMerged ( merged, path )?.value
  if ( !schemaName ) return [ `${context}. No ${path} found. This should be the name of the schema to use. It probably should have been added by another transformer` ]
  if ( typeof schemaName !== 'string' ) return [ `${context}. The item at ${path}  was not a string. it was ${typeof schemaName}. It should just be the name of the schema to use. It was ${JSON.stringify ( schemaName )}` ]
  return schemaName
}

async function processRequestAndResponse ( task: Merged, taskName: string, direction: string, transformerNames: string[], serviceName: string, pathsInJson: PathsInJson, urlStore: UrlStore, debug: boolean ) {
  const errors: string[] = []
  const modifiedTransformerNames = transformerNames.map (
    t => t.replace ( '<task>', taskName ).replace ( '<service>', serviceName ).replace ( '<direction>', direction ) )
  const found = findFirstPath ( modifiedTransformerNames, pathsInJson )
  if ( debug ) {
    console.log ( 'now I have everything I need' )
    console.log ( 'taskName', taskName, )
    console.log ( 'serviceName', serviceName, )
    console.log ( 'modifiedTransformerNames', modifiedTransformerNames, )
    console.log ( 'pathsInJson', JSON.stringify ( pathsInJson, null, 2 ) )
    console.log ( 'found', found )
  }
  if ( !found ) errors.push ( `No transformer found for ${taskName} and ${serviceName} with direction ${direction} ` ); else {
    const meta = pathToTransformerMeta ( found )
    if ( hasErrors ( meta ) ) errors.push ( ...meta ); else {
      if ( debug ) console.log ( 'meta', meta )
      const loaded = await loadOneTransformerPathAndLoadResult ( urlStore, found ) ( meta )
      if ( debug ) console.log ( 'loaded', loaded )
      if ( hasErrors ( loaded ) ) errors.push ( ...loaded ); else {
        const addT = await addTransformerToRequestOrResponse ( task, loaded, 'addTransformersToTasks' )
        if ( hasErrors ( addT ) ) errors.push ( ...addT )
      }
    }
  }
  if ( errors.length > 0 ) return [ `Error processing 'addTransformersToTasks'`, ...errors ]
  return task
}

export type FindTransMapAndErrors = () => Promise<TransMapAndErrors>

export function findTransformerNames ( fileOps: FileOps, directory: string, load: UrlLoadNamedFn ): FindTransMapAndErrors {
  return async () => {
    const paths = await findChildFiles ( fileOps, defaultIgnoreFilter, s => s.endsWith ( '.yaml' ) ) ( directory )
    const loadedTransformers = await loadAndMapTrans ( load, paths, validateTrans, defaultPathToUrl ( 'org' ) )
    return loadedTransformers
  }
}

export function cachedFindTransMapAndErrors ( findTransMapAndErrors: FindTransMapAndErrors ): FindTransMapAndErrors {
  let loaded: TransMapAndErrors | undefined
  return async () => {
    if ( !loaded ) {
      console.log ( 'cachedFindTransMapAndErrors - loading' )
      loaded = await findTransMapAndErrors ()
    }
    return loaded
  }
}

export const findCachedOrRawTransMapAndErrors = ( fileOps: FileOps, directory: string, load: UrlLoadNamedFn ) => ( cache: boolean | undefined ): FindTransMapAndErrors => {
  // console.log ( 'findCachedOrRawTransMapAndErrors', cache )
  let raw = findTransformerNames ( fileOps, directory, load );
  return cache ? cachedFindTransMapAndErrors ( raw ) : raw;
};
export function addTransformersToTasks ( findTransMapAndErrors: FindTransMapAndErrors, allowErrors?: boolean ): PostProcessor {
  return {
    key: 'tasks',
    postProcess: async ( full: Merged, tasks: Merged, params: NameAnd<string>, debug: boolean|undefined ): Promise<ErrorsAnd<Merged>> => {
      if ( debug ) console.log ( 'addTransformersToTasks' )
      const loadedTransformers = await findTransMapAndErrors ()
      if ( debug ) console.log ( 'loadedTransformers', JSON.stringify ( loadedTransformers ) )
      if ( loadedTransformers.errors.length > 0 && !allowErrors ) return loadedTransformers.errors
      if ( typeof tasks.value !== 'object' ) return [ 'tasks is not an object' ]
      if ( debug ) console.log ( '3' )
      const taskNames = Object.keys ( tasks.value )
      if ( debug ) {
        console.log ( 'taskNames', taskNames, )
        console.log ( 'loadedTransformers', JSON.stringify ( loadedTransformers, null, 2 ) )
      }
      const errors: string[] = []
      for ( let taskName of taskNames ) {
        const task = findPartInMerged ( tasks, taskName )
        const serviceName = findPartInMerged ( task, 'service' )?.value
        if ( !serviceName ) errors.push ( `No service found for tasks ${taskName}. This is mandatory field: we need to know which service will be providing the task` )
        else if ( typeof serviceName !== 'string' ) errors.push ( `The service found for tasks ${taskName} was not a string. It should just be the service name. It was ${JSON.stringify ( serviceName )}` )
        else {
          if ( debug ) {
            console.log ( 'taskName/serviceName', taskName, serviceName )
          }
          const loaded = mapErrors ( findSchemaName ( `Task ${taskName}`, task, 'request.schema.name' ), taskReqSchemaName => {
            return mapErrors ( findSchemaName ( `Task ${taskName}`, task, 'request.kafka.name' ), serviceReqSchemaName => {
              return mapErrors ( findSchemaName ( `Task ${taskName}`, task, 'response.schema.name' ), taskResSchemaName => {
                return mapErrors ( findSchemaName ( `Task ${taskName}`, task, 'response.kafka.name' ), serviceResSchemaName => {
                  const taskToService = loadedTransformers.mapped?.[ taskReqSchemaName ]?.[ serviceReqSchemaName ]
                  const serviceToTask = loadedTransformers.mapped?.[ serviceResSchemaName ]?.[ taskResSchemaName ]
                  if ( debug ) {
                    console.log ( '   taskReqSchemaName', taskReqSchemaName, )
                    console.log ( '   serviceReqSchemaName', serviceReqSchemaName, )
                    console.log ( '   taskResSchemaName', taskResSchemaName, )
                    console.log ( '   serviceResSchemaName', serviceResSchemaName, )
                    console.log ( '   taskToService', JSON.stringify ( taskToService ) )
                    console.log ( '   serviceToTask', JSON.stringify ( serviceToTask ) )
                  }

                  const er1 = addIdAndNameToMerged ( findPartInMerged ( task, 'request' ), 'transformer', taskToService?.id || 'not found', taskToService?.name || 'not found', `addTransformersToTasks(${taskReqSchemaName} ==> ${serviceReqSchemaName})` )
                  const er2 = addIdAndNameToMerged ( findPartInMerged ( task, 'response' ), 'transformer', taskToService?.id || 'not found', serviceToTask?.name || 'not found', `addTransformersToTasks(${serviceResSchemaName} ==> ${taskResSchemaName} )` )
                  if ( hasErrors ( er1 ) ) errors.push ( ...er1 )
                  if ( hasErrors ( er2 ) ) errors.push ( ...er2 )
                  if ( !allowErrors ) {
                    if ( !taskToService ) errors.push ( `Task ${taskName} Service ${serviceName} No request transformer found for ${taskReqSchemaName} ==> ${serviceReqSchemaName} ` )
                    if ( !serviceToTask ) errors.push ( `Task ${taskName} Service ${serviceName} No response transformer found for ${serviceResSchemaName} ==> ${taskResSchemaName} ` )
                  }
                  return full
                } )
              } )
            } )
          } )
          if ( hasErrors ( loaded ) ) errors.push ( ...loaded );
        }
      }
      if ( errors.length > 0 ) return [ `Error processing 'addTransformersToTasks'`, ...errors ]
      return full
    }
  }
}