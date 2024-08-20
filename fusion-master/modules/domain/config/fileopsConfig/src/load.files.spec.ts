import { LoadFilesContext, recursivelyFindFileNames } from "./load.files";
import { findFileUp } from "@laoban/fileops";
import { fileOpsNode } from "@laoban/filesops-node";
import { jsYaml } from "@itsmworkbench/jsyaml"

const fileOps = fileOpsNode ()
const laobanDirPromise = findFileUp ( process.cwd (), async s => fileOps.isFile ( fileOps.join ( s, 'laoban.json' ) ) )
const testDirPromise = laobanDirPromise.then ( d => d ? fileOps.join ( d, 'demo' ) : undefined )

const context: LoadFilesContext = { fileOps, yaml: jsYaml (), dic: { channel: 'merchantPortal', geo: 'uk', product: 'carLoan' } }
describe ( "loadFilesIntegrationTest", () => {
  it ( "should find testDir", async () => {
    expect ( await testDirPromise ).toBeTruthy ()
  } )
  it ( "should report missing params", async () => {
    const fileDetails = await recursivelyFindFileNames ( { ...context, dic: {} }, await testDirPromise, [], 'global.yaml' )
    expect ( fileDetails ).toEqual ( [
      {
        "errors": [ "Missing parameter(s) ${channel}, ${geo}, ${product}" ],
        "exists": true,
        "file": "global.yaml",
        "trail": []
      }
    ] )
  } )
  it ( "should load the file details from test", async () => {
    const fileDetails = await recursivelyFindFileNames ( context, await testDirPromise, [], 'global.yaml' )
    expect ( fileDetails.map ( ( { yaml, ...rest } ) => rest ) ).toEqual ( [
      { "errors": [], "exists": true, "file": "global.yaml", "trail": [] },
      { "errors": [], "exists": true, "file": "services.yaml", "trail": [ "global.yaml" ] },
      { "errors": [], "exists": true, "file": "tasks.yaml", "trail": [ "global.yaml" ] },
      { "errors": [], "exists": true, "file": "carLoan.yaml", "trail": [ "global.yaml" ] },
      { "errors": [], "exists": true, "file": "geo/uk/uk_overrides.yaml", "trail": [ "global.yaml" ] },
      { "errors": [], "exists": false, "file": "geo/uk/carLoan/uk_carLoan.yaml", "trail": [ "global.yaml" ] },
      { "errors": [], "exists": false, "file": "geo/uk/carLoan/merchantPortal/uk_carLoan_merchantPortal.yaml", "trail": [ "global.yaml" ] }
    ] )
  } )
} )