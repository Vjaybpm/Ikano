import { LogConfig0, makeObjectFromParams, makeObjectFromParamsAndOutput } from "./log";
import { useLogging } from "./async.hooks";
import { simpleTemplate } from "@fusionconfig/utils";

export function withDebug<T> ( config: LogConfig0<T> & { id: string }, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  return async ( ...args: any[] ) => {
    let { enterMessage, exitMessage, id, loglevel } = config
    if ( loglevel === undefined && enterMessage === undefined && exitMessage === undefined ) return fn ( ...args )
    if ( enterMessage === undefined ) enterMessage = 'Entering {id} with {in}'
    if ( exitMessage === undefined ) exitMessage = 'Exiting {id} with {out}'
    const log = useLogging ()
    if ( enterMessage ) log ( loglevel || 'TRACE', simpleTemplate ( enterMessage, makeObjectFromParams ( config, enterMessage, args ) ) )
    let result = await fn ( ...args );
    if ( exitMessage ) log ( loglevel || 'DEBUG', simpleTemplate ( exitMessage, makeObjectFromParamsAndOutput ( config, exitMessage, args, result ) ) )
    return result;
  };
}