import { NameAnd } from "@laoban/utils";
import { Lenses, Optional } from "@focuson/lens";
import { calculateRoute, placeRouteInto, RoutingData } from "./routing";

type SelectionForTest = {
  path?: string,
  params?: NameAnd<string>,
  selection?: {
    key?: string
    a?: string
    b?: string
    c?: string
  }
}
const idL = Lenses.identity<SelectionForTest> ()
const selectionL = idL.focusOn ( 'selection' )
const aL = selectionL.focusOn ( 'a' )
const bL = selectionL.focusOn ( 'b' )
const cL = selectionL.focusOn ( 'c' )
const pathL = idL.focusOn ( 'path' )
const keyL = selectionL.focusOn ( 'key' )
const paramsL = idL.focusOn ( 'params' )

const opts: NameAnd<Optional<SelectionForTest, string>> = {
  a: aL,
  b: bL,
  c: cL,
  path: pathL
}
const routingData: RoutingData<SelectionForTest> = {
  optionals: opts,
  selectionO: keyL,
  parametersO: paramsL,
  templates: {
    path: '/path/{path}',
    a: '/a/{a}',
    ab: '/a/{a}/b/{b}',
    abc: '/a/{a}/b/{b}/c/{c}',
  }
}
describe ( "placeRouteInto", () => {
  it ( "placeRouteInto for a", () => {
    const path = '/a/1'
    const s = placeRouteInto ( routingData, path, {} )
    expect ( s ).toEqual ( { selection: { a: '1', "key": "a" } } )
  } )
  it ( "placeRouteInto for path", () => {
    const path = '/path/1'
    const s = placeRouteInto ( routingData, path, {} )
    expect ( s ).toEqual ( { "path": "1", "selection": { "key": "path" } } )
  } )
  it ( "placeRouteInto for a b", () => {
    const path = '/a/1/b/2'
    const s = placeRouteInto ( routingData, path, {} )
    expect ( s ).toEqual ( { selection: { a: '1', b: '2', "key": "ab" } } )
  } )
  it ( "placeRouteInto for a b c", () => {
    const path = '/a/1/b/2/c/3'
    const s = placeRouteInto ( routingData, path, {} )
    expect ( s ).toEqual ( { selection: { a: '1', b: '2', c: '3', "key": "abc" } } )
  } )
  it ("placeRouteInto for a b c with params", () => {
    const path = '/a/1/b/2/c/3?p1=v1&p2=v2'
    const s = placeRouteInto ( routingData, path, {} )
    expect ( s ).toEqual ( { selection: { a: '1', b: '2', c: '3', "key": "abc" }, params: { p1: 'v1', p2: 'v2' } } )
  })
} )

describe ( "calculateRoute", () => {
  it ( "calculateRoute for a", () => {
    const s = { selection: { a: '1', b: '2', c: '3', key: 'a' }, path: 'somePath' }
    const path = calculateRoute ( routingData, s )
    expect ( path ).toEqual ( '/a/1' )
  } )
  it ( 'calculateRoute for a with params', () => {
    const s = { selection: { a: '1', b: '2', c: '3', key: 'a' }, params: { p1: 'v1', p2: 'v2' } }
    const path = calculateRoute ( routingData, s )
    expect ( path ).toEqual ( '/a/1?p1=v1&p2=v2' )
  } )
  it ( "calculateRoute for a b", () => {
    const s = { selection: { a: '1', b: '2', c: '3', key: 'ab' }, path: 'somePath' }
    const path = calculateRoute ( routingData, s )
    expect ( path ).toEqual ( '/a/1/b/2' )
  } )
  it ( "calculateRoute for a b c", () => {
    const s = { selection: { a: '1', b: '2', c: '3', key: 'abc' }, path: 'somePath' }
    const path = calculateRoute ( routingData, s )
    expect ( path ).toEqual ( '/a/1/b/2/c/3' )
  } )
  it ( "calculateRoute for path", () => {
    const s = { selection: { a: '1', b: '2', c: '3', key: 'path' }, path: 'somePath' }
    const path = calculateRoute ( routingData, s )
    expect ( path ).toEqual ( '/path/somePath' )
  } )
} )