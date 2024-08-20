import { CommandDetails, ContextConfigAndCommander, SubCommandDetails } from "@itsmworkbench/cli";
import path from "path";
import { findPart, flatMap, NameAnd, toArray } from "@laoban/utils";

import { ThereAndBackContext } from "./context";
import { defaultCommentOffset, findPartInMerged, loadAndMergeAndYamlParts } from "@fusionconfig/config";
import { parseParams, permutate } from "@fusionconfig/utils";


function fromOpts ( opts: NameAnd<string | boolean> ) {
  const params = parseParams ( opts.params )
  const file = opts.file as string
  const parent = path.dirname ( file )
  const commentOffset = parseInt ( opts.commentOffset as string )
  const raw = opts.raw === true
  const urlStore = opts.urlStore as string
  const cache = opts.cache === true
  return { params, file: path.basename ( file ), parent, commentOffset, raw, urlStore, cache };
}
export function viewConfigCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, any, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'view',
    description: 'View the current configuration',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '-p, --params <params>': { description: 'The parameters to use. Comma seperated attribute=value' }
    },
    action: async ( _, opts ) => {
      const { params, file, parent } = fromOpts ( opts );
      console.log ( "Options: ", params, parent, file )
    }
  }
}
export function listFilesCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'list',
    description: 'List the files that are loaded',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '-p, --params <params>': { description: 'The parameters to use. Comma seperated attribute=value' },
      '--debug': { description: 'Show debug information' },
      '--full': { description: 'Show more data about the files' },
      '--errors': { description: 'Just show errors' }
    },
    action: async ( _, opts ) => {
      const { params, file, parent } = fromOpts ( opts );
      const fileDetails = await tc.context.loadFiles ( params, parent, file, opts.debug === true )
      const errors = fileDetails.filter ( f => f.errors.length > 0 )
      if ( opts.errors )
        errors.forEach ( f => console.log ( f ) )
      else if ( opts.full )
        fileDetails.forEach ( ( { yaml, ...rest } ) => console.log ( rest ) )
      else {
        fileDetails.forEach ( f => console.log ( f.file ) )
        if ( errors.length > 0 ) {
          console.log ( 'Errors:' )
          fileDetails.filter ( f => f.errors.length > 0 ).forEach ( f => console.log ( f.file, f.errors ) )
        }
      }
      if ( errors.length > 0 ) process.exit ( 1 )
    }
  }

}
export function mergeFilesCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'merge',
    description: 'Produces the composite merged file',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '-p, --params <params>': { description: 'The parameters to use. Comma seperated attribute=value' },
      '--c, --comment-offset <commentOffset>': { description: 'The offset for the comments. How far to the right are the comments', default: defaultCommentOffset },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--raw': { description: `Don't run the post processors` },
      '--debug': { description: 'Show debug information' },
      '--full': { description: 'Show more data about the files' }
    },
    action: async ( _, opts ) => {
      const { params, file, parent, commentOffset, raw, urlStore, cache } = fromOpts ( opts );
      const postProcessors = raw ? [] : tc.context.postProcessors ( cache, urlStore )
      let { fileDetails, errors, postProcessorErrors, sorted, yaml } =
            await loadAndMergeAndYamlParts ( tc.context.loadFiles, postProcessors, tc.context.commentFactoryFn ( commentOffset ), params, parent, file, opts.debug === true );

      if ( errors.length > 0 ) {
        console.log ( 'Errors:' )
        fileDetails.filter ( f => f.errors.length > 0 ).forEach ( f => console.log ( f.file, f.errors ) )
        process.exit ( 1 )
      }
      if ( postProcessorErrors !== undefined && postProcessorErrors.length > 0 ) {
        console.log ( 'Post Processor Errors:' )
        postProcessorErrors.forEach ( f => console.log ( f ) )
        process.exit ( 1 )
      }
      if ( opts.full === true )
        console.log ( JSON.stringify ( sorted.value, null, 2 ) )
      else {
        console.log ( yaml )
      }
    }
  }
}

export function checkPermutationsCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'check',
    description: 'Checks all the permutations',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '--c, --comment-offset <commentOffset>': { description: 'The offset for the comments. How far to the right are the comments', default: defaultCommentOffset },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--cache': { description: 'Cache the urlstore' },
      '--raw': { description: `Don't run the post processors` },
      '--debug': { description: 'Show debug information' },
      '--full': { description: 'Show more data about the files' }
    },
    action: async ( _, opts ) => {
      const { file, parent, commentOffset, raw, urlStore, cache } = fromOpts ( opts );
      console.log ( 'cache', opts.cache === true )

      const postProcessors = raw ? [] : tc.context.postProcessors ( cache, urlStore )

      const initialFile = await tc.context.fileOps.loadFileOrUrl ( path.join ( parent, file ) )
      const initialFileAsYaml = tc.context.yaml.parser ( initialFile )
      const parameters = initialFileAsYaml.parameters
      if ( parameters === undefined ) {
        console.log ( 'No parameters found in ', opts.file )
        process.exit ( 1 )
      }

      const parameterNames = Object.keys ( parameters )
      console.log ( "Checking permutations" )
      for ( let parameterName of parameterNames ) {
        const values = parameters[ parameterName ]
        console.log ( '   ', parameterName + ':', values )
      }
      permutate ( parameters, async ( params ) => {
        console.log ( 'Permutation:', params )
        let { fileDetails, errors, postProcessorErrors, sorted, yaml } =
              await loadAndMergeAndYamlParts ( tc.context.loadFiles, postProcessors, tc.context.commentFactoryFn ( commentOffset ), params, parent, file, opts.debug === true );

        if ( errors.length > 0 ) {
          console.log ( '   Errors:' )
          fileDetails.filter ( f => f.errors.length > 0 ).forEach ( f => console.log ( '      ', f.file, f.errors ) )
        }
        if ( postProcessorErrors && postProcessorErrors?.length > 0 ) {
          console.log ( '   Post Processor Errors:' )
          postProcessorErrors.forEach ( f => console.log ( '      ', f ) )

        }

      } )

    }


  }
}

export function permutateCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'permutate [outputDir]',
    description: 'Produces a file for all the possible permutations',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '--c, --comment-offset <commentOffset>': { description: 'The offset for the comments. How far to the right are the comments', default: defaultCommentOffset },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--cache': { description: 'Cache the urlstore' },
      '--raw': { description: `Don't run the post processors` },
      '--debug': { description: 'Show debug information' },
      '--full': { description: 'Show more data about the files' }
    },
    action: async ( _, opts, outputDir ) => {
      if ( !outputDir ) outputDir = 'target'
      const { file, parent, commentOffset, raw, urlStore, cache } = fromOpts ( opts );
      console.log ( 'cache', opts.cache === true )

      const postProcessors = raw ? [] : tc.context.postProcessors ( cache, urlStore )

      const initialFile = await tc.context.fileOps.loadFileOrUrl ( path.join ( parent, file ) )
      const initialFileAsYaml = tc.context.yaml.parser ( initialFile )
      const parameters = initialFileAsYaml.parameters
      if ( parameters === undefined ) {
        console.log ( 'No parameters found in ', opts.file )
        process.exit ( 1 )
      }

      const parameterNames = Object.keys ( parameters )
      console.log ( "Checking permutations" )
      for ( let parameterName of parameterNames ) {
        const values = parameters[ parameterName ]
        console.log ( '   ', parameterName + ':', values )
      }
      permutate ( parameters, async ( params ) => {
        console.log ( 'Permutation:', params )
        let { fileDetails, errors, postProcessorErrors, sorted, yaml } =
              await loadAndMergeAndYamlParts ( tc.context.loadFiles, postProcessors, tc.context.commentFactoryFn ( commentOffset ), params, parent, file, opts.debug === true );
        if ( errors.length > 0 ) {
          console.log ( '   Errors:' )
          fileDetails.filter ( f => f.errors.length > 0 ).forEach ( f => console.log ( '      ', f.file, f.errors ) )
        }
        if ( postProcessorErrors !== undefined && postProcessorErrors?.length > 0 ) {
          console.log ( '   Post Processor Errors:' )
          postProcessorErrors.forEach ( f => console.log ( '      ', f ) )
        }
        const fileOps = tc.context.fileOps
        const allErrors = [
          ...flatMap ( toArray ( errors ), fd => fd.errors.map ( e => fd.file + " " + e ) ),
          ...toArray ( postProcessorErrors ) ]
        const rawFileName = path.join ( outputDir, Object.values ( params ).join ( '/' ) + '/' + Object.values ( params ).join ( '-' ) )
        const fileName = rawFileName + '.yaml'
        const errorFileName = rawFileName + '.errors.txt'
        const jsonFileName = rawFileName + '.json'
        const dir = path.dirname ( fileName )
        console.log ( '   Writing to', fileName )
        const content = allErrors.length > 0 ? allErrors.join ( '\n# ' ) : yaml
        await fileOps.createDir ( dir )
        await fileOps.removeFile ( fileName )
        await fileOps.removeFile ( errorFileName )
        await fileOps.removeFile ( jsonFileName )
        await fileOps.saveFile ( allErrors.length > 0 ? errorFileName : fileName, content || '' )
        if ( allErrors.length === 0 && yaml !== undefined )
          await fileOps.saveFile ( jsonFileName, JSON.stringify ( tc.context.yaml.parser ( yaml ), null, 2 ) )
      } )

    }


  }
}

export function addPropertyCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'property <property>',
    description: 'Produces the composite merged file',
    options: {
      '-f, --file <file>': { description: 'The root config file', default: 'global.yaml' },
      '-p, --params <params>': { description: 'The parameters to use. Comma seperated attribute=value' },
      '--c, --comment-offset <commentOffset>': { description: 'The offset for the comments. How far to the right are the comments', default: defaultCommentOffset },
      '-u, --urlStore <urlDirectory>': { description: 'The directory that urlstore files are served from (schemas and transformers)', default: tc.context.currentDirectory },
      '--debug': { description: 'Show debug information' },
      '--full': { description: 'Show more data about the files' },
      '--raw': { description: `Don't run the post processors` },
      '--keys': { description: 'If an object shows the keys' },
    },
    action: async ( _, opts, property ) => {
      const { params, file, parent, commentOffset, raw, urlStore, cache } = fromOpts ( opts );
      const postProcessors = raw ? [] : tc.context.postProcessors ( cache, urlStore )

      let { fileDetails, errors, yaml, sorted } =
            await loadAndMergeAndYamlParts ( tc.context.loadFiles, postProcessors, tc.context.commentFactoryFn ( commentOffset ), params, parent, file, opts.debug === true );
      if ( errors.length > 0 ) {
        console.log ( 'Errors:' )
        fileDetails.filter ( f => f.errors.length > 0 ).forEach ( f => console.log ( f.file, f.errors ) )
        process.exit ( 1 )
      }
      if ( opts.full === true ) {
        console.log ( JSON.stringify ( property === '.' ? sorted : findPartInMerged ( sorted, property ), null, 2 ) )
      } else {
        const simplified = tc.context.yaml.parser ( yaml || ''  )
        let result = property == '.' ? simplified : findPart ( simplified, property );
        if ( opts.keys ) {
          if ( typeof result === 'object' )
            Object.keys ( result ).sort ().forEach ( k => console.log ( k ) )
          else
            console.log ( 'Not an object' )
        } else {
          if ( typeof result === 'object' )
            console.log ( JSON.stringify ( result, null, 2 ) )
          else
            console.log ( result )
        }
      }
    }
  }
}


export function configCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, ThereAndBackContext, Config, CleanConfig> ): SubCommandDetails<Commander, ThereAndBackContext, Config> {
  return {
    cmd: 'config',
    description: 'Config commands',
    commands: [
      checkPermutationsCommand<Commander, Config, CleanConfig> ( tc ),
      permutateCommand<Commander, Config, CleanConfig> ( tc ),
      viewConfigCommand<Commander, Config, CleanConfig> ( tc ),
      listFilesCommand<Commander, Config, CleanConfig> ( tc ),
      mergeFilesCommand<Commander, Config, CleanConfig> ( tc ),
      addPropertyCommand<Commander, Config, CleanConfig> ( tc )
    ]
  }
}
