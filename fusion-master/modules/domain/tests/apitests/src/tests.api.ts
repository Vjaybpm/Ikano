import { hasErrors } from "@laoban/utils";
import { RunReqRespTests, RunReqRespTestsDefn, RunTests, RunTestsDefn } from "@fusionconfig/tests";
import { KoaPartialFunction } from "@itsmworkbench/koa";


export const matchTests = /\/tests$/;
export const runTests = ( runTests: RunReqRespTests, debug?: boolean ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx ) => {
      const match = matchTests.exec ( ctx.context.request.path );
      const isMethodMatch = ctx.context.request.method === 'POST';
      return match && isMethodMatch;
    },
    apply: async ( ctx ) => {
      const body: RunReqRespTestsDefn = JSON.parse ( ctx.context.request.rawBody );
      console.log('runTests', body)
      const result = await runTests ( body );
      ctx.context.body = JSON.stringify ( result, null, 2 );
      ctx.context.set ( 'Content-Type', 'application/json' );
      if ( hasErrors ( result ) )
        ctx.context.status = 400;
      else
        ctx.context.status = 200;
    }
  });
};
