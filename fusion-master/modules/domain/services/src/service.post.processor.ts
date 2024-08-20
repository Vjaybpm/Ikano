import { NamedLoadResult, NamedUrl, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";
import { addIdAndNameToMergedFromLoadResult, findPartInMerged, Merged, PostProcessor } from "@fusionconfig/config";
import { ErrorsAnd, hasErrors, mapErrors, NameAnd } from "@laoban/utils";

export type KafkaNameFn = ( kafkaSchemaName: string ) => Promise<ErrorsAnd<NamedLoadResult<any>>>
export function defaultKafkaNameFn ( loadNamed: UrlLoadNamedFn ): KafkaNameFn {
  return async ( kafkaSchemaName ): Promise<ErrorsAnd<NamedLoadResult<any>>> => {
    const kafkaUrl: NamedUrl = { scheme: 'itsm', organisation: 'org', namespace: 'schema', name: kafkaSchemaName }
    return mapErrors ( await loadNamed ( kafkaUrl ), url => ({ ...url, url: writeUrl ( kafkaUrl ) }) )
  }

}

//Given a service (aka a pair of  kafka topics) we want to know the schema for the request and response
//There isn't much 'localisation here'. The kafka topics exist globally. There isn't a different schema for calling this from different countries or products or anything
//We have a customisation point which is the 'where.services' that tells us how to find the schema
//example for that would be
//where:
//  services: "service/<service>/<reqOrResp>"
//we could default this of course, but I like to force it to be explicit
export function addKafkaSchemasToServices ( kafkaNameFn: KafkaNameFn ): PostProcessor {
  return {
    key: 'services',
    postProcess:
      async ( full: Merged, services: Merged, params: NameAnd<string>, debug: boolean | undefined ): Promise<ErrorsAnd<Merged>> => {
        if ( debug ) console.log ( 'addKafkaSchemasToServices' )
        if ( typeof services.value !== 'object' ) return [ 'services is not an object' ]

        const kafkaSchemas = findPartInMerged ( full, 'where.services' )
        if ( !kafkaSchemas ) return [ 'No where.services found. This string controls how we look for a schema. It would normally be  "service.<service>.<reqOrResp>"' ]
        const kafkaSchemaString = kafkaSchemas.value
        if ( typeof kafkaSchemaString !== 'string' ) return [ `kafka_schema found but not a string. This string controls how we look for a schema. It would normally be  "service/<service>/<reqOrResp>"` ]
        if ( debug ) {
          console.log ( 'kafkaSchemaString', kafkaSchemaString )
        }

        const serviceNames = Object.keys ( services.value )
        const errors: string[] = []
        for ( let serviceName of serviceNames ) {
          const service = findPartInMerged ( services, serviceName )
          const requestResult = await addRequestOrResponseToService ( serviceName, service, 'request', kafkaSchemaString, 'addRequestsAndResponsesToServices', kafkaNameFn )
          if ( hasErrors ( requestResult ) ) errors.push ( ...requestResult )
          const responseResult = await addRequestOrResponseToService ( serviceName, service, 'response', kafkaSchemaString, 'addRequestsAndResponsesToServices', kafkaNameFn )
          if ( hasErrors ( responseResult ) ) errors.push ( ...responseResult )
        }
        if ( errors.length > 0 ) return [ `Error processing 'addTaskSchemasToServices'`, ...errors ]
        return full
      }

  }
}

export async function addRequestOrResponseToService ( serviceName: string, service: Merged | undefined, requestOrResponse: string, kafkaSchemaString: string, addedBy: string, kafkaNameFn: KafkaNameFn ): Promise<ErrorsAnd<Merged>> {
  if ( service === undefined ) return [ `addRequestToSchema(${serviceName})- No service found` ]
  const request: Merged | undefined = findPartInMerged ( service, requestOrResponse )
  if ( request === undefined ) return [ `addRequestToSchema(${serviceName})- No ${requestOrResponse} found` ]
  const requestTopic: Merged | undefined = findPartInMerged ( request, 'topic' )
  if ( requestTopic === undefined ) return [ `addRequestToSchema(${serviceName})- No topic found in ${requestOrResponse}` ]
  const topicName = requestTopic.value
  if ( !topicName ) return [ `addRequestToSchema(${serviceName})- No topic found in ${requestOrResponse}` ]
  if ( typeof topicName !== 'string' ) return [ `addRequestToSchema(${serviceName}) ${requestOrResponse}- Topic must be a string but is ${JSON.stringify ( topicName )}` ]
  const kafkaSchemaName = kafkaSchemaString.replace ( /<service>/g, serviceName ).replace ( /<reqOrResp>/g, requestOrResponse )

  return mapErrors ( await kafkaNameFn ( kafkaSchemaName ), kafka =>
    addIdAndNameToMergedFromLoadResult ( request, 'kafka', kafka, addedBy ) )
}

