import { NameAnd } from "@laoban/utils";
import { extractVariableNames } from "@itsmworkbench/utils"


export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';
export const LogLevelValue = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  NONE: 5
}

export interface LogConfig0<T> {
  loglevel?: LogLevel; //overrides default when enterMessage and/or exitMessage are set. This allows us to do logging even when the log level is (say) NONE
  messages?: NameAnd<string>
  enterMessage?: string;
  exitMessage?: string;
  formatOutput?: ( output: T ) => string;
}
export interface LogConfig1<P1, T> extends LogConfig0<T> {
  formatInput1?: ( inputs: P1 ) => string;
}
export interface LogConfig2<P1, P2, T> extends LogConfig1<P1, T> {
  formatInput2?: ( inputs: P2 ) => string;
}
export interface LogConfig3<P1, P2, P3, T> extends LogConfig2<P1, P2, T> {
  formatInput3?: ( inputs: P3 ) => string;
}
export interface LogConfig4<P1, P2, P3, P4, T> extends LogConfig3<P1, P2, P3, T> {
  formatInput4?: ( inputs: P4 ) => string;
}
export interface LogConfig5<P1, P2, P3, P4, P5, T> extends LogConfig4<P1, P2, P3, P4, T> {
  formatInput5?: ( inputs: P5 ) => string;
}
export type LogConfig<T> = LogConfig0<T> | LogConfig1<any, T> | LogConfig2<any, any, T> | LogConfig3<any, any, any, T> | LogConfig4<any, any, any, any, T> | LogConfig5<any, any, any, any, any, T>;

function formatMessage ( template: string, ...args: any[] ): string {
  return template.replace ( /{(\d+)}/g, ( match, number ) => {
    return typeof args[ number ] != 'undefined' ? args[ number ] : match;
  } );
}

function modify ( config: LogConfig<any>, param: any, fnName: string ) {
  if ( param === null ) return 'null'
  if ( param === undefined ) return 'undefined'
  try {
    return fnName in config ? config[ fnName ] ( param ) : JSON.stringify ( param );
  } catch ( e ) {
    return param.toString ()
  }
}

export function makeObjectFromParams ( config: LogConfig<any>, template: string, args: any[] ): NameAnd<string | undefined> {
  const varNames = extractVariableNames ( template );
  const result: NameAnd<string> = {};

  // Process all 'px' variables first
  varNames.filter ( name => /^p\d+$/.test ( name ) ).forEach ( name => {
    const match = /^p(\d+)$/.exec ( name );
    if ( match ) {
      const index = Number.parseInt ( match[ 1 ] ) - 1;
      // Check if the index is within bounds of args
      if ( index < args.length ) {
        result[ name ] = modify ( config, args[ index ], `formatInput${index + 1}` );
      } else {//it is undefined as it is out of bounds. Since it's already undefined don't do anything
      }
    }
  } );

  // Process 'in' if it exists, ensuring all relevant 'px' have been processed
  if ( varNames.includes ( 'in' ) ) {
    result[ 'in' ] = args.map ( ( _, index ) => modify ( config, args[ index ], `formatInput${index + 1}` ) ).join ( ',' );
  }
  return result;
}

export function makeObjectFromParamsAndOutput ( config: LogConfig<any>, template: string, args: any[], output: any ): NameAnd<string | undefined> {
  const result = makeObjectFromParams ( config, template, args );
  result[ 'out' ] = modify ( config, output, 'formatOutput' )
  return result;
}
//
//
// export function log<T> ( config: LogConfig<T>, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any[] ) => Promise<T> {
//   const { loglevel, formatOutput = defaultFormatOutput } = config;
//   const formatInput = getFormatInput ( config );
//   return async ( ...args: any[] ): Promise<T> => {
//     if ( loglevel === 'none' ) {
//       return fn ( ...args );
//     }
//     const inputs = args.map ( ( arg, index ) => formatInput ( arg, index + 1 ) );
//     console.log ( `Log: ${inputs.join ( ', ' )}` );
//     try {
//       const output = await fn ( ...args );
//       console.log ( `Log: ${formatOutput ( output )}` );
//       return output;
//     } catch ( error ) {
//       console.error ( `Log: ${error.message}` );
//       throw error;
//     }
//   };
//
// }
//
// // Default log formatting functions
// const defaultFormatInput = ( inputs: any[] ): string => JSON.stringify ( inputs );
// const defaultFormatOutput = ( output: any ): string => JSON.stringify ( output );
