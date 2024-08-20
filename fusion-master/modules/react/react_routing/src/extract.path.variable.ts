import { NameAnd } from "@laoban/utils";

export function extractVariableNames ( template: string ) {
  const variablePattern = /{(\w+)}/g;
  let match;
  let variables = [];

  while ( match = variablePattern.exec ( template ) ) {
    variables.push ( match[ 1 ] );
  }

  return variables;
}
export function composeReturnObjectFromMatch ( template: string, path: string, variableNames: string[] ): any {
  // Escape all regex characters except for placeholders
  let regexSafeTemplate = template.replace ( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );

  // Replace placeholders in the template with regex groups to capture variable parts
  const regexPattern = regexSafeTemplate.replace ( /\\{(\w+)\\}/g, '([^\\/]+)' );
  const regex = new RegExp ( `^${regexPattern}$` );
  const matches = path.match ( regex );

  if ( !matches ) {
    return null;  // Early return if no matches found
  }

  // Building the return object from captured groups
  return variableNames.reduce ( ( obj: any, varName: string, index ) => {
    obj[ varName ] = matches[ index + 1 ];  // capture groups in regex match start at index 1
    return obj;
  }, {} as any );
}

export function extractPathVariables ( template: string, path: string ) {
  const variableNames = extractVariableNames ( template );
  return composeReturnObjectFromMatch ( template, path, variableNames );
}
export function getQueryParams ( search: string ) {
  const queryParams = new URLSearchParams ( search );
  const params: NameAnd<any> = {};

  queryParams.forEach ( ( value, key ) => {
    if ( params.hasOwnProperty ( key ) ) {
      if ( Array.isArray ( params[ key ] ) ) {
        params[ key ].push ( value );
      } else {
        params[ key ] = [ params[ key ], value ];
      }
    } else {
      params[ key ] = value;
    }
  } );

  return params;
}


export function extractPathAndQuery ( fullPath: string ): { path: string, query: string, params: NameAnd<string> } {
  const questionMarkIndex = fullPath.indexOf ( '?' );

  if ( questionMarkIndex === -1 ) {
    // No query string present
    return { path: fullPath, query: '', params: {} };
  } else {
    // Extract path and query string separately
    const path = fullPath.substring ( 0, questionMarkIndex );
    const query = fullPath.substring ( questionMarkIndex + 1 );
    const params = getQueryParams ( query )
    return { path, query, params };
  }
}

export function makeSearchString ( params: NameAnd<string>|undefined ) {
  const searchParams = new URLSearchParams ();
  Object.entries ( params || {} ).forEach ( ( [ key, value ] ) => searchParams.append ( key, value ) );
  return searchParams.toString ();
}