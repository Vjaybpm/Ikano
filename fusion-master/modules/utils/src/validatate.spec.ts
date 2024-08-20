import { composeValidators, Validate, validateChild, validateExists } from "./validate";

describe ( "Validate", () => {
  describe ( 'validateExists', () => {
    const dataWith = { prop: 'value' };
    type DataWith = typeof dataWith;
    const dataWithout: any = {};
    const validator = validateExists<DataWith, 'prop'> ( 'prop' );
    it ( 'should return an error if the property does not exist', () => {
      expect ( validator ( 'TestContext', dataWithout ) ).toEqual ( [ 'TestContext: Property \'prop\' does not exist.' ] );
    } );
    it ( 'should return an empty array if the property exists', () => {
      expect ( validator ( 'TestContext', { prop: 'value' } ) ).toEqual ( [] );
    } );
  } );

  describe ( 'validateChild', () => {
    it ( 'should validate a nested property using the provided validator', () => {
      const mockValidator = jest.fn ( () => [ 'Nested error' ] );
      const validator = validateChild<{ child: { prop: string } }, 'child'> ( 'child', mockValidator );
      const result = validator ( 'Parent', { child: { prop: 'value' } } );
      expect ( result ).toEqual ( [ 'Nested error' ] );
      expect ( mockValidator ).toHaveBeenCalledWith ( 'Parent.child', { prop: 'value' } );
    } );
  } );
  describe ( 'compose', () => {
    it ( 'should combine multiple validators', () => {
      const alwaysPass = jest.fn ( ( context, t ) => [] );
      const alwaysFail = jest.fn ( ( context, t ) => [ `${context}: Failure` ] );
      const combined = composeValidators ( alwaysPass, alwaysFail );

      const errors = combined ( 'Test', {} );
      expect ( errors ).toEqual ( [ 'Test: Failure' ] );
      expect ( alwaysPass ).toHaveBeenCalledWith ( 'Test', {} );
      expect ( alwaysFail ).toHaveBeenCalledWith ( 'Test', {} );
    } );
  } );
} );
