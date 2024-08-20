import { allGood, asyncAllGoodButUndefined, asyncUpstreamsChanged, BasicStatus, syncAllGoodButUndefined, syncUpstreamsChanged, upstreamsUndefined } from "./dependant.data.status";
import { DDF1, DDK1, DDF0 } from "./dependent.data.domain";
import { Lenses } from "@focuson/lens";
import { validateDDs } from "./dependent.data.evaluation";

type StateForCalcStatus = {
  a: number
  b: number
}

const idL = Lenses.identity<StateForCalcStatus> ()
const aL = idL.focusOn ( 'a' )
const bL = idL.focusOn ( 'b' )

const aDD: DDF0<StateForCalcStatus, number> = {
  name: 'a',
  type: 'dd0',
  target: aL,
  fn: ( old: number ) => old // aka do nothing
}
const bDD: DDF1<StateForCalcStatus, number, number> = {
  name: 'b',
  type: 'dd1',
  p1: aDD,
  target: bL,
  fn: ( old: number, p1: number ) => old + p1
}
const bKDD: DDK1<StateForCalcStatus, number, number> = {
  name: 'b',
  wait: true,
  type: 'dd1',
  p1: aDD,
  target: bL,
  fn: async ( old: number, p1: number ) => old + p1
}

const bIs3BS: BasicStatus<number> = { paramNames: [ 'a' ], upstreamUndefined: [], upstreamChanged: [], rawValue: 3, rawChanged: false }
const bIsundefinedBS: BasicStatus<number> = { paramNames: [ 'a' ], upstreamUndefined: [], upstreamChanged: [], rawValue: undefined, rawChanged: false }


describe ( "calcStatusFor", () => {
  describe ( "upstreamsUndefined", () => {
    it ( "should only match when upstream is undefined", () => {
      expect ( upstreamsUndefined ( {} ).isDefinedAt ( { upstreamUndefined: [] } as BasicStatus<any> ) ).toBe ( false )
      expect ( upstreamsUndefined ( {} ).isDefinedAt ( { upstreamUndefined: [ 'something', 'was', 'undefined' ] } as BasicStatus<any> ) ).toBe ( true )
    } )
    it ( "should clear when we have a value and upstream is undefined", () => {
      const bs = { upstreamUndefined: [ 'something', 'was', 'undefined' ], rawValue: 3, rawChanged: false } as BasicStatus<number>
      const result = upstreamsUndefined ( { clear: true } ).apply ( bs )
      expect ( result ).toEqual ( {
        "changed": true,
        "cleared": true,
        "needsLoad": false,
        "rawChanged": false,
        "rawValue": 3,
        value: undefined,
        "reason": "Upstream has undefined value",
        "upstreamUndefined": [ "something", "was", "undefined" ]
      } )
    } )
    it ( "should not clear if we dont ask for it", () => {
      const bs = { upstreamUndefined: [ 'something', 'was', 'undefined' ], rawValue: 3, rawChanged: false } as BasicStatus<number>
      const result = upstreamsUndefined ( {} ).apply ( bs )
      expect ( result ).toEqual ( { ...bs, needsLoad: false, changed: false, value: 3, reason: 'Upstream has undefined value' } )
    } )
    it ( "should clear if we ask for it", () => {
      const bs = { upstreamUndefined: [ 'something', 'was', 'undefined' ], rawValue: 3, rawChanged: false } as BasicStatus<number>
      const result = upstreamsUndefined ( { clear: true } ).apply ( bs )
      expect ( result ).toEqual ( { ...bs, needsLoad: false, changed: true, cleared: true, value: undefined, reason: 'Upstream has undefined value' } )
    } )
  } )
  describe ( "asyncUpstreamsChanged", () => {
    it ( "should only match when upstream is changed and we are waiting", () => {
      expect ( asyncUpstreamsChanged ( () => [], { wait: true } ).isDefinedAt ( { upstreamChanged: [] } as BasicStatus<any> ) ).toBe ( false )
      expect ( asyncUpstreamsChanged ( () => [], {} ).isDefinedAt ( { upstreamChanged: [] } as BasicStatus<any> ) ).toBe ( false )
      expect ( asyncUpstreamsChanged ( () => [], { wait: true } ).isDefinedAt ( { upstreamChanged: [ 'something' ] } as BasicStatus<any> ) ).toBe ( true )
      expect ( asyncUpstreamsChanged ( () => [], {} ).isDefinedAt ( { upstreamChanged: [ 'something' ] } as BasicStatus<any> ) ).toBe ( false )
    } )
    it ( "should clear when requested and  we have a value and upstream is changed", () => {
      const bs: BasicStatus<number> = { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 3 }

      expect ( asyncUpstreamsChanged ( () => [ 1 ], { wait: true, clear: true } ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], needsLoad: true, cleared: true, changed: true, value: undefined, reason: 'Async, upstream has changed' } )
      expect ( asyncUpstreamsChanged ( () => [ 1 ], { wait: true, clear: true } ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], needsLoad: true, cleared: true, changed: true, value: undefined, reason: 'Async, upstream has changed' } )
    } )
    it ( "should not clear, even if requested, if value is already undefined", () => {
      const bs: BasicStatus<number> = { ...bIsundefinedBS, upstreamChanged: [ 'something' ], rawValue: undefined }
      expect ( asyncUpstreamsChanged ( () => [ 1 ], { wait: true, clear: true } ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], needsLoad: true, cleared: false, changed: false, value: undefined, reason: 'Async, upstream has changed' } )

    } )
    it ( "should not clear if not request and  we have a value and upstream is changed", () => {
      const bs: BasicStatus<number> = { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 3 }
      expect ( asyncUpstreamsChanged ( () => [ 1 ], { wait: true, } ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], needsLoad: true, cleared: undefined, changed: false, value: 3, reason: 'Async, upstream has changed' } )
    } )
  } )
  describe ( "syncUpstreamsChanged", () => {
    it ( "should only match when upstream is changed and we are not waiting", () => {
      expect ( syncUpstreamsChanged ( () => [], bKDD ).isDefinedAt ( { upstreamChanged: [] } as BasicStatus<any> ) ).toBe ( false )
      expect ( syncUpstreamsChanged ( () => [], bDD ).isDefinedAt ( { upstreamChanged: [] } as BasicStatus<any> ) ).toBe ( false )

      expect ( syncUpstreamsChanged ( () => [], bKDD ).isDefinedAt ( { upstreamChanged: [ 'something' ] } as BasicStatus<any> ) ).toBe ( false )
      expect ( syncUpstreamsChanged ( () => [], bDD ).isDefinedAt ( { upstreamChanged: [ 'something' ] } as BasicStatus<any> ) ).toBe ( true )
    } )
    it ( "should calculate the value and set changed to true if value changed", () => {
      const bs: BasicStatus<number> = { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 999 }
      expect ( syncUpstreamsChanged ( () => [ 1 ], bDD ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], evaluated: true, changed: true, value: 999 + 1, reason: 'Sync, upstream has changed' } )
    } )
    it ( "should do nothing changed to true if value already correct", () => {
      const bs: BasicStatus<number> = { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 999 }
      expect ( syncUpstreamsChanged ( () => [ 1 ], { ...bDD, fn: ( old, p ) => old } ).apply ( { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 999 } ) ).toEqual (
        { ...bs, params: [ 1 ], evaluated: true, changed: false, value: 999, reason: 'Sync, upstream has changed' } )
    } )
  } )
  describe ( "syncAllGoodButUndefined", () => {
    it ( "should match when sync upstream ok and we are undefined", () => {
      expect ( syncAllGoodButUndefined ( () => [], bDD ).isDefinedAt ( bIsundefinedBS ) ).toBe ( true )
      expect ( syncAllGoodButUndefined ( () => [], bKDD ).isDefinedAt ( bIsundefinedBS ) ).toBe ( false )
      expect ( syncAllGoodButUndefined ( () => [], bDD ).isDefinedAt ( { ...bIsundefinedBS, upstreamUndefined: [ 'something' ] } ) ).toBe ( false )
      expect ( syncAllGoodButUndefined ( () => [], bDD ).isDefinedAt ( { ...bIsundefinedBS, upstreamChanged: [ 'something' ] } ) ).toBe ( false )
      expect ( syncAllGoodButUndefined ( () => [], bDD ).isDefinedAt ( bIs3BS ) ).toBe ( false )
    } )
    it ( "should calculate the value and set changed to true if value changed", () => {
      const bs: BasicStatus<number> = { ...bIsundefinedBS, upstreamChanged: [ 'something' ], rawValue: 999 }
      expect ( syncAllGoodButUndefined ( () => [ 1 ], bDD ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], evaluated: true, changed: true, value: 999 + 1, reason: 'Sync, all upstreams are defined and unchanged, but we are undefined so need to evaluate' } )
    } )
    it ( "should calculate the value and set changed to false if value still undefined", () => {
      const bs: BasicStatus<number> = { ...bIsundefinedBS, upstreamChanged: [ 'something' ], rawValue: undefined }
      expect ( syncAllGoodButUndefined ( () => [ 1 ], { ...bDD, fn: () => undefined } ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], evaluated: true, changed: false, value: undefined, reason: 'Sync, all upstreams are defined and unchanged, but we are undefined so need to evaluate' } )
    } )
  } )
  describe ( "asyncAllGoodButUndefined", () => {
    it ( "should match when async upstream ok and we are undefined", () => {
      expect ( asyncAllGoodButUndefined ( () => [], bKDD ).isDefinedAt ( bIsundefinedBS ) ).toBe ( true )
      expect ( asyncAllGoodButUndefined ( () => [], bDD ).isDefinedAt ( bIsundefinedBS ) ).toBe ( false )
      expect ( asyncAllGoodButUndefined ( () => [], bKDD ).isDefinedAt ( { ...bIsundefinedBS, upstreamUndefined: [ 'something' ] } ) ).toBe ( false )
      expect ( asyncAllGoodButUndefined ( () => [], bKDD ).isDefinedAt ( { ...bIsundefinedBS, upstreamChanged: [ 'something' ] } ) ).toBe ( false )
      expect ( asyncAllGoodButUndefined ( () => [], bKDD ).isDefinedAt ( bIs3BS ) ).toBe ( false )
    } )
    it ( "should not calculate the value and set changed to false if value still undefined", () => {
      const bs: BasicStatus<number> = { ...bIsundefinedBS, upstreamChanged: [ 'something' ], rawValue: undefined }
      expect ( asyncAllGoodButUndefined ( () => [ 1 ], bKDD ).apply ( bs ) ).toEqual (
        { ...bs, params: [ 1 ], needsLoad: true, changed: false, value: undefined, reason: 'Async, all upstreams are defined and unchanged, but we are undefined so need to load' } )
    } )
  } )
  describe ( "allGood", () => {
    it ( "should match if value is defined, if there are no upstream issues", () => {
      expect ( allGood ().isDefinedAt ( bIs3BS ) ).toBe ( true )
      expect ( allGood ().isDefinedAt ( bIsundefinedBS ) ).toBe ( false )
      expect ( allGood ().isDefinedAt ( { ...bIs3BS, upstreamUndefined: [ 'something' ] } ) ).toBe ( false )
      expect ( allGood ().isDefinedAt ( { ...bIs3BS, upstreamChanged: [ 'something' ] } ) ).toBe ( false )
    } )
    it ( "should return the value and set changed to false", () => {
      const bs: BasicStatus<number> = { ...bIs3BS, upstreamChanged: [ 'something' ], rawValue: 999 }
      expect ( allGood ().apply ( bs ) ).toEqual (
        { ...bs, value: 999, changed: false, reason: 'All upstreams are defined and unchanged, our value is defined' } )
    } )
  } )
} )

describe ( "validateDDs", () => {
  describe ( "no duplicates", () => {
    expect ( () => validateDDs ( [ aDD, aDD ] ) ).toThrow ( "Duplicate names: a" )
    expect ( () => validateDDs ( [ bDD, bKDD ] ) ).toThrow ( "Duplicate names: b" )
    expect ( () => validateDDs ( [ aDD, aDD, bDD, bKDD ] ) ).toThrow ( "Duplicate names: a,b" )
    validateDDs ( [ aDD, bKDD ] )
  } )
  describe ( "parents present", () => {
    expect ( () => validateDDs ( [ bDD ] ) ).toThrow ( "Param a not found for b" )
    expect ( () => validateDDs ( [ bDD, aDD ] ) ).toThrow ( "Param a not found for b" )
    validateDDs ( [ aDD, bDD ] )
  } )
} )