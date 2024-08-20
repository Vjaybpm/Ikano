import { CommandDetails, ContextConfigAndCommander, SubCommandDetails } from "@itsmworkbench/cli";

import { ThereAndBackContext } from "./context";
import { NameSpaceDetailsForGit } from "@itsmworkbench/urlstore";
import { loadAllTransformersFromFileSystem, transformNs } from "@fusionconfig/transformer";
import { reportErrors } from "@laoban/utils";
import { allDomainDetails } from "@fusionconfig/alldomains";


export function listTransformersCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): CommandDetails<Commander> {
  return {
    cmd: 'list',
    description: 'finds all the transformers in the config',
    options: {
      '-d, --directory <directory>': { description: 'The directory that files are served from', default: tc.context.currentDirectory },
      '--full': { description: 'Show more data' },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts ) => {
      const { directory, debug, full } = opts
      const { metas, errors } = await loadAllTransformersFromFileSystem ( tc.context.fileOps,
        tc.context.urlStore ( directory.toString () ),
        directory as string, transformNs )

      if ( full ) metas.forEach ( m => {
        console.log ( m.path, JSON.stringify ( m, null, 2 ) )
      } )
      else
        console.log ( JSON.stringify ( metas.//
          map ( m => m.summary )
          .map ( ( { converter, ...rest } ) => rest ), null, 2 ) )
      if ( errors.length > 0 ) {
        reportErrors ( errors )
        process.exit ( 2 )
      }
    }
  }
}


export function validateTransformersCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): CommandDetails<Commander> {
  return {
    cmd: 'validate',
    description: 'validates all the transformers in the config',
    options: {
      '-d, --directory <directory>': { description: 'The directory that files are served from', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts ) => {
      const { directory, debug } = opts
      const { metas, errors } = await loadAllTransformersFromFileSystem ( tc.context.fileOps, tc.context.urlStore ( directory.toString () ), directory as string, transformNs )
      if ( errors.length > 0 ) {
        reportErrors ( errors )
        process.exit ( 2 )
      }
    }
  }
}
export function transformerCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig>, transformNs: NameSpaceDetailsForGit ): SubCommandDetails<Commander, ThereAndBackContext, Config> {
  return {
    cmd: 'transformer',
    description: 'Transformer commands',
    commands: [
      listTransformersCommand<Commander, Config, CleanConfig> ( tc, transformNs ),
      validateTransformersCommand<Commander, Config, CleanConfig> ( tc, transformNs ),
    ]
  }
}
