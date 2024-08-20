import { KoaPartialFunction } from "@itsmworkbench/koa";
import { derefence } from "@laoban/variables";
import { hasErrors } from "@laoban/utils";
import { FileOps } from "@laoban/fileops";
import { parseNamedUrlOrThrow, UrlStore } from "@itsmworkbench/urlstore";
import { jsonataTransformer } from "@fusionconfig/jsonata";
import { doubleXmlVariableDefn } from "@laoban/variables/dist/src/variables";
import fetch from "node-fetch";
export const matchService = /\/service$/;
export const callService = ( matchService: RegExp, fileOps: FileOps, urlStore: UrlStore, debug?: boolean ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx ) => {
      const match = matchService.exec ( ctx.context.request.path );
      const isMethodMatch = ctx.context.request.method === 'POST';
      return (match && isMethodMatch)===true;
    },
    apply: async ( ctx ) => {
      const params = ctx.context.request.query || {};
      const body = JSON.parse ( ctx.context.request.rawBody );
      console.log ( 'body', body )
      const configName = body.configName;
      const activityId = body.activityId;
      const taskId = body.taskId
      const userdata = body.variables?.userdata
      const processId = body.processInstanceId
      const workerId = body.workerId
      const callback = body.callback
      if ( userdata === undefined ) {
        ctx.context.status = 400;
        ctx.context.body = 'userdata is required'
        return;
      }
      const parsedUserData = JSON.parse ( userdata )
      console.log ( 'UserData', parsedUserData )
      try {
        const configString = await fileOps.loadFileOrUrl ( configName );
        const config = JSON.parse ( configString );
        const task = config?.tasks?.[ activityId ]
        // console.log ( 'task', task )
        if ( task === undefined ) {
          ctx.context.status = 400;
          ctx.context.body = `Task ${activityId} not found in config ${configName}`
          return;
        }
        const service = task.service
        console.log ( 'service', service )
        const transformer = task.request?.transformer;
        console.log ( 'transformer', transformer )
        const transName = transformer?.name // should be using id but we need to get the git story sorted.Right now not saving these in git. Name is OK for POC
        if ( transName === undefined ) {
          ctx.context.status = 400;
          ctx.context.body = `Task ${activityId} didn't have a request transformer name in config ${configName}`
          return;
        }
        let url = parseNamedUrlOrThrow ( transName );
        // console.log ( 'url', url )
        const tx = await urlStore.loadNamed <any> ( url )
        // console.log ( 'tx', tx )
        if ( hasErrors ( tx ) ) {
          ctx.context.status = 400;
          ctx.context.body = JSON.stringify ( tx )
          return;
        }
        const jsonata = tx.result?.jsonata || '{"not": "found"}'
        console.log ( 'jsonata', jsonata )
        const output = await jsonataTransformer ( jsonata ) ( parsedUserData )
        console.log ( 'Calling service', service, JSON.stringify ( output, null, 2 ) )
        //ok we aren't really calling it. We're doing the callback instead
        //because we don't have the service yet!
        console.log ( 'callback data', callback, processId, workerId )
        const callbackDerefed = derefence ( 'callback', { processId, workerId, taskId }, callback, { variableDefn: doubleXmlVariableDefn } )
        const variables = { fromaml: output }
        let responseBody = variables;
        console.log ( 'callbackDerefed', callbackDerefed, 'body', JSON.stringify ( responseBody, null, 2 ) )
        const resp = await fetch ( callbackDerefed, {
            method: 'POST', body: JSON.stringify ( responseBody ),
            headers: { 'Content-Type': 'application/json' }
          }
        )
        console.log ( 'resp', resp.status )
        const text = await resp.text ()
        console.log ( 'resp text', text )
        //end of bodge. Back to returning
        ctx.context.status = 200;
        ctx.context.body = JSON.stringify ( { service, data: output }, null, 2 )
        ctx.context.set ( 'Content-Type', 'application/json' );

      } catch ( error ) {
        console.error ( 'Error loading config:', error );
        ctx.context.status = 500;
        ctx.context.body = 'Internal Server Error';
      }
    }
  });
};
