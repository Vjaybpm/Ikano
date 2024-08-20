import { Merged } from "./merge";
import { NameAnd } from "@laoban/utils";

//the primstring is 'if a primitive this is the indent and value'. This allows us to justify the comments
//Currently we only use this for primitives but let's not build that dependency into the type
export type CommentFunction = ( files: string[], primString?: string ) => string | undefined;
export type CommentFactoryFunction = ( commentOffset: number ) => CommentFunction

export const defaultCommentOffset: string = '85'
export const defaultCommentFactoryFunction: CommentFactoryFunction = ( minOffset: number ): CommentFunction => ( files, primString ) => {
  if ( files === undefined || files.length === 0 ) return undefined;
  const padding = primString === undefined ? '' : ' '.repeat ( Math.max ( 0, minOffset - primString.length ) )
  return `${padding}# Added by: ${files.join ( ', ' )}`;
};

export function convertPrimitiveToYaml ( value: string | number | boolean, files: string[], commentFunc: CommentFunction, depth: number ): string {
  const indent = '  '.repeat ( depth );
  const indentAndValue = `${indent}${value}`;
  const comment = commentFunc ( files, indentAndValue );
  return `${indent}${value}${comment ? ` ${comment}` : ''}\n`;
}

export function convertArrayToYaml ( array: Merged[], commentFunc: CommentFunction, depth: number ): string {
  const indent = '  '.repeat ( depth );
  let yamlStr = '';
  array.forEach ( ( item ) => {
    const itemYaml = convertToYaml ( item, commentFunc, depth + 1 );
    yamlStr += `${indent}- ${itemYaml.trim ()}\n`;
  } );
  return yamlStr;
}

export function convertObjectToYaml ( obj: NameAnd<Merged>, commentFunc: CommentFunction, depth: number ): string {
  let yamlStr = '';
  try {
    Object.entries ( obj ).forEach ( ( [ key, value ] ) => {
      const indent = '  '.repeat ( depth );
      try {
        if ( value !== undefined )
          yamlStr += `${indent}${key}:\n${convertToYaml ( value, commentFunc, depth + 1 )}`;
      } catch ( e ) {
        console.log ( 'Error in convertObjectToYaml for ', key, value )
        throw e
      }
    } );
    return yamlStr;
  } catch ( e ) {
    console.log ( 'Error in convertObjectToYaml', obj, commentFunc, depth )
    throw e
  }
}

export function convertToYaml ( merged: Merged, commentFunc: CommentFunction, depth: number = 0 ): string {
  // Handle primitive types directly
  if ( typeof merged.value !== 'object' ) {
    return convertPrimitiveToYaml ( merged.value, merged.files, commentFunc, depth );
  }

  // Delegate to specific functions based on type
  if ( Array.isArray ( merged.value ) ) {
    return convertArrayToYaml ( merged.value, commentFunc, depth );
  } else {
    return convertObjectToYaml ( merged.value, commentFunc, depth );
  }
}
