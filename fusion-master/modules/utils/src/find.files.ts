import { FileOps } from "@laoban/fileops";
import { flatMap, flatten, lastSegment } from "@laoban/utils";

async function partitionToDirsAndFiles ( fileOps: FileOps, parent: string, list: string[] ) {
  const arrays = await Promise.all<[ string[], string[] ]> ( list.map ( async ( s: string ): Promise<[ string[], string[] ]> => {
      if ( await fileOps.isDirectory ( fileOps.join ( parent, s ) ) ) return [ [ s ], [] ]
      if ( await fileOps.isFile ( fileOps.join ( parent, s ) ) ) return [ [], [ s ] ]
      throw new Error ( `Not a file or directory: ${s}` )
    }
  ) )
  return { dirs: flatMap ( arrays, s => s[ 0 ] ), files: flatMap ( arrays, s => s[ 1 ] ) }
}
export const findChildFiles = ( fileOps: FileOps, ignoreFilters: ( s: string ) => boolean, match: ( s: string ) => boolean ) => async ( root: string ): Promise<string[]> => {
  const find = async ( path: string[] ): Promise<string[]> => {
    const fullName = fileOps.join ( root, ...path )
    // console.log ( 'root', root, 'fullName', fullName, 'path', path )
    const isFile = await fileOps.isFile ( fullName )
    if ( isFile ) return [ path.join ( '/' ) ]
    const children = await fileOps.listFiles ( fullName ).then ( list => list.filter ( dir => !ignoreFilters ( lastSegment ( dir ) ) )
      .map ( f => [ ...path, lastSegment ( f ) ].join ( '/' ) ) )
    // console.log ( 'children', children )
    const { files, dirs } = await partitionToDirsAndFiles ( fileOps, root, children )
    // console.log ( 'files', files, 'dirs', dirs )
    let filesUnderDirs: string[] = await Promise.all<string[]> ( dirs.map ( dir => find ( [ ...path, lastSegment ( dir ) ] ) ) ).then ( flatten );
    let result: string[] = [ ...files.filter ( match ), ...filesUnderDirs ]
    return result
  }
  const result = await find ( [] )
  return result
}
