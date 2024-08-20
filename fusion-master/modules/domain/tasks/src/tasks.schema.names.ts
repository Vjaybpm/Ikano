import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { NamedLoadResult, NamedUrl, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";

export type SchemaNameFn = ( task: string, requestOrResponse: string, taskPatterns: string[] ) => Promise<ErrorsAnd<NamedLoadResult<any>>>
export const defaultSchemaNameFn = ( nameToId: UrlLoadNamedFn, debug?: boolean ): SchemaNameFn =>
  async ( task: string, requestOrResponse: string, taskSchemas: string[] ): Promise<ErrorsAnd<NamedLoadResult<any>>> => {
    const realTaskNames = taskSchemas.map ( t =>
      t.replace ( /<task>/g, task ).replace ( /<reqOrResp>/g, requestOrResponse ) )
    const taskUrls: NamedUrl[] = realTaskNames.map ( t => ({ scheme: 'itsm', organisation: 'org', namespace: 'schema', name: t }) )
    if ( debug ) {
      console.log ( 'taskName', task )
      console.log ( 'requestOrResponse', requestOrResponse )
      console.log ( 'taskSchemas', taskSchemas )
      console.log ( 'realTaskNames', realTaskNames )
      console.log ( 'taskUrls', JSON.stringify ( taskUrls ) )
    }
    for ( let url of taskUrls ) {
      const found: ErrorsAnd<NamedLoadResult<any>> = await nameToId ( url )
      if ( !hasErrors ( found ) ) return { ...found, url: writeUrl ( url ) }
    }
    return [ `No schema found for ${task}/${requestOrResponse} in ${realTaskNames}` ]
  }
