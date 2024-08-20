import { ErrorsAnd } from "@laoban/utils";
import { findFirstPath, findPathAndErrors, foldPathsToJson, getPath, getPathIgnoreLast, PathAndErrors, pathListToJson, PathsInJson, validatePathsInJson } from "./paths.in.json";

describe ( 'pathListToJson', () => {
  it ( 'correctly converts a list of paths to a JSON structure without violations', () => {
    const paths = [
      'a/b/c/d/e.txt',
      'f/g.txt',
      'h/i/j.txt'
    ];

    const expectedResult: ErrorsAnd<PathsInJson> = {
      a: { b: { c: { d: { 'e.txt': 'a/b/c/d/e.txt' } } } },
      f: { 'g.txt': 'f/g.txt' },
      h: { i: { 'j.txt': 'h/i/j.txt' } }
    };

    expect ( pathListToJson ( paths, 'prefix:' ) ).toEqual ( expectedResult );
  } );

  it ( 'identifies paths that violate the "only one file in a directory" constraint', () => {
    const paths = [
      'a/b.txt',
      'a/c.txt', // Violates the constraint
    ];

    const expectedErrors: ErrorsAnd<PathsInJson> = [
      "prefix:a/c.txt"
    ]

    expect ( pathListToJson ( paths, 'prefix:' ) ).toEqual ( expectedErrors );
  } );

  it ( 'handles complex scenarios with multiple violations', () => {
    const paths = [
      'x/y/z.txt',
      'x/y.txt', // Violates because y is used as both a directory and a file
      'a/b/c.txt',
      'a/b.txt', // Violates the constraint
      'a/d/e.txt',
      'a/d/f/g.txt',
      'a/d/f.txt' // Violates because f is used as both a directory and a file
    ];

    const expectedErrors: ErrorsAnd<PathsInJson> = [
      "prefix:x/y.txt",
      "prefix:a/b.txt",
      "prefix:a/d/f.txt"
    ]

    expect ( pathListToJson ( paths, 'prefix:' ) ).toEqual ( expectedErrors );
  } );

  it ( 'returns an empty object for an empty list of paths', () => {
    const paths: string[] = [];
    const expectedResult: ErrorsAnd<PathsInJson> = {};
    expect ( pathListToJson ( paths, 'prefix:' ) ).toEqual ( expectedResult );
  } );
} );

// Mock validation function
const mockValidate = async ( path: string ): Promise<string[]> => {
  // Returns an error if the path does not end with ".txt"
  if ( !path.endsWith ( '.txt' ) ) {
    return [ `File '${path}' is not a .txt file.` ];
  }
  return [];
};

describe ( 'validatePathsInJson', () => {
  it ( 'validates with no errors for valid paths', async () => {

    const paths: PathsInJson = {
      a: { b: { c: { d: { 'e.txt': 'a/b/c/d/e.txt' } } } },
      f: { 'g.txt': 'f/g.txt' },
      h: { i: { 'j.txt': 'h/i/j.txt' } }
    };

    const errors = await validatePathsInJson ( paths, mockValidate );
    expect ( errors ).toEqual ( [] );
  } );

  it ( 'validates with errors for invalid file extensions', async () => {
    const paths: PathsInJson = {
      a: { 'b.png': 'a/b.png' }, // Invalid file extension
      c: { d: { 'e.txt': 'c/d/e.txt' }, 'f.jpg': 'c/f.jpg' } // One valid and one invalid
    };

    const errors = await validatePathsInJson ( paths, mockValidate );
    expect ( errors ).toEqual ( [
      "File 'a/b.png' is not a .txt file.",
      "File 'c/f.jpg' is not a .txt file."
    ] );
  } );

  it ( 'handles nested directories correctly', async () => {
    const paths: PathsInJson = {
      x: {
        y: { 'z.txt': 'x/y/z.txt' },
        'w.txt': 'x/w.txt'
      },
      m: { 'n.jpeg': 'm/n.jpeg' } // Invalid file extension
    };

    const errors = await validatePathsInJson ( paths, mockValidate );
    expect ( errors ).toContain ( "File 'm/n.jpeg' is not a .txt file." );
    expect ( errors.length ).toBe ( 1 ); // Only one error expected
  } );
} );

describe ( 'getPath', () => {
  const pathInJson: PathsInJson = {
    folder: {
      subfolder: {
        'file.txt': 'folder/subfolder/file.txt',
        'anotherFile.txt': 'folder/subfolder/anotherFile.txt',
      },
      'directoryFile.txt': 'folder/directoryFile.txt'
    },
    'rootFile.txt': 'rootFile.txt'
  };

  it ( 'should return the path for a valid file path', () => {
    expect ( getPath ( 'folder/subfolder/file.txt', pathInJson ) ).toBe ( 'folder/subfolder/file.txt' );
  } );

  it ( 'should return what is there for a directory', () => {
    expect ( getPath ( 'folder/subfolder', pathInJson ) ).toEqual({
      "anotherFile.txt": "folder/subfolder/anotherFile.txt",
      "file.txt": "folder/subfolder/file.txt"
    });
  } );

  it ( 'should return undefined for a non-existent path', () => {
    expect ( getPath ( 'non/existent/path.txt', pathInJson ) ).toBeUndefined ();
  } );

  it ( 'should handle root level files correctly', () => {
    expect ( getPath ( 'rootFile.txt', pathInJson ) ).toBe ( 'rootFile.txt' );
  } );
} );

describe ( 'getPathIgnoreLast', () => {
  const pathInJson: PathsInJson = {
    folder: {
      subfolder: {
        'file.txt': 'folder/subfolder/file.txt',
        anotherFolder: { 'anotherFile.txt': 'folder/subfolder/anotherFolder/anotherFile.txt' }
      },
    },
    'rootFile.txt': 'rootFile.txt'
  };

  it ( 'should return the path for a valid file path', () => {
    expect ( getPathIgnoreLast ( 'folder/subfolder', pathInJson ) ).toBe ( 'folder/subfolder/file.txt' );
    expect ( getPathIgnoreLast ( 'folder/subfolder/anotherFolder', pathInJson ) ).toBe ( 'folder/subfolder/anotherFolder/anotherFile.txt' );
  } );

  it ( 'should return undefined for a directory path', () => {
    expect ( getPathIgnoreLast ( 'folder', pathInJson ) ).toBeUndefined ();
  } );

  it ( 'should return undefined for a non-existent path', () => {
    expect ( getPathIgnoreLast ( 'non/existent/path.txt', pathInJson ) ).toBeUndefined ();
    expect ( getPathIgnoreLast ( 'non/existent', pathInJson ) ).toBeUndefined ();
  } );

} );

describe ( 'findFirstPath', () => {
  const pathInJson: PathsInJson = {
    folder: {
      subfolder: {
        'file.txt': 'folder/subfolder/file.txt',
        'anotherFile.txt': 'folder/subfolder/anotherFile.txt',
      },
    },
    'rootFile.txt': 'rootFile.txt'
  };

  it ( 'should find the first existing file path', () => {
    const paths = [ 'nonexistent.txt', 'folder', 'folder/subfolder' ];
    expect ( findFirstPath ( paths, pathInJson ) ).toBe ( 'folder/subfolder/file.txt' );
  } );

  it ( 'should return undefined if no paths exist', () => {
    const paths = [ 'nonexistent.txt', 'another/nonexistent.txt' ];
    expect ( findFirstPath ( paths, pathInJson ) ).toBeUndefined ();
  } );

  it ( 'should ignore directory paths and find the next valid file path', () => {
    const paths = [ 'folder/subfolder', 'folder/subfolder/file.txt' ];
    expect ( findFirstPath ( paths, pathInJson ) ).toBe ( 'folder/subfolder/file.txt' );
  } );
} );


describe ( 'foldPathsToJson', () => {
  it ( 'should accumulate paths with _X appended', () => {
    const testPaths: PathsInJson = {
      home: {
        kitchen: "sink",
        bedroom: "lamp"
      },
      garden: "fountain"
    };

    // Define the fold function to accumulate paths into a string array, appending "_X" to each
    const testFoldFn = ( acc: string[], path: string ): string[] => {
      return [ ...acc, path + '_X' ]; // Ensure _X is appended here for clarity
    };

    // The initial value for the accumulator is an empty array
    const expectedResult = [
      "home.kitchen.sink_X",
      "home.bedroom.lamp_X",
      "garden.fountain_X"
    ];

    // Execute foldPathsToJson with the testPaths, testFoldFn, and an empty array as the initial accumulator
    const result = foldPathsToJson ( testPaths, testFoldFn, [] );

    // Expect the result to equal the expectedResult
    expect ( result ).toEqual ( expectedResult );
  } );
} );


describe ( 'findPathAndErrors', () => {
  // Mock `fetchErrorsForPath` for testing
  const fetchErrorsForPath = async ( path: string ): Promise<string[]> => {
    if ( !path.endsWith ( '.txt' ) ) {
      return [ `Error: '${path}' does not end with .txt` ];
    }
    return [];
  };

  it ( 'should accumulate errors for paths not ending in .txt', async () => {
    const paths = [ 'file1.txt', 'file2.doc', 'file3.txt', 'file4.jpg' ];

    const expected: PathAndErrors[] = [
      { path: 'file1.txt', errors: [] },
      { path: 'file2.doc', errors: [ `Error: 'file2.doc' does not end with .txt` ] },
      { path: 'file3.txt', errors: [] },
      { path: 'file4.jpg', errors: [ `Error: 'file4.jpg' does not end with .txt` ] },
    ];

    const result = await findPathAndErrors ( paths, fetchErrorsForPath );

    // Use toEqual for deep equality comparison
    expect ( result ).toEqual ( expected );
  } );
} );
