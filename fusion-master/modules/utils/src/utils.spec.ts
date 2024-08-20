import { extractPlaceholders, parseParams, permutate, simpleTemplate } from "./utils";

describe ( 'extractPlaceholders', () => {
  it ( 'extracts single placeholder correctly', () => {
    const text = 'Hello, ${name}!';
    const expected = [ 'name' ];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  it ( 'extracts multiple placeholders correctly', () => {
    const text = '${greeting}, ${name}! Welcome to ${location}.';
    const expected = [ 'greeting', 'name', 'location' ];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  it ( 'returns an empty array when there are no placeholders', () => {
    const text = 'Hello, world!';
    const expected: string[] = [];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  it ( 'handles strings with special characters', () => {
    const text = '${greeting}, ${name}! Your balance is ${balance}$.';
    const expected = [ 'greeting', 'name', 'balance' ];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  it ( 'returns an empty array for an empty string', () => {
    const text = '';
    const expected: string[] = [];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  it ( 'does not recognize false placeholders', () => {
    const text = 'Hello, $name} and ${location!';
    const expected: string[] = [];
    expect ( extractPlaceholders ( text ) ).toEqual ( expected );
  } );

  // You can add more tests here to cover any other cases you can think of.
} );


describe ( 'parseParams', () => {
  it ( 'parses string with multiple parameters correctly', () => {
    const params = 'key1=value1,key2=value2,key3=value3';
    const expected = { key1: 'value1', key2: 'value2', key3: 'value3' };
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  it ( 'parses string with a single parameter correctly', () => {
    const params = 'key=value';
    const expected = { key: 'value' };
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  it ( 'returns an empty object for empty string input', () => {
    const params = '';
    const expected = {};
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  it ( 'returns an empty object for boolean true input', () => {
    const params = true;
    const expected = {};
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  it ( 'returns an empty object for boolean false input', () => {
    const params = false;
    const expected = {};
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  it ( 'handles string without equal sign', () => {
    const params = 'key1,key2=value2';
    // Assuming the function assigns undefined for keys without values.
    const expected = { key1: undefined, key2: 'value2' };
    expect ( parseParams ( params ) ).toEqual ( expected );
  } );

  // Add more tests here for any other edge cases you can think of.
} );


describe('permutate function', () => {
  it('should process all parameter permutations', async () => {
    const params = {
      product: {
        legal: ['instantLoan', 'mortgage']
      },
      geo: {
        legal: ['uk', 'us']
      }
    };

    const processedParams: any[] = [];

    // Mock processOne function that accumulates parameters into an array
    const mockProcessOne = async (params: { [name: string]: string }) => {
      processedParams.push(params);
    };

    await permutate(params, mockProcessOne);

    // Expected permutations
    const expectedPermutations = [
      { product: 'instantLoan', geo: 'uk' },
      { product: 'instantLoan', geo: 'us' },
      { product: 'mortgage', geo: 'uk' },
      { product: 'mortgage', geo: 'us' }
    ];

    // Check if all expected permutations were processed
    expect(processedParams).toEqual(expect.arrayContaining(expectedPermutations));
    // Additionally, check if the number of processed permutations matches the expected number
    expect(processedParams.length).toBe(expectedPermutations.length);
  });
});
describe('simpleTemplate', () => {
  it('should correctly replace the template placeholders with corresponding object values', () => {
    const template = 'Hello, {name}! Your role is {role}.';
    const data = { name: 'Alice', role: 'admin' };
    const expected = 'Hello, Alice! Your role is admin.';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should leave the placeholder intact if no corresponding key is found', () => {
    const template = 'Hello, {name}! Your role is {role}.';
    const data = { name: 'Bob' }; // 'role' key is missing
    const expected = 'Hello, Bob! Your role is {role}.';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should handle multiple occurrences of the same placeholder', () => {
    const template = '{greeting}, {name}! {greeting}, how are you?';
    const data = { greeting: 'Hello', name: 'Charlie' };
    const expected = 'Hello, Charlie! Hello, how are you?';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle empty values in data object', () => {
    const template = 'Data: {value}';
    const data = { value: '' };
    const expected = 'Data: ';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle numerical values in data object', () => {
    const template = 'The number is {number}';
    const data = { number: 123 };
    const expected = 'The number is 123';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should return the original string when data object is empty', () => {
    const template = 'Hello, {name}!';
    const data = {};
    const expected = 'Hello, {name}!';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });

  it('should correctly handle null and undefined as values', () => {
    const template = 'Null value: {nullValue}, Undefined value: {undefinedValue}';
    const data = { nullValue: null, undefinedValue: undefined };
    const expected = 'Null value: null, Undefined value: undefined';
    expect(simpleTemplate(template, data)).toEqual(expected);
  });
});