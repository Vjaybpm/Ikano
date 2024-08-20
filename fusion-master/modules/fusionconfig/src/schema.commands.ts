import { CommandDetails, ContextConfigAndCommander, SubCommandDetails } from "@itsmworkbench/cli";

import { ThereAndBackContext } from "./context";
import { NamedUrl, NameSpaceDetailsForGit, UrlQuery } from "@itsmworkbench/urlstore";
import { hasErrors, mapErrorsK, reportErrors } from "@laoban/utils";
import { schemaPathRequestToNamedUrl, schemaPathRequestToUrlQuery } from "@fusionconfig/schema";
import { ListNamesResult, parseNamedUrlOrThrow } from "@itsmworkbench/urlstore/";
import { samplePathToUrlQueryRequest, schemaNamedUrlAndNameToInputUrl } from "@fusionconfig/sample";
import { findCachedOrRawTransMapAndErrors, TransAndMeta } from "@fusionconfig/transformer";
import { jsonataTransformer } from "@fusionconfig/jsonata";

export function viewSchema<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): CommandDetails<Commander> {
  return {
    cmd: 'view <path>',
    description: 'Views the schema at the path',
    options: {
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts, path ) => {
      const { urlStore, debug } = opts
      const url = schemaPathRequestToNamedUrl ( path as string )
      const schema = await tc.context.urlStore ( urlStore.toString () ).loadNamed ( parseNamedUrlOrThrow ( url ) )
      console.log ( JSON.stringify ( schema, null, 2 ) )
      if ( hasErrors ( schema ) ) process.exit ( 2 )
    }
  }
}
export function listSchemas<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): CommandDetails<Commander> {
  return {
    cmd: 'list [path]',
    description: 'lists the schemas at the path (defaults to root)',
    options: {
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts, path ) => {
      const { urlStore: dir, debug } = opts
      const query = schemaPathRequestToUrlQuery ( path as string )
      const schema = await tc.context.urlStore ( dir.toString () ).list ( query )
      console.log ( JSON.stringify ( schema, null, 2 ) )
      if ( hasErrors ( schema ) ) process.exit ( 2 )
    }
  }
}
export function testReqSchema<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): CommandDetails<Commander> {
  return {
    cmd: 'test-request-schema',
    description: 'tests one task => service (so gets all the samples for the task and checks they match the schema)',
    options: {
      '-t, --task <task>': { description: 'The task to test', default: 'aml' },
      '-s, --service <service>': { description: 'The service to test', default: 'experian_aml' },
      '--list': { description: 'Just list the samples we can use', default: 'experian_aml' },
      '--cache': { description: 'Cache the urlstore' },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts ) => {
      const { urlStore: dir, debug } = opts
      if ( dir === undefined ) throw new Error ( 'urlStore is undefined ' )
      const taskSchemaUrl = parseNamedUrlOrThrow ( schemaPathRequestToNamedUrl ( `task/${opts.task}` ) )
      const serviceSchemaUrl = parseNamedUrlOrThrow ( schemaPathRequestToNamedUrl ( `service/${opts.service}` ) )
      const taskSamples: UrlQuery = samplePathToUrlQueryRequest ( `task/${opts.task}` )
      const serviceSamples: UrlQuery = samplePathToUrlQueryRequest ( `service/${opts.service}` )
      let urlStore = tc.context.urlStore ( dir.toString () );
      const { mapped, errors } = await findCachedOrRawTransMapAndErrors ( tc.context.fileOps, urlStore.toString (), urlStore.loadNamed ) ( opts.cache === true ) ()
      const res = await mapErrorsK ( await urlStore.loadNamed ( taskSchemaUrl ), async taskSchema =>
        mapErrorsK ( await urlStore.loadNamed ( serviceSchemaUrl ), async serviceSchema =>
          mapErrorsK ( await urlStore.list ( taskSamples ), async taskSamples =>
            mapErrorsK ( await urlStore.list ( serviceSamples ), async serviceSamples => {

              const txUrl: TransAndMeta | undefined = taskSchemaUrl?.url !== undefined && serviceSchemaUrl?.url !== undefined ? mapped[ taskSchemaUrl.url ]?.[ serviceSchemaUrl.url ] : undefined
              if ( debug ) {
                console.log ( 'txUrl', taskSchemaUrl.url, serviceSchema.url, JSON.stringify ( txUrl?.url?.url ) )
                console.log ( 'task schema url', JSON.stringify ( taskSchemaUrl ) )
                console.log ( 'task schema', JSON.stringify ( taskSchema ) )
                console.log ( 'service schema url', JSON.stringify ( serviceSchemaUrl ) )
                console.log ( 'service schema', JSON.stringify ( serviceSchema ) )
                console.log ( 'task samples', JSON.stringify ( taskSamples ) )
                console.log ( 'service samples', JSON.stringify ( serviceSamples ) )
              }
              if ( opts.list === true ) {
                function printOneSet ( title: string, url: NamedUrl, ls: ListNamesResult ) {
                  console.log ( title )
                  if ( ls.names.length === 0 ) console.log ( '  -- none --' )
                  console.log ( ls.names.map ( n => `   ${schemaNamedUrlAndNameToInputUrl ( url, n ).url}` ).join ( '\n' ) )
                  console.log ()
                }
                console.log ( 'Task schema', taskSchemaUrl.url )
                console.log ( 'Service Schema', serviceSchemaUrl.url )
                console.log ( 'Transformer', txUrl?.url?.url )
                printOneSet ( 'Task Samples', taskSchemaUrl, taskSamples )
                printOneSet ( 'Service Samples', serviceSchemaUrl, serviceSamples )
              } else {
                if ( txUrl === undefined ) {
                  console.log ( 'Could not find transformer' )
                  return
                } else {
                  console.log ( 'Testing' )
                  console.log ()
                  console.log ( 'Task schema', taskSchemaUrl.url )
                  console.log ( 'Service Schema', serviceSchemaUrl.url )
                  console.log ( 'Transformer', txUrl?.url?.url )
                  console.log ( txUrl.trans.jsonata )
                  const js = jsonataTransformer ( txUrl.trans.jsonata )

                  async function testOneSet ( title: string, url: NamedUrl, ls: ListNamesResult ) {
                    if ( ls.names.length === 0 ) console.log ( '  -- none --' )
                    async function testOne ( test: NamedUrl ) {
                      console.log ( `${title}  ${test.url}` )
                      const result = await mapErrorsK ( await urlStore.loadNamed<any> ( test ),
                        async testLr => {
                          console.log ( '   input', JSON.stringify ( testLr.result ) )
                          const output = await js ( testLr.result )
                          console.log ( '   output', JSON.stringify ( output ) )
                          //and now I can make any assertions I want
                        } )
                      if ( hasErrors ( result ) ) {
                        reportErrors ( result )
                      }
                      console.log ()
                    }
                    for ( let n of ls.names )
                      await testOne ( schemaNamedUrlAndNameToInputUrl ( url, n ) )

                  }
                  await testOneSet ( 'Task Samples', taskSchemaUrl, taskSamples )
                }
              }

            } ) ) ) )
      if ( hasErrors ( res ) ) {
        reportErrors ( res )
        process.exit ( 2 )
      }
    }
  }
}
export function schemaCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): SubCommandDetails<Commander, ThereAndBackContext, Config> {
  return {
    cmd: 'schema',
    description: 'Schema commands',
    commands: [
      testReqSchema<Commander, Config, CleanConfig> ( tc, transformNs ),
      listSchemas<Commander, Config, CleanConfig> ( tc, transformNs ),
      viewSchema<Commander, Config, CleanConfig> ( tc, transformNs ),
    ]
  }
}
