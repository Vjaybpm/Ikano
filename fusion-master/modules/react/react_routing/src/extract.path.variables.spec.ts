// Assuming extractVariableNames is imported from where it's defined
import { extractPathVariables, extractVariableNames, composeReturnObjectFromMatch, extractPathAndQuery } from './extract.path.variable'

describe ( 'extractVariableNames', () => {
  test ( 'returns an empty array when no variables are present', () => {
    expect ( extractVariableNames ( '/users/profile' ) ).toEqual ( [] );
  } );

  test ( 'correctly identifies multiple variables', () => {
    expect ( extractVariableNames ( '/users/{userId}/profiles/{profileId}' ) ).toEqual ( [ 'userId', 'profileId' ] );
  } );

  test ( 'handles strings with no placeholders', () => {
    expect ( extractVariableNames ( '/no/placeholders/here' ) ).toEqual ( [] );
  } );
} );
// Assuming composeReturnObjectFromMatch is imported from where it's defined

describe ( 'composeReturnObjectFromMatch', () => {
  test ( 'returns null when there is no match', () => {
    const template = '/users/{userId}/profiles/{profileId}';
    const path = '/users/123/posts/456';
    const variableNames = [ 'userId', 'profileId' ];
    expect ( composeReturnObjectFromMatch ( template, path, variableNames ) ).toBeNull ();
  } );

  test ( 'returns the correct object when there is a match', () => {
    const template = '/users/{userId}/profiles/{profileId}';
    const path = '/users/123/profiles/456';
    const variableNames = [ 'userId', 'profileId' ];
    expect ( composeReturnObjectFromMatch ( template, path, variableNames ) ).toEqual ( { userId: '123', profileId: '456' } );
  } );

  test ( 'handles paths with additional segments not in the template', () => {
    const template = '/users/{userId}';
    const path = '/users/xyz/extra';
    const variableNames = [ 'userId' ];
    expect ( composeReturnObjectFromMatch ( template, path, variableNames ) ).toBeNull ();
  } );
} );


describe ( 'extractPathVariables', () => {
  it ( 'should extract variables correctly from a matching path', () => {
    const template = '/something/{id1}/somethingelse/{id2}';
    const path = '/something/123/somethingelse/456';
    const expected = { id1: '123', id2: '456' };
    const result = extractPathVariables ( template, path );
    expect ( result ).toEqual ( expected );
  } );

  it ( 'should return null for non-matching paths', () => {
    const template = '/something/{id1}/somethingelse/{id2}';
    const path = '/something/123/wrongsegment/456';
    const result = extractPathVariables ( template, path );
    expect ( result ).toBeNull ();
  } );

  it ( 'should handle multiple segments correctly', () => {
    const template = '/user/{userId}/profile/{profileId}';
    const path = '/user/xyz/profile/abc';
    const expected = { userId: 'xyz', profileId: 'abc' };
    const result = extractPathVariables ( template, path );
    expect ( result ).toEqual ( expected );
  } );

  it ( 'should return null if the path is incomplete', () => {
    const template = '/user/{userId}/profile/{profileId}';
    const path = '/user/xyz/profile';
    const result = extractPathVariables ( template, path );
    expect ( result ).toBeNull ();
  } );

  it ( 'should be case sensitive', () => {
    const template = '/User/{userId}/Profile/{profileId}';
    const path = '/user/xyz/profile/abc';  // lowercase URL
    const result = extractPathVariables ( template, path );
    expect ( result ).toBeNull ();
  } );

  it ( 'should handle paths with additional segments not in template', () => {
    const template = '/user/{userId}';
    const path = '/user/xyz/extra';
    const result = extractPathVariables ( template, path );
    expect ( result ).toBeNull ();
  } );

  // Test for empty and undefined paths
  it ( 'should return null if the path or template is empty', () => {
    expect ( extractPathVariables ( '', '' ) ).toEqual ( {} );
    expect ( extractPathVariables ( '/path/{id}', '' ) ).toBeNull ();
    expect ( extractPathVariables ( '', '/path/123' ) ).toBeNull ();
  } );

  // Additional test for special characters
  it ( 'should handle special characters in the path', () => {
    const template = '/data/{dataId}';
    const path = '/data/special%20characters%20123';
    const expected = { dataId: 'special%20characters%20123' };
    const result = extractPathVariables ( template, path );
    expect ( result ).toEqual ( expected );
  } );

} );
describe ( 'extractPathAndQuery', () => {
  test ( 'should extract path and query correctly when both are present', () => {
    const result = extractPathAndQuery ( '/some/path?param1=value1&param2=value2' );
    expect ( result ).toEqual ( {
      "params": {
        "param1": "value1",
        "param2": "value2"
      },
      "path": "/some/path",
      "query": "param1=value1&param2=value2"
    } );
  } );

  test ( 'should return only path when no query string is present', () => {
    const result = extractPathAndQuery ( '/just/a/path' );
    expect ( result ).toEqual ( {
      "params": {},
      path: '/just/a/path',
      query: ''
    } );
  } );

  test ( 'should handle empty query strings correctly', () => {
    const result = extractPathAndQuery ( '/path/with/empty/query?' );
    expect ( result ).toEqual ( {
      params: {},
      path: '/path/with/empty/query',
      query: ''
    } );
  } );

  test ( 'should return empty path and query if given an empty string', () => {
    const result = extractPathAndQuery ( '' );
    expect ( result ).toEqual ( {
      params: {},
      path: '',
      query: ''
    } );
  } );

  test ( 'should handle paths with multiple question marks correctly', () => {
    const result = extractPathAndQuery ( '/path/with/multiple??query=weird&case=two' );
    expect ( result ).toEqual ( {
      "params": {
        "case": "two",
        "query": "weird"
      },
      "path": "/path/with/multiple",
      "query": "?query=weird&case=two"
    } );
  } );
} );
