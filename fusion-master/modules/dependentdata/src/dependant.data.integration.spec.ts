import { mapObjectValues, NameAnd } from "@laoban/utils";
import { Lenses } from "@focuson/lens";
import { depData, depDataK } from "./dependant.data.dsl";
import { findBasics } from "./dependant.data.status";
import { calcAllStatus } from "./dependent.data.evaluation";

type StateForInt = {
  legalParams?: NameAnd<string[]>
  params?: NameAnd<string>
  rawConfig?: string
  config?: string
  tests?: string
  route?: string
}

const idL = Lenses.identity<StateForInt> ()
const legalParamsL = idL.focusOn ( 'legalParams' )
const paramsL = idL.focusOn ( 'params' )
const rawConfigL = idL.focusOn ( 'rawConfig' )
const configL = idL.focusOn ( 'config' )
const testsL = idL.focusOn ( 'tests' )
const routeL = idL.focusOn ( 'route' )

const legalParams: NameAnd<string[]> = { geo: [ 'us', 'uk' ], product: [ 'p1', 'p2' ] }
const legalParams2: NameAnd<string[]> = { geo: [ 'ch', 'uk', 'us' ], product: [ 'p1', 'p2', 'p3' ] }
const params: NameAnd<string> = { geo: 'us', product: 'p1' }
const rawConfig: string = 'config1'

const legalParamsD = depDataK ( 'legalParams', legalParamsL, async ( old: NameAnd<string[]> ) => legalParams, {} )
const paramsD = depDataK ( 'params', paramsL,
  async ( old: NameAnd<string>, lp: NameAnd<string[]> ) =>
    mapObjectValues ( lp, ps => ps[ 0 ] ),
  legalParamsD,
  { clear: true } )

const rawConfigD = depDataK ( 'rawConfig', rawConfigL,
  async ( old: string ) => rawConfig,
  paramsD, { clear: true } )
const configD = depData ( 'config', configL, ( old, config ) => config + '_parsed', rawConfigD, { clear: true } )
const testsD = depData ( 'tests', testsL,
  ( old, params, config ) => 'tests for ' + config + ' with ' + JSON.stringify ( params ),
  paramsD, configD, {} )

describe ( "depData", () => {
  describe ( 'depDataK', () => {
    test ( 'paramsD', () => {
      expect ( paramsD ).toEqual ( {
        "fn": expect.any ( Function ),
        "name": "params",
        "p1": legalParamsD,
        "target": paramsL,
        "type": "dd1",
        "wait": true,
        clear: true
      } )
    } )
    test ( 'rawConfigD', () => {
      expect ( rawConfigD ).toEqual ( {
        "fn": expect.any ( Function ),
        "name": "rawConfig",
        "p1": paramsD,
        "target": rawConfigL,
        "type": "dd1",
        "wait": true,
        clear: true
      } )
    } )
    // clean: expect.any ( Function ),
  } )
} )
describe ( 'findBasics', () => {
  describe ( "legalParams - root", () => {
    test ( "empty state", () => {
      let status = {};
      expect ( findBasics ( status, legalParamsD, {}, {} ) ).toEqual ( {
        paramNames: [],
        rawChanged: false,
        rawValue: undefined,
        upstreamChanged: [],
        upstreamUndefined: []
      } )
      expect ( status ).toEqual ( {} )
    } )
    test ( "with same value", () => {
      let status = {}
      expect ( findBasics ( status, legalParamsD, { legalParams }, { legalParams } ) ).toEqual ( {
        paramNames: [],
        rawChanged: false,
        rawValue: legalParams,
        upstreamChanged: [],
        upstreamUndefined: []
      } )
      expect ( status ).toEqual ( {} )
    } )
    test ( "with different value", () => {
      let status = {}
      expect ( findBasics ( status, legalParamsD, { legalParams }, { legalParams: legalParams2 } ) ).toEqual ( {
        paramNames: [],
        rawChanged: true,
        rawValue: legalParams2,
        upstreamChanged: [],
        upstreamUndefined: []
      } )
      expect ( status ).toEqual ( {} )
    } )
  } )
} )
describe ( "calcAllStatus", () => {
  describe ( "just two dds", () => {
    test ( "emptyState", () => {
      expect ( calcAllStatus ( [ legalParamsD, paramsD ], {}, {} ) ).toEqual ( {
        "legalParams": {
          "changed": false,
          "needsLoad": true,
          "paramNames": [],
          "params": [],
          "rawChanged": false,
          "reason": "Async, all upstreams are defined and unchanged, but we are undefined so need to load",
          "upstreamChanged": [],
          "upstreamUndefined": []
        },
        "params": {
          "changed": false,
          "cleared": false,
          "needsLoad": false,
          "paramNames": [ "legalParams" ],
          "rawChanged": false,
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "legalParams" ]
        }
      } )
    } )
    test ( "changed parent", () => {
      expect ( calcAllStatus ( [ legalParamsD, paramsD ], { legalParams: legalParams, params }, { legalParams: legalParams2, params } ) ).toEqual ( {
        "legalParams": {
          "changed": true,
          "paramNames": [],
          "rawChanged": true,
          "rawValue": { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] }, "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] }
        },
        "params": {
          "changed": true,
          cleared: true,
          "needsLoad": true,
          "paramNames": [ "legalParams" ],
          "params": [ { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] } ],
          "rawChanged": false,
          "rawValue": { "geo": "us", "product": "p1" },
          "reason": "Async, upstream has changed",
          "upstreamChanged": [ "legalParams" ],
          "upstreamUndefined": [],
        }
      } )
    } )
    test ( "emptyState", () => {
      expect ( calcAllStatus ( [ legalParamsD, paramsD, rawConfigD, configD, testsD ], {}, {} ) ).toEqual ( {
        "config": {
          "changed": false,
          cleared: false,
          "needsLoad": false,
          "paramNames": [ "rawConfig" ],
          "rawChanged": false,
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "rawConfig" ]
        },
        "legalParams": {
          "changed": false,
          "needsLoad": true,
          "paramNames": [],
          "params": [],
          "rawChanged": false,
          "reason": "Async, all upstreams are defined and unchanged, but we are undefined so need to load",
          "upstreamChanged": [],
          "upstreamUndefined": []
        },
        "params": {
          "changed": false,
          "cleared": false,
          "needsLoad": false,
          "paramNames": [ "legalParams" ],
          "rawChanged": false,
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "legalParams" ]
        },
        "rawConfig": {
          "changed": false,
          "cleared": false,
          "needsLoad": false,
          "paramNames": [ "params" ],
          "rawChanged": false,
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "params" ]
        },
        "tests": {
          "changed": false,
          "needsLoad": false,
          "paramNames": [ "params", "config" ],
          "rawChanged": false,
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "params", "config" ]
        }
      } )
    } )
    test ( "goodState change legalParams", () => {
      const oldState = { params, legalParams, rawConfig, config: 'config1_parsed', tests: 'sometests' }
      const newState = { ...oldState, legalParams: legalParams2 }
      expect ( calcAllStatus ( [ legalParamsD, paramsD, rawConfigD, configD, testsD ], oldState, newState ) ).toEqual ( {
        "config": {
          "changed": true,
          "cleared": true,
          "needsLoad": false,
          "paramNames": [
            "rawConfig"
          ],
          "rawChanged": false,
          "rawValue": "config1_parsed",
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [
            "rawConfig"
          ]
        },
        "legalParams": {
          "changed": true,
          "paramNames": [],
          "rawChanged": true,
          "rawValue": { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] },
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] }
        },
        "params": {
          "changed": true,
          "cleared": true,
          "needsLoad": true,
          "paramNames": [ "legalParams" ],
          "params": [ { "geo": [ "ch", "uk", "us" ], "product": [ "p1", "p2", "p3" ] } ],
          "rawChanged": false,
          "rawValue": { "geo": "us", "product": "p1" },
          "reason": "Async, upstream has changed",
          "upstreamChanged": [ "legalParams" ],
          "upstreamUndefined": []
        },
        "rawConfig": {
          "changed": true,
          "cleared": true,
          "needsLoad": false,
          "paramNames": [ "params" ],
          "rawChanged": false,
          "rawValue": "config1",
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "params" ]
        },
        "tests": {
          "changed": false,
          "needsLoad": false,
          "paramNames": [ "params", "config" ],
          "rawChanged": false,
          "rawValue": "sometests",
          "reason": "Upstream has undefined value",
          "upstreamChanged": [],
          "upstreamUndefined": [ "params", "config" ],
          "value": "sometests"
        }
      } )
    } )
    test ( "goodState", () => {
      const state = { params, legalParams, rawConfig, config: 'config1_parsed', tests: 'sometests' }
      expect ( calcAllStatus ( [ legalParamsD, paramsD, rawConfigD, configD, testsD ], state, state ) ).toEqual ( {
        "config": {
          "changed": false,
          "paramNames": [ "rawConfig" ],
          "rawChanged": false,
          "rawValue": "config1_parsed",
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": "config1_parsed"
        },
        "legalParams": {
          "changed": false,
          "paramNames": [],
          "rawChanged": false,
          "rawValue": { "geo": [ "us", "uk" ], "product": [ "p1", "p2" ] },
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": { "geo": [ "us", "uk" ], "product": [ "p1", "p2" ] }
        },
        "params": {
          "changed": false,
          "paramNames": [ "legalParams" ],
          "rawChanged": false,
          "rawValue": { "geo": "us", "product": "p1" },
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": { "geo": "us", "product": "p1" }
        },
        "rawConfig": {
          "changed": false,
          "paramNames": [ "params" ],
          "rawChanged": false,
          "rawValue": "config1",
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": "config1"
        },
        "tests": {
          "changed": false,
          "paramNames": [ "params", "config" ],
          "rawChanged": false,
          "rawValue": "sometests",
          "reason": "All upstreams are defined and unchanged, our value is defined",
          "upstreamChanged": [],
          "upstreamUndefined": [],
          "value": "sometests"
        }
      } )
    } )
  } )
  // describe()
} )
