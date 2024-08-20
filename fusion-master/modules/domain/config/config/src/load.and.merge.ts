import { FileDetails, LoadFilesFn } from "./config";
import { hasErrors, NameAnd } from "@laoban/utils";
import { Merged, MergeInput, mergeObjectInto } from "./merge";
import { CommentFunction, convertToYaml } from "./convert.to.yaml";
import { postProcess, PostProcessor } from "./post.process";

export type LoadedAndMergedParts = {
  fileDetails: FileDetails[],
  errors: FileDetails[],
  sorted: Merged
}
export type LoadedAndMergedAndYamlParts = {
  fileDetails: FileDetails[],
  errors: FileDetails[],
  sorted: Merged
  postProcessorErrors?: string[]
  yaml: string | undefined
}

export async function loadAndMergeParts ( loadFiles: LoadFilesFn, params: NameAnd<string>, parent: string, file: string, debug?: boolean ): Promise<LoadedAndMergedParts> {
  const fileDetails: FileDetails[] = await loadFiles ( params, parent, file, debug )
  const errors: FileDetails[] = fileDetails.filter ( f => f.errors.length > 0 )
  const merged: Merged = fileDetails.reduce <Merged> ( ( acc: Merged, fd: FileDetails ) => mergeObjectInto ( acc, fd  as MergeInput), { value: {  }, files: [] } )
  const { version, parameters, hierarchy, ...rest } = merged.value as any
  let sorted: Merged = { value: { version, parameters, hierarchy, ...rest }, files: merged.files };
  return { fileDetails, errors, sorted };
}

const makeComment = ( fileDetails: FileDetails[] ): string =>
  fileDetails.map ( ( { yaml, ...rest } ) => `# ${JSON.stringify ( rest )}` ).join ( '\n' );
export async function loadAndMergeAndYamlParts ( loadFiles: LoadFilesFn, postProcessors: PostProcessor[], commentFn: CommentFunction, params: NameAnd<string>, parent: string, file: string, debug?: boolean ): Promise<LoadedAndMergedAndYamlParts> {
  if ( debug ) console.log ( 'loadAndMergeAndYamlParts', { loadFiles, params, parent, file } )
  const parts = await loadAndMergeParts ( loadFiles, params, parent, file, debug )
  const { fileDetails, errors, sorted } = parts
  if ( debug ) console.log ( 'parts - filedetails and errors', JSON.stringify ( { fileDetails, errors }, null, 2 ) )

  const result = await postProcess ( postProcessors, sorted, params, debug )
  if ( hasErrors ( result ) ) return { ...parts, postProcessorErrors: result, yaml: undefined }

  const yaml = errors.length > 0 ? undefined : `# ${JSON.stringify ( params )}
#
# Files
${(makeComment ( fileDetails.filter ( f => f.exists ) ))}
#
# Files not found
${makeComment ( fileDetails.filter ( f => !f.exists ) )}
#
${convertToYaml ( sorted, commentFn )}
`
  return { ...parts, yaml }
}