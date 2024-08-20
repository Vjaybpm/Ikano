import { withDebug } from "./debug";
import { LoggingHookState, loggingHookState } from "./async.hooks";
import { LogConfig0, LogLevel } from "./log";

const empty = {
  globalLogLevel: 'TRACE' as LogLevel,
  timeService: () => 1622547600000,
  correlationId: '12345',
  params: { a: '1', b: 2 },
  commonLogMessage: { 'testMessage': 'This is a test message' },
  mainTemplate: '{time} {level} [CorrelationId: {correlationId}] {message}',
}
describe ( 'withDebug', () => {
  it ( 'should log entering and exiting messages and return the function result', async () => {
    const storedLog: { level: LogLevel, message: string }[] = [];
    const testState = { ...empty, log: ( lvl, message ) => storedLog.push ( { level: lvl, message } ) };

    const mockFn = jest.fn ().mockResolvedValue ( 'mock result' );
    const config: LogConfig0<any> & { id: string } = {
      id: 'testFunction',
      loglevel: 'INFO'
    };

    const wrappedFunction = withDebug ( config, mockFn );

    let result;
    await loggingHookState.run ( testState, async () => {
      result = await wrappedFunction ( 1, 2, 3 );
    } );

    expect ( result ).toBe ( 'mock result' );
    expect ( mockFn ).toHaveBeenCalled ();
    expect ( storedLog ).toEqual ( [
      { "level": "INFO", "message": "1622547600000 INFO [CorrelationId: 12345] Entering  with 1,2,3" },
      { "level": "INFO", "message": "1622547600000 INFO [CorrelationId: 12345] Exiting  with \"mock result\"" } ] )
  } );

  it ( 'should log entering and exiting messages with custom templates and return the function result', async () => {
    const storedLog: { level: LogLevel, message: string }[] = [];
    const testState = { ...empty, log: ( lvl, message ) => storedLog.push ( { level: lvl, message } ) };

    const mockFn = jest.fn ().mockResolvedValue ( 'mock result' );
    const config: LogConfig0<any> & { id: string } = {
      id: 'testFunction',
      loglevel: 'INFO',
      enterMessage: 'Custom {id} with {in} using param {a} ',
      exitMessage: 'Custom {id} with {out} and correlationid {correlationId}'
    };

    const wrappedFunction = withDebug ( config, mockFn );

    let result;
    await loggingHookState.run ( testState, async () => {
      result = await wrappedFunction ( 1, 2, 3 );
    } );

    expect ( result ).toBe ( 'mock result' );
    expect ( mockFn ).toHaveBeenCalled ();
    expect ( storedLog ).toEqual ( [
      { "level": "INFO", "message": "1622547600000 INFO [CorrelationId: 12345] Custom  with 1,2,3 using param 1 " },
      { "level": "INFO", "message": "1622547600000 INFO [CorrelationId: 12345] Custom  with \"mock result\" and correlationid 12345" }
    ] )

  } )

  it ( 'should directly execute the function without logging if loglevel, enterMessage, and exitMessage are undefined', async () => {
    const storedLog: { level: LogLevel, message: string }[] = [];
    const testState = { ...empty, log: ( lvl, message ) => storedLog.push ( { level: lvl, message } ) };


    const mockFn = jest.fn ().mockResolvedValue ( 'direct result' );
    const config: LogConfig0<any> & { id: string } = { id: 'directFunction' }; // No logging info

    const wrappedFunction = withDebug ( config, mockFn );

    let result;
    await loggingHookState.run ( testState, async () => {
      result = await wrappedFunction ();
    } );

    expect ( result ).toBe ( 'direct result' );
    expect ( mockFn ).toHaveBeenCalled ();
    expect ( storedLog ).toEqual ( [] )
  } );
} );

