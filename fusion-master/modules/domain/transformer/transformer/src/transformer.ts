import { NamedLoadResult, NamedUrl, NameSpaceDetailsForGit, nameSpaceDetailsForGit, parseNamedUrlOrThrow, UrlStore, UrlStoreParser } from "@itsmworkbench/urlstore";
import { findChildFiles, mapPathsK, pathListToJson, PathsInJson, removeLastExtension } from "@fusionconfig/utils";
import { ErrorsAnd, hasErrors, mapErrors, mapErrorsK, reportErrors } from "@laoban/utils";
import { defaultIgnoreFilter, FileOps } from "@laoban/fileops";
import path from "path";
import { YamlCapability } from "@itsmworkbench/yaml";


export type RequestTransformerMeta = {
  url: NamedUrl
  service: string
  task: string
  request: true
}
export type ResponseTransformerMeta = {
  url: NamedUrl
  service: string
  task: string
  response: true
}
export type TransformerMeta = RequestTransformerMeta | ResponseTransformerMeta
export type TransformMetaSummary = {
  path: string
  url: string
  id: string
  task: string
  service: string
  reqOrResp: string
  converter: string
}
export type TransformerPathAndLoadResult = {
  path: string
  tm: TransformerMeta
  loaded: NamedLoadResult<string>
  summary: TransformMetaSummary
}

export function transformerDirection ( m: TransformerMeta ): string {
  return (m as any).request ? 'request' : 'response'
}

export function pathToTransformerUrl ( path: string ): NamedUrl {
  return parseNamedUrlOrThrow ( `itsm/org/transformer/${removeLastExtension ( path )}` )
}

export type MetasAndErrors = { metas: TransformerPathAndLoadResult[], errors: string[] }

export async function loadPathToJsonForTransformers ( directory: string, fileOps: FileOps, ns: NameSpaceDetailsForGit ) {
  const start = path.join ( directory, 'org', ns.pathInGitRepo )
  const dotExtension = '.' + ns.extension
  const childFiles = await findChildFiles ( fileOps, defaultIgnoreFilter, s => s.endsWith ( dotExtension ) ) ( start )
  const json = pathListToJson ( childFiles, `Expecting only one file with extension ${dotExtension}: ` )
  return json;
}
export async function loadAllTransformersFromFileSystem ( fileOps: FileOps, urlStore: UrlStore, directory: string, ns: NameSpaceDetailsForGit ): Promise<MetasAndErrors> {
  const json = await loadPathToJsonForTransformers ( directory, fileOps, ns );
  if ( hasErrors ( json ) ) return { metas: [], errors: json }
  return await loadAllTransformers ( json, urlStore )
}

export const loadOneTransformerPathAndLoadResult = ( urlStore: UrlStore, path: string ) => async ( tm: TransformerMeta ): Promise<ErrorsAnd<TransformerPathAndLoadResult>> => mapErrors ( await urlStore.loadNamed<string> ( tm.url ), loaded => {
  const summary: TransformMetaSummary = {
    path, url: loaded.url,
    id: loaded.id, task: tm.task, service: tm.service,
    reqOrResp: transformerDirection ( tm ),
    converter: loaded.result
  }
  return { tm, loaded, path, summary }
} );

export async function loadAllTransformers ( json: PathsInJson, urlStore: UrlStore ): Promise<MetasAndErrors> {
  const x: ErrorsAnd<TransformerPathAndLoadResult>[] = await mapPathsK ( json, path =>
    mapErrorsK ( pathToTransformerMeta ( path ), loadOneTransformerPathAndLoadResult ( urlStore, path ) ) )
  const errors: string[] = []
  const metas: TransformerPathAndLoadResult[] = []
  x.forEach ( x => {
    if ( typeof x === 'string' ) errors.push ( x )
    else // this is actually a bug somewhere else
    if ( hasErrors ( x ) ) errors.push ( ...x )
    else {
      // console.log ( 'x', x )
      metas.push ( x )
    }
  } )
  return { metas, errors }
}


//Rule is that the path will be something like
// <task>.<service>.taskToService/ other stuff.jsonata
//.<task>.<service>.serviceToTask/ other stuff.jsonata
//so we need to to split by /

export const serviceToTask = 'service_to_task'
export const taskToService = 'task_to_service'
export function pathToTransformerMeta ( path: string ): ErrorsAnd<TransformerMeta> {
  const parts = path.split ( '/' )
  if ( parts.length < 3 ) return [ `Path ${path} does not have enough parts. Expecting <task>.<service>.${serviceToTask}/.. or <task>.<service>.${taskToService}/...` ]
  const task = parts[ 0 ]
  const service = parts[ 1 ]
  const direction = parts[ 2 ]
  if ( direction !== serviceToTask && direction !== taskToService ) return [ `Path ${path} does not have the correct 'direction' ${direction}. Expecting <task>.<service>.${serviceToTask}/.. or <task>.<service>.${taskToService}/...` ]
  const url = pathToTransformerUrl ( path )
  if ( direction === taskToService ) {
    return { task, service, request: true, url }
  } else
    return { task, service, response: true, url }
}

function transParser ( yaml: YamlCapability ): UrlStoreParser {return async ( id, s ) => yaml.parser ( s );}
export const transformNs = ( yaml: YamlCapability ): NameSpaceDetailsForGit =>
  nameSpaceDetailsForGit ( 'transformer', {
    parser: transParser ( yaml ),
    writer: yaml.writer,
    extension: 'yaml',
  } )