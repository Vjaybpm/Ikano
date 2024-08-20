import { NameAnd, safeObject } from "@laoban/utils";

const placeHolderPattern = /\$\{([^}]+)\}/g;

export function extractPlaceholders ( text: string ): string[] {
  const matches = [ ...text.matchAll ( placeHolderPattern ) ];
  return matches.map ( match => match[ 1 ] ); // match[1] contains the captured group
}
export function parseParams ( params: string | boolean ) {
  if ( typeof params === 'string' ) {
    const pairs = params.split ( ',' )
    return pairs.reduce ( ( acc, pair ) => {
      const [ key, value ] = pair.split ( '=' )
      acc[ key ] = value
      return acc
    }, {} as any )
  }
  return {}
}


export function removeLastExtension ( path: string ): string {
  // Split the path by dots to separate extensions
  const parts = path.split ( '.' );

  // If there's only one part, it means there's no extension to remove
  if ( parts.length === 1 ) {
    return path;
  }

  // Remove the last part (extension)
  parts.pop ();

  // Rejoin the remaining parts
  return parts.join ( '.' );
}
export type ParameterNameAndValues = NameAnd<NameAnd<string[]>>;

export async function permutate (
  params: ParameterNameAndValues,
  processOne: ( params: NameAnd<string> ) => Promise<void>
): Promise<void> {
  // Convert the parameter structure into an array of entries
  const paramEntries = Object.entries ( params );

  // Generate and process all permutations of the parameter values
  await generateAndProcessPermutations ( paramEntries, 0, {}, processOne );
}

// Recursive function to generate permutations and process them with processOne
export async function generateAndProcessPermutations (
  entries: [ string, NameAnd<string[]> ][],
  index: number,
  currentPermutation: NameAnd<string>,
  processOne: ( params: NameAnd<string> ) => Promise<void>
): Promise<void> {
  if ( index === entries.length ) {
    // Process the current permutation asynchronously
    await processOne ( { ...currentPermutation } );
    return;
  }

  const [ paramName, paramValues ] = entries[ index ];
  const legalValues = paramValues.legal;

  for ( const value of legalValues ) {
    currentPermutation[ paramName ] = value;
    await generateAndProcessPermutations ( entries, index + 1, currentPermutation, processOne );
  }
}

export function objectToQueryString ( params: NameAnd<any> ): string {
  const queryString = Object.keys ( safeObject ( params ) ).map ( key => {
    const value = params[ key ];
    return `${encodeURIComponent ( key )}=${encodeURIComponent ( value )}`;
  } ).join ( '&' );
  return queryString;
}

export function simpleTemplate(template: string, data: NameAnd<any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in data) {
      return String(data[key]);
    }
    return match; // Return the original match if no corresponding key is found
  });
}