import { flatMapK, hasErrors, NameAnd, toArray } from "@laoban/utils";
import path from "path";
import { FileOps } from "@laoban/fileops";
import { derefence, dollarsBracesVarDefn } from "@laoban/variables";
import { YamlCapability } from "@itsmworkbench/yaml";
import { extractPlaceholders } from "@fusionconfig/utils";
import { FileDetails, LoadFilesFn, validateHierarchy, validateParameters } from "@fusionconfig/config";


function toObject<T> ( x: undefined | NameAnd<T> | T ): NameAnd<T> {
  if ( x === undefined ) return {}
  if ( typeof x === 'object' ) return x as NameAnd<T>
  return { default: x }
}


export type LoadFilesContext = {
  fileOps: FileOps
  yaml: YamlCapability,
  // urlStore: any
  dic: any
  debug?: boolean
}

export const findConfigUsingFileops = ( fileOps: FileOps, yaml: YamlCapability ): LoadFilesFn =>
  ( params: NameAnd<string>, parent: string, file: string, debug?: boolean ) => {
    return recursivelyFindFileNames ( { fileOps, yaml, dic: params, debug }, parent, [], file )
  }

export async function recursivelyFindFileNames ( context: LoadFilesContext, root: string, trail: string[], file: string ): Promise<FileDetails[]> {
  const { fileOps, yaml, dic } = context
  if ( trail.includes ( file ) ) throw new Error ( `Circular reference detected: ${trail.join ( ' -> ' )} -> ${file}` )
  let newFile = path.join ( root, file );
  const newPathForFile = path.dirname ( newFile )
  if ( !await fileOps.isFile ( newFile ) ) return [ { trail, file, exists: false, errors: [], yaml: undefined } ]
  const content = await fileOps.loadFileOrUrl ( newFile )
  const allParams = extractPlaceholders ( content )
  const missingParams = allParams.filter ( p => dic[ p ] === undefined ).map ( s => '${' + s + '}' )
  if ( missingParams.length > 0 ) return [ { trail, file, exists: true, errors: [ `Missing parameter(s) ${[ ...new Set ( missingParams ) ].sort ().join ( ', ' )}` ], yaml: undefined } ]
  const derefed = derefence ( newFile, dic, content, { variableDefn: dollarsBracesVarDefn, allowUndefined: true } )
  const yamlContent = yaml.parser ( derefed )
  if ( hasErrors ( yamlContent ) ) return [ { trail, file, exists: true, errors: toArray ( yamlContent ), yaml: undefined } ]
  const hierarchy = yamlContent?.hierarchy
  let parameters = yamlContent?.parameters;
  const errors = [ ...validateHierarchy ( hierarchy ), ...validateParameters ( dic, parameters ) ]
  if ( errors.length > 0 ) return [ { trail, file, exists: true, errors, yaml: yamlContent } ]
  const fromHierarchy = await flatMapK ( Object.values ( toObject<string> ( hierarchy ) ),
    f => recursivelyFindFileNames ( context, newPathForFile, [ ...trail, file ], f ) )
  return [ { trail, file, exists: true, errors, yaml: yamlContent }, ...fromHierarchy ]
}
