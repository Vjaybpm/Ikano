import { convertToYaml, defaultCommentFactoryFunction, } from "./convert.to.yaml";
import { Merged } from "./merge";

const defaultCommentFunction = defaultCommentFactoryFunction ( 20 )
describe ( 'convertToYaml', () => {
  it ( 'converts primitive values to YAML', () => {
    const merged: Merged = { value: 'Hello, World!', files: [ 'source1.yaml' ] };
    const yamlString = convertToYaml ( merged, defaultCommentFunction );
    expect ( yamlString ).toEqual ( 'Hello, World!        # Added by: source1.yaml\n' );
  } );

  it ( 'includes comments for primitive values when requested', () => {
    const merged: Merged = { value: 42, files: [ 'source1.yaml' ] };
    const yamlString = convertToYaml ( merged, defaultCommentFunction );
    expect ( yamlString ).toEqual ( '42                   # Added by: source1.yaml\n' );
  } );

  it ( 'converts arrays to YAML', () => {
    const merged: Merged = {
      value: [
        { value: 'item1', files: [ 'source1.yaml' ] },
        { value: 'item2', files: [ 'source2.yaml' ] },
      ],
      files: [ 'sourcex.yaml' ]
    };
    const yamlString = convertToYaml ( merged, defaultCommentFunction );
    expect ( yamlString ).toEqual ( '' +
      '- item1              # Added by: source1.yaml\n' +
      '- item2              # Added by: source2.yaml\n' );
  } );

  it ( 'converts objects to YAML', () => {
    const merged: Merged = {
      value: {
        key1: { value: 'value1', files: [ 'source1.yaml' ] },
        key2: { value: 'value2', files: [ 'source2.yaml' ] }
      },
      files: []
    };
    const yamlString = convertToYaml ( merged, defaultCommentFunction );
    expect ( yamlString ).toMatch ( /key1:\n  value1/ );
  } );

  it ( 'handles nested structures', () => {
    const merged: Merged = {
      value: {
        nested: {
          value: { key: { value: 'nestedValue', files: [ 'source2.yaml' ] } },
          files: [ 'source1.yaml' ]
        }
      },

      files: []
    };
    const yamlString = convertToYaml ( merged, defaultCommentFunction );
    expect ( yamlString ).toEqual ( 'nested:\n' +
      '  key:\n' +
      '    nestedValue      # Added by: source2.yaml\n' );
  } );
} );
