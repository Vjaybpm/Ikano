import { jsYaml } from "@itsmworkbench/jsyaml";
import { hasErrors } from "@laoban/utils";
import { NamedLoadResult, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";
import { convertToYaml, defaultCommentFactoryFunction, intoMerged, postProcess } from "@fusionconfig/config";
import { addKafkaSchemasToServices, defaultKafkaNameFn } from "./service.post.processor";

const defaultCommentFunction = defaultCommentFactoryFunction ( 85 )

const yamlAsText = `
version: 1

where:
   services: "service.<service>.<reqOrResp>"
   tasks: 
   - "task.<task>.<reqOrResp>.\${geo}.\${product}.\${channel}"

services:
  experian_aml:
    description: "AML service provided by Experian for real-time background checks."
    request:
      topic: "experian.aml.request"
    response:
      topic: "experian.aml.response"

  equifax_creditCheck:
    description: "Credit score checking service provided by Equifax."
    request:
      topic: "equifax.creditScore.request"
    response:
      topic: "equifax.creditScore.response"

  experian_creditCheck:
    description: "Credit score checking service provided by Experian."
    request:
      topic: "experian.creditScore.request"
    response:
      topic: "experian.creditScore.response"
`

const yamlCapability = jsYaml ()
const obj = yamlCapability.parser ( yamlAsText )
const fakeLoadNamed: UrlLoadNamedFn = async ( url ) => {
  const result: NamedLoadResult<any> = {
    url: writeUrl ( url ),
    mimeType: 'application/json',
    id: 'id for ' + url.name,
    result: 'something',
    fileSize: 100
  }
  return result;
}
describe ( 'post.process', () => {
  it ( 'should return input if no post processors', async () => {
    const merged = intoMerged ( 'pretend.yaml' ) ( obj )
    const originalYaml = convertToYaml ( intoMerged ( 'pretend.yaml' ) ( obj ), defaultCommentFunction )
    const result = await postProcess ( [], merged, {} )
    if ( hasErrors ( result ) ) throw new Error ( 'should not have errors\n' + JSON.stringify ( result, null, 2 ) )
    expect ( convertToYaml ( result, defaultCommentFunction ) ).toEqual ( originalYaml )

  } );
  it ( 'should be able to post process a yaml file adding schemas to request and responses', async () => {
    const merged = intoMerged ( 'pretend.yaml' ) ( obj )
    const [ result ] = await Promise.all ( [ postProcess ( [ addKafkaSchemasToServices ( defaultKafkaNameFn ( fakeLoadNamed ) ) ], merged, {} ) ] )
    if ( hasErrors ( result ) ) throw new Error ( 'should not have errors\n' + JSON.stringify ( result, null, 2 ) )
    expect ( convertToYaml ( result, defaultCommentFunction ) ).toEqual ( `version:
  1                                                                                   # Added by: pretend.yaml
where:
  services:
    service.<service>.<reqOrResp>                                                     # Added by: pretend.yaml
  tasks:
    - task.<task>.<reqOrResp>.\${geo}.\${product}.\${channel}                            # Added by: pretend.yaml
services:
  experian_aml:
    description:
      AML service provided by Experian for real-time background checks.               # Added by: pretend.yaml
    request:
      topic:
        experian.aml.request                                                          # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.experian_aml.request                                # Added by: addRequestsAndResponsesToServices
        id:
          id for service.experian_aml.request                                         # Added by: addRequestsAndResponsesToServices
    response:
      topic:
        experian.aml.response                                                         # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.experian_aml.response                               # Added by: addRequestsAndResponsesToServices
        id:
          id for service.experian_aml.response                                        # Added by: addRequestsAndResponsesToServices
  equifax_creditCheck:
    description:
      Credit score checking service provided by Equifax.                              # Added by: pretend.yaml
    request:
      topic:
        equifax.creditScore.request                                                   # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.equifax_creditCheck.request                         # Added by: addRequestsAndResponsesToServices
        id:
          id for service.equifax_creditCheck.request                                  # Added by: addRequestsAndResponsesToServices
    response:
      topic:
        equifax.creditScore.response                                                  # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.equifax_creditCheck.response                        # Added by: addRequestsAndResponsesToServices
        id:
          id for service.equifax_creditCheck.response                                 # Added by: addRequestsAndResponsesToServices
  experian_creditCheck:
    description:
      Credit score checking service provided by Experian.                             # Added by: pretend.yaml
    request:
      topic:
        experian.creditScore.request                                                  # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.experian_creditCheck.request                        # Added by: addRequestsAndResponsesToServices
        id:
          id for service.experian_creditCheck.request                                 # Added by: addRequestsAndResponsesToServices
    response:
      topic:
        experian.creditScore.response                                                 # Added by: pretend.yaml
      kafka:
        name:
          itsm/org/schema/service.experian_creditCheck.response                       # Added by: addRequestsAndResponsesToServices
        id:
          id for service.experian_creditCheck.response                                # Added by: addRequestsAndResponsesToServices
` )
  } );
} )
