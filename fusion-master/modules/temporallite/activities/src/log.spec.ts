import { LogConfig1, LogLevel, makeObjectFromParams, makeObjectFromParamsAndOutput } from "./log";
import { cleanLoggingHookState, loggingHookState, LoggingHookState, SafeLoggingHookState, useLogging } from "./async.hooks";

describe ( 'makeObjectFromParams', () => {
  it ( 'should handle simple parameter extraction correctly', () => {
    const template = '{p1}, {p2}, {p3}';
    const args = [ 'hello', 'world', 123 ];
    const config = {};
    const result = makeObjectFromParams ( config, template, args );
    expect ( result ).toEqual ( { p1: '"hello"', p2: '"world"', p3: '123' } );
  } );

  it ( 'should return undefined for out-of-bounds parameters', () => {
    const template = '{p1}, {p2}, {p3}, {p4}';
    const args = [ 'hello', 'world' ];
    const config = {};
    const result = makeObjectFromParams ( config, template, args );
    expect ( result.p4 ).toBeUndefined ();
  } );

  it ( 'should use custom formatter if available', () => {
    const template = '{p1}, {p2}';
    const args = [ 42, true ];
    const config = {
      formatInput1: ( param: any ) => `Number: ${param}`,
      formatInput2: ( param: any ) => `Boolean: ${param}`,
    };
    const result = makeObjectFromParams ( config, template, args );
    expect ( result ).toEqual ( { p1: 'Number: 42', p2: 'Boolean: true' } );
  } );

  it ( 'should handle "in" to concatenate all inputs', () => {
    const template = '{in}';
    const args = [ 'one', 'two', 'three' ];
    const config = {};
    const result = makeObjectFromParams ( config, template, args );
    expect ( result.in ).toEqual ( '"one","two","three"' );
  } );

  it ( 'should handle null and undefined inputs properly', () => {
    const template = '{p1}, {p2}';
    const args = [ null, undefined ];
    const config = {};
    const result = makeObjectFromParams ( config, template, args );
    expect ( result ).toEqual ( { p1: 'null', p2: 'undefined' } );
  } );

  it ( 'should handle errors in custom formatter gracefully', () => {
    const template = '{p1}';
    const args = [ 42 ];
    const config: LogConfig1<string, string> = {
      formatInput1: (): string => { throw new Error ( 'Test Error' ); }
    };
    const result = makeObjectFromParams ( config, template, args );
    expect ( result.p1 ).toEqual ( '42' ); // fallback to param.toString() in the catch block
  } );
} );

describe ( "makeObjectFromParamsAndOutput", () => {
  it ( 'should handle simple output (no function and a serialisable value) correctly', () => {
    const template = '{p1}, {p2}';
    const args = [ 'hello', 'world' ];
    const output = 'output';
    const config = {};
    const result = makeObjectFromParamsAndOutput ( config, template, args, output );
    expect ( result ).toEqual ( { p1: '"hello"', p2: '"world"', out: '"output"' } );
  } )
  it ( "should handle output being null", () => {
    const template = '{p1}, {p2}';
    const args = [ 'hello', 'world' ];
    const output = null;
    const config = {};
    const result = makeObjectFromParamsAndOutput ( config, template, args, output );
    expect ( result ).toEqual ( { p1: '"hello"', p2: '"world"', out: 'null' } );
  } )
  it ( "should modify the output with a function if provided in config", () => {
    const template = '{p1}, {p2}';
    const args = [ 'hello', 'world' ];
    const output = 'output';
    const config = {
      formatOutput: ( output: any ) => output.toUpperCase ()
    };
    const result = makeObjectFromParamsAndOutput ( config, template, args, output );
    expect ( result ).toEqual ( { p1: '"hello"', p2: '"world"', out: 'OUTPUT' } );
  } )
  it ( "should resort to toString if the output function throws an error", () => {
    const template = '{p1}, {p2}';
    const args = [ 'hello', 'world' ];
    const output = 'output';
    const config: LogConfig1<string, string> = {
      formatOutput: () => { throw new Error ( 'Test Error' ); }
    };
    const result = makeObjectFromParamsAndOutput ( config, template, args, output );
    expect ( result ).toEqual ( { p1: '"hello"', p2: '"world"', out: 'output' } );
  } )

} )

describe ( 'cleanLoggingHookState', () => {
  it ( 'should fill in defaults for missing properties', () => {
    const partialState: LoggingHookState = {};
    const cleanedState = cleanLoggingHookState ( partialState );
    expect ( cleanedState.timeService ).toBeDefined ();
    expect ( cleanedState.correlationId ).toBe ( '' );
    expect ( cleanedState.commonLogMessage ).toEqual ( {} );
    expect ( cleanedState.mainTemplate ).toBe ( '{time} {level} {message}' );
    expect ( cleanedState.log ).toBeDefined ();
  } );

  it ( 'should fill in defaults for missing properties when correlation id present', () => {
    const partialState: LoggingHookState = { correlationId: 'someid' };
    const cleanedState = cleanLoggingHookState ( partialState );
    expect ( cleanedState.timeService ).toBeDefined ();
    expect ( cleanedState.correlationId ).toBe ( 'someid' );
    expect ( cleanedState.commonLogMessage ).toEqual ( {} );
    expect ( cleanedState.mainTemplate ).toBe ( '{time} {level} [CorrelationId: {correlationId}] {message}' );
    expect ( cleanedState.log ).toBeDefined ();
  } );

  it ( 'should use existing values when provided', () => {
    const fullState: LoggingHookState = {
      timeService: () => 1622547600000,
      correlationId: '12345',
      commonLogMessage: { welcome: "Welcome to the system!" },
      mainTemplate: '{time} {level} [CorrelationId: {correlationId}] {message}',
      log: jest.fn (),
    };
    const cleanedState = cleanLoggingHookState ( fullState );
    expect ( cleanedState.timeService () ).toBe ( 1622547600000 );
    expect ( cleanedState.correlationId ).toBe ( '12345' );
    expect ( cleanedState.commonLogMessage ).toEqual ( { welcome: "Welcome to the system!" } );
    expect ( cleanedState.mainTemplate ).toBe ( '{time} {level} [CorrelationId: {correlationId}] {message}' );
    expect ( cleanedState.log ).toBe ( fullState.log );
  } );

  it ( 'should default to console.log if no log function is provided', () => {
    const partialState: LoggingHookState = {};
    const cleanedState = cleanLoggingHookState ( partialState );
    const consoleSpy = jest.spyOn ( console, 'log' ).mockImplementation ( () => {} );

    // Trigger the default log function
    cleanedState.log ( 'INFO', 'Default log function test' );

    expect ( consoleSpy ).toHaveBeenCalledWith ( 'INFO', 'Default log function test' );
    consoleSpy.mockRestore ();
  } );

  it ( 'should use the provided custom log function', () => {
    const customLogFn = jest.fn ();
    const stateWithCustomLogger: LoggingHookState = {
      log: customLogFn
    };
    const cleanedState = cleanLoggingHookState ( stateWithCustomLogger );

    // Trigger the custom log function
    cleanedState.log ( 'ERROR', 'Custom log function test' );

    expect ( customLogFn ).toHaveBeenCalledWith ( 'ERROR', 'Custom log function test' );
    expect ( customLogFn ).toHaveBeenCalledTimes ( 1 );
  } );
} );

describe ( 'useLogging', () => {
  const empty = {
    globalLogLevel: 'INFO' as LogLevel,
    timeService: () => 1622547600000,
    correlationId: '12345',
    params: { a: '1', b: 2 },
    commonLogMessage: { 'testMessage': 'This is a test message' },
    mainTemplate: '{time} {level} [CorrelationId: {correlationId}] {message}',
  }
  it ( 'should log messages using the provided message templates', async () => {
    const testState: SafeLoggingHookState = { ...empty, log: jest.fn () };

    await loggingHookState.run ( testState, () => {
      const log = useLogging ( { 'testMessage': 'Custom test message' } );
      log ( 'INFO', 'testMessage' );
      const expectedMessage = '1622547600000 INFO [CorrelationId: 12345] Custom test message';
      expect ( testState.log ).toHaveBeenCalledWith ( 'INFO', expectedMessage );
    } );
  } );
  it ( 'should not log message if the log level is below the globalLogLevel', async () => {
    const testState: SafeLoggingHookState = { ...empty, log: jest.fn () };
    await loggingHookState.run ( testState, () => {
      const log = useLogging ( { 'testMessage': 'Custom test message' } );
      log ( 'DEBUG', 'testMessage' );
      expect ( testState.log ).not.toHaveBeenCalled ();
    } );
  } )

  it ( 'should fallback to raw message if no template is found', async () => {
    const testState: SafeLoggingHookState= { ...empty, log: jest.fn () };

    await loggingHookState.run ( testState, () => {
      const log = useLogging ();
      log ( 'ERROR', 'fallbackMessage' );
      const expectedMessage = '1622547600000 ERROR [CorrelationId: 12345] fallbackMessage';

      expect ( testState.log ).toHaveBeenCalledWith ( 'ERROR', expectedMessage );
    } );
  } );
  it ( 'should log messages using the provided message templates with parameters', async () => {
    const testState: SafeLoggingHookState = { ...empty, log: jest.fn () };
    await loggingHookState.run ( testState, () => {
      const log = useLogging ( { 'testMessage': 'Custom test message with {a}, {b} and {c}. Id is {correlationId}' }, { c: 3 } );
      log ( 'INFO', 'testMessage' );
      const expectedMessage = "1622547600000 INFO [CorrelationId: 12345] Custom test message with 1, 2 and 3. Id is 12345";
      expect ( testState.log ).toHaveBeenCalledWith ( 'INFO', expectedMessage );
    } );
  } )
} )

