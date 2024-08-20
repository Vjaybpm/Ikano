import jsondiffpatch from 'jsondiffpatch';
import { TestDiffFn, TransformerTestResult } from "@fusionconfig/tests";

export const formatDiff = ( diff: jsondiffpatch.Delta, path = '' ): TransformerTestResult => {
  let result: TransformerTestResult = { inserts: [], deletes: [], updates: [] };

  for ( const key in diff ) {
    const currentPath = path ? `${path}/${key}` : key;
    const value = diff[ key ];
    if ( Array.isArray ( value ) ) {
      if ( value.length === 1 ) {
        // Deleted value
        result.deletes.push ( { path: currentPath, message: `Deleted: '${value[ 0 ]}'` } );
      } else if ( value.length === 3 && value[ 2 ] === 2 ) {
        // Inserted value
        result.inserts.push ( { path: currentPath, message: `Inserted: '${value[ 1 ]}'` } );
      } else {
        // Updated value
        result.updates.push ( { path: currentPath, message: `Changed from '${value[ 0 ]}' to '${value[ 1 ]}'` } );
      }
    } else if ( typeof value === 'object' ) {
      // Recursive diffing for nested objects
      const childDiffs = formatDiff ( value, currentPath );
      result.inserts.push ( ...childDiffs.inserts );
      result.deletes.push ( ...childDiffs.deletes );
      result.updates.push ( ...childDiffs.updates );
    }
  }
  return result;
};
export const jsonDiffPatchFn: TestDiffFn =
               async ( expected, actual ) => {
                 // let result: jsondiffpatch.Delta = jsondiffpatch.diff ( expected, actual );
                 return { inserts: [], deletes: [], updates: [] }
                 // const transformed = formatDiff ( result );
                 // return transformed
               }