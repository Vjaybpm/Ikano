import { CommandFn, HasCurrentDirectory } from "@itsmworkbench/cli";
import { startKoa } from "@itsmworkbench/koa";
import { fusionHandlers } from "./api";
import { CommentFactoryFunction, defaultCommentOffset, LoadFilesFn, PostProcessor } from "@fusionconfig/config";
import { UrlStore } from "@itsmworkbench/urlstore";
import { FileOps } from "@laoban/fileops";
import { YamlCapability } from "@itsmworkbench/yaml";
import { cleanTest, RunReqRespTests, TestEngine } from "@fusionconfig/tests";
import { ajvTest } from "@fusionconfig/ajv/src/ajv";
import { jsonataTransformer } from "@fusionconfig/jsonata";
import { jsonDiffPatchFn } from "@fusionconfig/jsondiffpatch";
import { runReqRespTestsUsingEngine } from "@fusionconfig/tests/src/test.engine";


export type  ApiCommandContext = HasCurrentDirectory & {
  fileOps: FileOps,
  loadFiles: LoadFilesFn
  postProcessors: ( cached: boolean, directory: string ) => PostProcessor[]
  commentFactoryFn: CommentFactoryFunction
  urlStore: ( dir: string ) => UrlStore
  yaml: YamlCapability
}
export function apiCommand<Commander, Context extends ApiCommandContext, Config> (): CommandFn<Commander, Context, Config> {
  return ( context, config ) => ({
    cmd: 'api ',
    description: 'Runs the api that supports the Wizard Of Oz',
    options: {
      '-d, --directory <directory>': { description: 'The directory that files are served from (config)', default: context.currentDirectory },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: context.currentDirectory },
      '-p, --port <port>': { description: 'Port to run the server on', default: "1235" },
      '--c, --comment-offset <commentOffset>': { description: 'The offset for the comments. How far to the right are the comments', default: defaultCommentOffset },
      '--cache': { description: 'Cache the urlstore' },
      '--debug': { description: 'More debug information ' },
      '-i,--id <idroot>': { description: "The root of the id store", default: "ids" }
    },
    action: async ( commander, opts ) => {
      console.log ( JSON.stringify ( opts, null, 2 ) )
      const {
              port, debug, directory, commentOffset: commentOffsetString,
              urlStore: dir, cache
            } = opts
      const commentOffset = Number.parseInt ( commentOffsetString.toString () )
      let debugBoolean = debug === true;
      console.log ( 'directory', directory )
      console.log ( 'port', port )
      console.log ( 'debug', debug )
      console.log ( 'cached', cache )

      let urlStore = context.urlStore ( dir.toString () );
      const testEngine: TestEngine = {
        clean: cleanTest ( urlStore.list ),
        loadNamed: urlStore.loadNamed,
        testSchema: ajvTest,
        compileTransfomer: jsonataTransformer,
        testTransformer: jsonDiffPatchFn
      }
      const rt: RunReqRespTests = runReqRespTestsUsingEngine ( testEngine )
      startKoa ( directory.toString (), Number.parseInt ( port.toString () ), debugBoolean,
        fusionHandlers ( directory.toString (), urlStore,
          context.fileOps,
          context.loadFiles,
          context.postProcessors ( opts.cache === true, dir.toString () ),
          context.yaml,
          context.commentFactoryFn ( commentOffset ),
          rt,
          directory.toString (), debugBoolean, ) )
    }
  })

}