import { ErrorsAnd } from "@laoban/utils";

export type PathsInJson = {
  [ key: string ]: PathsInJson | string;
};
export function pathListToJson ( paths: string[], errorPrefix: string ): ErrorsAnd<PathsInJson> {
  const root: PathsInJson = {};
  let errors: string[] = [];

  paths.forEach ( path => {
    const segments = path.split ( '/' );
    let current = root;

    for ( let i = 0; i < segments.length; i++ ) {
      const segment = segments[ i ];
      const isLastSegment = i === segments.length - 1;

      if ( isLastSegment ) {
        // If we're at a file and the directory already has a file, it's an error
        if ( typeof current === 'string' || Object.keys ( current ).length > 0 && current[ segment ] === undefined ) {
          errors.push ( errorPrefix + path );
          break;
        }
        current[ segment ] = path; // Use the full path as the value for files
      } else {
        // Directory logic
        if ( typeof current[ segment ] === 'string' ) {
          // If a file exists where we expect a directory, it's an error
          errors.push ( errorPrefix + path );
          break;
        }
        if ( !current[ segment ] ) {
          current[ segment ] = {}; // Initialize the directory
        }
        current = current[ segment ] as PathsInJson;
      }
    }
  } );

  return errors.length > 0 ? errors : root;
}
export type ValidatePathFn = ( path: string ) => Promise<string[]>;
export async function validatePathsInJson ( paths: PathsInJson, validate: ValidatePathFn ): Promise<string[]> {

  // Helper function to recursively validate paths
  async function validateRecursively ( node: PathsInJson | string, pathAccumulator: string = '' ): Promise<string[]> {
    if ( typeof node === 'string' ) {
      return validate ( pathAccumulator );
    } else {
      // Aggregate errors from all children
      let errors: string[] = [];
      for ( const [ key, child ] of Object.entries ( node ) ) {
        const newPath = pathAccumulator ? `${pathAccumulator}/${key}` : key;
        const childErrors = await validateRecursively ( child, newPath );
        errors = errors.concat ( childErrors );
      }
      return errors;
    }
  }
  return validateRecursively ( paths );
}

export function foldPathsToJson<Acc> (
  paths: PathsInJson,
  foldFn: ( acc: Acc, path: string ) => Acc,
  zero: Acc,
  currentPath: string[] = []
): Acc {
  return Object.entries ( paths ).reduce<Acc> ( ( acc, [ key, value ] ) => {
    // If the value is a string, it's a leaf node, so apply foldFn to it.
    if ( typeof value === "string" ) {
      return foldFn ( acc, [ ...currentPath, key, value ].join ( '.' ) );
    } else {
      // Otherwise, recurse into the object.
      return foldPathsToJson ( value, foldFn, acc, [ ...currentPath, key ] );
    }
  }, zero );
}

export function mapPaths<T> ( paths: PathsInJson, fn: ( path: string ) => T ): T[] {
  return Object.entries ( paths ).reduce<T[]> ( ( acc, [ key, value ] ) => {
    if ( typeof value === 'string' ) {
      return acc.concat ( fn ( value ) );
    } else {
      return acc.concat ( mapPaths ( value, fn ) );
    }
  }, [] );
}
export function mapPathsK<T> ( paths: PathsInJson, fn: ( path: string ) => Promise<T> ): Promise<T[]> {
  return Object.entries ( paths ).reduce<Promise<T[]>> ( async ( accPromise, [ key, value ] ) => {
    const acc = await accPromise;
    if ( typeof value === 'string' ) {
      return acc.concat ( await fn ( value ) );
    } else {
      return acc.concat ( await mapPathsK ( value, fn ) );
    }
  }, Promise.resolve ( [] ) );
}

export function flatMapPaths<T> ( paths: PathsInJson, fn: ( path: string ) => T[] ): T[] {
  return Object.entries ( paths ).reduce<T[]> ( ( acc, [ key, value ] ) => {
    if ( typeof value === 'string' ) {
      return acc.concat ( fn ( value ) );
    } else {
      return acc.concat ( flatMapPaths ( value, fn ) );
    }
  }, [] );
}

export function getPath ( path: string, pathInJson: PathsInJson ): string | PathsInJson | undefined {
  const segments = path.split ( '/' );
  const currentNode = segments.reduce<PathsInJson | string | undefined> (
    ( current, segment ) =>
      typeof current === 'string' || current === undefined ? undefined : current[ segment ], pathInJson );
  return currentNode;
}


export function getPathIgnoreLast ( inputPath: string, pathsInJson: PathsInJson ): string | undefined {
  const endNode = getPath ( inputPath, pathsInJson );
  if ( typeof endNode === 'string' ) return undefined//this is a file. We want to find the last directory
  if ( typeof endNode !== 'object' ) return undefined//shouldn't be needed
  if ( endNode === undefined ) return undefined //gone off the end of the path
  const endPath: PathsInJson = endNode
  let entries = Object.entries ( endPath );
  for ( let entry of entries ) {
    const [ name, value ] = entry
    if ( typeof value === 'string' ) return value
  }
  return undefined
}


export const findFirstPath = ( paths: string[], pathInJson: PathsInJson ): string | undefined =>
  paths.map ( path => getPathIgnoreLast ( path, pathInJson ) ).find ( x => x );


export async function findPathAndErrors ( paths: string[], validateK: ( path: string ) => Promise<string[]> ): Promise<PathAndErrors[]> {
  return paths.reduce<Promise<PathAndErrors[]>> ( async ( accPromise, path ) => {
    const acc = await accPromise;
    const errors = await validateK ( path );
    acc.push ( { path, errors } );
    return acc;
  }, Promise.resolve ( [] ) );
}
export type PathAndErrors = {
  path: string;
  errors: string[];
};
export type PathContentAndErrors<T> = PathAndErrors & { content?: T };
export type PathAndT<T> = { path: string, t: T };


type ContentAndErrors<T> = {
  content?: T;
  errors: string[];

}
//
//
// export function pathToPathContentAndErrors<T> ( loadFn: ( s: string ) => Promise<string>,
//                                                 parser: ( path: string, s: string ) => T,
//                                                 validate: Validate<PathAndT<T>> ) {
//   return async ( context: string, path: string ): Promise<PathContentAndErrors<T>> => {
//     async function load ( path: string ): Promise<ErrorsAnd<string>> {
//       try {
//         return await loadFn ( path );
//       } catch ( e ) {
//         return [ e.message ]
//       }
//     }
//     function parse ( path: string, string: string ): ErrorsAnd<T> {
//       try {
//         return parser ( path, string );
//       } catch ( e ) {
//         return [ context + ' ' + e.message ]
//       }
//     }
//     console.log ( 'pathToPathContentAndErrors', path )
//     const string = await load ( path )
//     console.log ( 'pathToPathContentAndErrors - string', string )
//     if ( hasErrors ( string ) ) return { path, errors: string }
//     const content = parse ( path, string );
//     console.log ( 'pathToPathContentAndErrors - content', content )
//     if ( hasErrors ( content ) ) return { path, errors: content }
//     const errors = validate ( context + ' ' + path, { path, t: content } );
//     console.log ( 'pathToPathContentAndErrors - errors', errors )
//     return { path, errors, content };
//   };
// }
//
// export async function findPathAndContentAndErrors<T> (
//   context: string,
//   paths: PathsInJson,
//   loadFn: ( s: string ) => Promise<string>,
//   parser: ( path: string, s: string ) => T,
//   validate: Validate<PathAndT<T>> ): Promise<PathContentAndErrors<T>[]> {
//   const foldFn = pathToPathContentAndErrors ( loadFn, parser, validate );
//   let result = await foldPathsToJsonK<PathContentAndErrors<T>[]> ( paths,
//     async ( acc, path ) => {
//       console.log ( 'findPathAndContentAndErrors - path is', path )
//       const contentAndErrors = await foldFn ( context, path );
//       console.log ( 'findPathAndContentAndErrors - contentAndErrors', contentAndErrors )
//       acc.push ( contentAndErrors );
//       return acc;
//     }, [] );
//   console.log('findPathAndContentAndErrors - result', result)
//   return result
// }
