import { addAllFieldsInMergedToMerge, addIdAndNameToMergedFromLoadResult, findPartInMerged, Merged, PostProcessor } from "@fusionconfig/config";
import { findStringArray } from "@fusionconfig/config";
import { ErrorsAnd, hasErrors, mapErrors, NameAnd } from "@laoban/utils";
import { NamedLoadResult } from "@itsmworkbench/urlstore";
import { SchemaNameFn } from "./tasks.schema.names";


//Goes through the tasks and for each one
//   - find the service that will be implementing it in this case (already handled by the config: deals with localisation like 'globally we do this but here we do that'
//   - find the schema for task.request and task.response and add the details to the task (id and name)
//      -This is a lot of variation here.
//      -The schema could be different for different countries, products, channels etc
//      - We don't want to have customers explicit manage this. There are hundreds of permutations and it would be easy to make a mistake
//      - So instead we scan the 'relevant schemas' and if there is a local override we use that
//
// Dependencies
// -The 'relevant schemas' are defined in the 'where.tasks' field
// - The services are defined in the 'services' field
// - The code currently mandates that a request and response for those are already defined
//    - That's probably an error: couples this to early post proessing... fix if move to MVP

export function addTaskDetails ( nameFn: SchemaNameFn ): PostProcessor {
  return {
    key: 'tasks',
    postProcess: async ( full: Merged, tasks: Merged, params: NameAnd<string>, debug: boolean | undefined ): Promise<ErrorsAnd<Merged>> => {
      if ( debug ) console.log ( 'addTaskDetails' )

      if ( typeof tasks.value !== 'object' ) return [ 'tasks is not an object' ]

      const taskSchemas = findPartInMerged ( full, 'where.tasks' )
      if ( !taskSchemas ) return [ 'No where.tasks found. These are used to control where we look for schemas' ]
      const taskSchemaNames = findStringArray ( taskSchemas )
      if ( taskSchemaNames.length === 0 ) return [ `No where.tasks found. These are used to control where we look for schemas - had value but wasn't an array of string. This might look like  "task.<task>.<reqOrResp>.\${geo}.\${product}.\${channel}"` ]
      const services = findPartInMerged ( full, 'services' )
      if ( !services ) return [ 'No services found' ]

      const taskNames = Object.keys ( tasks.value )
      if ( debug ) {
        console.log ( 'taskNames', taskNames, )
        console.log ( 'taskSchemaNames', taskSchemaNames, )
      }
      const errors: string[] = []
      for ( let taskName of taskNames ) {
        const task = findPartInMerged ( tasks, taskName )
        if ( task === undefined ) throw new Error ( `Task ${taskName} not found in tasks` )
        const serviceName = findPartInMerged ( task, 'service' )?.value
        if ( !serviceName ) errors.push ( `No service found for tasks ${taskName}. This is mandatory field: we need to know which service will be providing the task` )
        else if ( typeof serviceName !== 'string' ) errors.push ( `The service found for tasks ${taskName} was not a string. It should just be the service name. It was ${JSON.stringify ( serviceName )}` )
        else {
          const service = findPartInMerged ( services, serviceName )
          if ( !service ) errors.push ( `Service ${serviceName} not found for task ${taskName}. This was added by the file ${task?.files} at tasks.${taskName}.service` )
          else {
            const serviceDetails = addAllFieldsInMergedToMerge ( task, service, 'addTaskSchemasToServices' )
            if ( hasErrors ( serviceDetails ) ) errors.push ( ...serviceDetails )
            else {
              const req = await addRequestOrResponseToTask ( taskName, task, 'request', taskSchemaNames, 'addTaskSchemasToServices', nameFn )
              if ( hasErrors ( req ) ) errors.push ( ...req )
              const res = await addRequestOrResponseToTask ( taskName, task, 'response', taskSchemaNames, 'addTaskSchemasToServices', nameFn )
              if ( hasErrors ( res ) ) errors.push ( ...res )
            }
          }
        }
      }
      if ( errors.length > 0 ) return [ `Error processing 'addTaskSchemasToServices'`, ...errors ]
      return full
    }
  }
}

export async function addRequestOrResponseToTask ( taskName: string, task: Merged, requestOrResponse: string, taskSchemaNames: string[], addedBy: string, nameFn: SchemaNameFn ): Promise<ErrorsAnd<Merged>> {
  let reqResp = findPartInMerged ( task, requestOrResponse );
  if ( !reqResp ) return [ `No ${reqResp} found for task ${taskName}` ]

  return mapErrors ( await nameFn ( taskName, requestOrResponse, taskSchemaNames ), async ( requestLoaded: NamedLoadResult<any> ) =>
    addIdAndNameToMergedFromLoadResult ( reqResp, `schema`, requestLoaded, addedBy ) )
}
