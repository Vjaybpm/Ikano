import { CommandDetails, ContextConfigAndCommander, HasCurrentDirectory, SubCommandDetails } from "@itsmworkbench/cli";
import { UrlStore, UrlQuery } from "@itsmworkbench/urlstore";
import { hasErrors, mapErrors, mapErrorsK } from "@laoban/utils";


export interface TestContext extends HasCurrentDirectory {
  urlStore: ( dir: string ) => UrlStore
}

export function listTestsCommand<Commander, Context extends TestContext, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, Context, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'list [schema]',
    description: 'lists all the tests for the schema',
    options: {
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts, schema ) => {
      const { debug, urlStore: dir } = opts;
      if ( dir === undefined ) throw new Error ( 'urlStore is undefined ' )
      const urlStore = tc.context.urlStore ( dir.toString () );
      const inputQuery: UrlQuery = { org: 'org', namespace: 'input_sample', pageQuery: { page: 1, pageSize: 100 }, order: 'name', path: schema?.toString () };
      const outputQuery: UrlQuery = { ...inputQuery, namespace: 'input_sample' }
      const results = await mapErrorsK ( await urlStore.list ( inputQuery ), async inputs =>
        mapErrors ( await urlStore.list ( outputQuery ), outputs => ({ inputs: inputs.names, outputs: outputs.names, dirs: (inputs as any).dirs }) ) )
      if ( hasErrors ( results ) ) {
        console.log ( JSON.stringify ( results, null, 2 ) )
        process.exit ( 2 )
      }
      const { inputs, outputs, dirs } = results;
      const all = [ ...new Set ( inputs.concat ( outputs ) ) ].sort ();
      console.log ( 'dirs', dirs )
      all.forEach ( a => console.log ( a, inputs.includes ( a ), outputs.includes ( a ) ) )


    }
  }
}


export function testCommands<Commander, Context extends TestContext, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, Context, Config, CleanConfig> ): SubCommandDetails<Commander, Context, Config> {
  return {
    cmd: 'tests',
    description: 'Test commands',
    commands: [
      listTestsCommand ( tc )
    ]
  }
}
