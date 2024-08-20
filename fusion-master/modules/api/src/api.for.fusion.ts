import { KoaPartialFunction } from "@itsmworkbench/koa";
import { CommentFunction, loadAndMergeAndYamlParts, LoadFilesFn } from "@fusionconfig/config";
import path from "path";
import { toArray } from "@laoban/utils";
import { PostProcessor } from "@fusionconfig/config";

export const matchFusion = /\/fusion\/(.*)$/;
export const matchRawFusion = /\/fusion\/raw\/(.*)$/;
export const getFusion = ( matchFusion: RegExp, loadFiles: LoadFilesFn, postProcessors: PostProcessor[], commentFn: CommentFunction, parent: string, debug?: boolean ): KoaPartialFunction => {
  if ( loadFiles === undefined ) throw new Error ( 'loadFiles is undefined' )
  return ({
    isDefinedAt: ( ctx ) => {
      const match = matchFusion.exec ( ctx.context.request.path );
      const isMethodMatch = ctx.context.request.method === 'GET';
      return (match && isMethodMatch) === true;
    },
    apply: async ( ctx ) => {
      const match = matchFusion.exec ( ctx.context.request.path );
      if (match === null) throw new Error ( 'match is null' )
      const rawFile = match[ 1 ];
      const fullFile = path.join ( parent, rawFile )
      const fileParent = path.dirname ( fullFile )
      const file = path.basename ( fullFile )
      const params = ctx.context.request.query || {};
      if ( debug ) {
        console.log ( 'fullFile', fullFile )
        console.log ( 'fileParent', fileParent )
        console.log ( 'file', file )
        console.log ( 'loadFiles', loadFiles )
      }
      const { errors, yaml, postProcessorErrors } =
              await loadAndMergeAndYamlParts ( loadFiles, postProcessors, commentFn, params, fileParent, file, debug )
      if ( errors.length > 0 ) {
        ctx.context.status = 400;
        ctx.context.body = JSON.stringify ( errors )
        ctx.context.set ( 'Content-Type', 'application/json' );
        return;
      }
      if ( toArray ( postProcessorErrors ).length > 0 ) {
        ctx.context.status = 400;
        ctx.context.body = JSON.stringify ( postProcessorErrors )
        ctx.context.set ( 'Content-Type', 'application/json' );
        return;
      }
      ctx.context.status = 200;
      ctx.context.body = yaml;
      ctx.context.set ( 'Content-Type', 'text/yaml' );
    }
  });
};
