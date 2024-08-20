import { fileOpsNode } from "@laoban/filesops-node";
import { findFileUp } from "@laoban/fileops";
import { jsYaml } from "@itsmworkbench/jsyaml";
import { defaultCommentFactoryFunction, loadAndMergeAndYamlParts, LoadFilesFn } from "@fusionconfig/config";
import { findConfigUsingFileops } from "./load.files";

const fileOps = fileOpsNode ()
const laobanDirPromise = findFileUp ( process.cwd (), async s => fileOps.isFile ( fileOps.join ( s, 'laoban.json' ) ) )
const testDirPromise = laobanDirPromise.then ( d => d ? fileOps.join ( d, 'demo' ) : undefined )
let params = { channel: 'merchantPortal', geo: 'uk', product: 'carLoan' };

const loadFiles: LoadFilesFn = findConfigUsingFileops ( fileOps, jsYaml () )
const defaultCommentFunction = defaultCommentFactoryFunction ( 85 )
describe ( "merging global.yaml", () => {
  it ( "should have a mergeForCli", async () => {
    const { fileDetails, sorted, errors, yaml } =
            await loadAndMergeAndYamlParts ( loadFiles, [], defaultCommentFunction,params, await testDirPromise, 'global.yaml', false )
    expect ( errors ).toEqual ( [] )
    expect ( yaml ).toEqual ( `# {"channel":"merchantPortal","geo":"uk","product":"carLoan"}
#
# Files
# {"trail":[],"file":"global.yaml","exists":true,"errors":[]}
# {"trail":["global.yaml"],"file":"services.yaml","exists":true,"errors":[]}
# {"trail":["global.yaml"],"file":"tasks.yaml","exists":true,"errors":[]}
# {"trail":["global.yaml"],"file":"carLoan.yaml","exists":true,"errors":[]}
# {"trail":["global.yaml"],"file":"geo/uk/uk_overrides.yaml","exists":true,"errors":[]}
#
# Files not found
# {"trail":["global.yaml"],"file":"geo/uk/carLoan/uk_carLoan.yaml","exists":false,"errors":[]}
# {"trail":["global.yaml"],"file":"geo/uk/carLoan/merchantPortal/uk_carLoan_merchantPortal.yaml","exists":false,"errors":[]}
#
version:
  1                                                                                   # Added by: global.yaml, services.yaml, geo/uk/uk_overrides.yaml
parameters:
  product:
    legal:
      - instantLoan                                                                   # Added by: global.yaml
      - mortgage                                                                      # Added by: global.yaml
      - creditCard                                                                    # Added by: global.yaml
      - carLoan                                                                       # Added by: global.yaml
  geo:
    legal:
      - uk                                                                            # Added by: global.yaml
      - sw                                                                            # Added by: global.yaml
      - ca                                                                            # Added by: global.yaml
  channel:
    legal:
      - customerPortal                                                                # Added by: global.yaml
      - merchantPortal                                                                # Added by: global.yaml
      - selfServicePortal                                                             # Added by: global.yaml
hierarchy:
  All the services we can use:
    services.yaml                                                                     # Added by: global.yaml
  All the tasks that are in Camunda:
    tasks.yaml                                                                        # Added by: global.yaml
  Product Specific Configuration:
    carLoan.yaml                                                                      # Added by: global.yaml
  Geo Specific Configuration:
    geo/uk/uk_overrides.yaml                                                          # Added by: global.yaml
  This Product in This Country:
    geo/uk/carLoan/uk_carLoan.yaml                                                    # Added by: global.yaml
  Channel Specific Configuration:
    geo/uk/carLoan/merchantPortal/uk_carLoan_merchantPortal.yaml                      # Added by: global.yaml
bpmn:
  model:
    carLoan                                                                           # Added by: global.yaml, carLoan.yaml
plugins:
  - addKafkaSchemasToServices                                                         # Added by: global.yaml
  - addTaskDetails                                                                    # Added by: global.yaml
  - addTransformersToTasks                                                            # Added by: global.yaml
  - removeKey(services)                                                               # Added by: global.yaml
  - removeKey(parameters)                                                             # Added by: global.yaml
  - removeKey(hierarchy)                                                              # Added by: global.yaml
  - removeKey(where)                                                                  # Added by: global.yaml
  - removeKey(plugins)                                                                # Added by: global.yaml
services:
  experian_aml:
    serviceDescription:
      AML service provided by Experian for real-time background checks.               # Added by: services.yaml
    request:
      topic:
        experian.aml.request                                                          # Added by: services.yaml
    response:
      topic:
        experian.aml.response                                                         # Added by: services.yaml
  equifax_creditCheck:
    serviceDescription:
      Credit score checking service provided by Equifax.                              # Added by: services.yaml
    request:
      topic:
        equifax.creditScore.request                                                   # Added by: services.yaml
    response:
      topic:
        equifax.creditScore.response                                                  # Added by: services.yaml
  experian_creditCheck:
    serviceDescription:
      Credit score checking service provided by Experian.                             # Added by: services.yaml
    request:
      topic:
        experian.creditScore.request                                                  # Added by: services.yaml
    response:
      topic:
        experian.creditScore.response                                                 # Added by: services.yaml
  internal_signatureVerification:
    serviceDescription:
      Internal signature verification service for document signing.                   # Added by: services.yaml
    request:
      topic:
        internal.signatureVerification.request                                        # Added by: services.yaml
    response:
      topic:
        internal.signatureVerification.response                                       # Added by: services.yaml
  internal_pricingService:
    serviceDescription:
      Internal pricing service for product and service pricing adjustments.           # Added by: services.yaml
    request:
      topic:
        internal.pricing.request                                                      # Added by: services.yaml
    response:
      topic:
        internal.pricing.response                                                     # Added by: services.yaml
  internal_carloan_PricingService:
    serviceDescription:
      Internal pricing service for carloans                                           # Added by: services.yaml
    request:
      topic:
        internal.pricing.request                                                      # Added by: services.yaml
    response:
      topic:
        internal.pricing.response                                                     # Added by: services.yaml
  internal_limitManagement:
    serviceDescription:
      Limit management service for transaction and account limits.                    # Added by: services.yaml
    request:
      topic:
        internal.limitManagement.request                                              # Added by: services.yaml
    response:
      topic:
        internal.limitManagement.response                                             # Added by: services.yaml
tasks:
  aml:
    taskDescription:
      AML check for customer                                                          # Added by: tasks.yaml
    service:
      experian_aml                                                                    # Added by: tasks.yaml
    variables:
      - userdata                                                                      # Added by: tasks.yaml
  creditCheck:
    service:
      equifax_creditCheck                                                             # Added by: tasks.yaml, carLoan.yaml, geo/uk/uk_overrides.yaml
    taskDescription:
      Credit check for customer. In the UK we use Equifax                             # Added by: tasks.yaml, carLoan.yaml, geo/uk/uk_overrides.yaml
    variables:
      - userdata                                                                      # Added by: tasks.yaml
  pricing:
    taskDescription:
      Pricing service for product and service pricing adjustments                     # Added by: tasks.yaml
    service:
      internal_pricingService                                                         # Added by: tasks.yaml
    variables:
      - userdata                                                                      # Added by: tasks.yaml
  signatureVerification:
    taskDescription:
      Signature verification for document signing                                     # Added by: tasks.yaml
    service:
      internal_signatureVerification                                                  # Added by: tasks.yaml
    variables:
      - userdata                                                                      # Added by: tasks.yaml
where:
  services:
    service/<service>/<reqOrResp>                                                     # Added by: services.yaml
  tasks:
    - task/<task>/uk/carLoan/merchantPortal/<reqOrResp>                               # Added by: tasks.yaml
    - task/<task>/carLoan/uk/<reqOrResp>                                              # Added by: tasks.yaml
    - task/<task>/carLoan/<reqOrResp>                                                 # Added by: tasks.yaml
    - task/<task>/<reqOrResp>                                                         # Added by: tasks.yaml

` )

  } )
} )