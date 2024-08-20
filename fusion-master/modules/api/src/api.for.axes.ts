import { KoaPartialFunction } from "@itsmworkbench/koa";
import { YamlCapability } from "@itsmworkbench/yaml";
import { isLegalParameter } from "@fusionconfig/config";
import path from "path";
import { NameAnd } from "@laoban/utils";
import { FileOps } from "@laoban/fileops";

export const matchAxes = /\/axes\/(.*)$/;
export const getAxes = ( fileops: FileOps, yaml: YamlCapability, directory: string, debug?: boolean ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx ) => {
      const match = matchAxes.exec ( ctx.context.request.path );
      const isMethodMatch = ctx.context.request.method === 'GET';
      return (match && isMethodMatch)===true;
    },
    apply: async ( ctx ) => {
      const match = matchAxes.exec ( ctx.context.request.path );
      if (match === null) throw new Error ( 'match is null' )
      const rawFile = match[ 1 ];
      const configFileName = path.join ( directory, rawFile )
      const config = await fileops.loadFileOrUrl ( configFileName )
      function parse () {
        if ( configFileName.endsWith ( '.json' ) )
          return JSON.parse ( config ).parameters;
        else if ( configFileName.endsWith ( '.yaml' ) )
          return yaml.parser ( config ).parameters;
        else throw new Error ( 'Invalid file type for file' + configFileName );
      }
//add 404
      const params = parse ()
      const result: NameAnd<string[]> = {}
      Object.entries ( params || {} ).forEach ( ( [ name, p ] ) => {
        if ( isLegalParameter ( p ) )
          result[ name ] = p.legal
      } )
      ctx.context.status = 200;
      ctx.context.body = JSON.stringify ( result, null, 2 )
    }
  });
};
