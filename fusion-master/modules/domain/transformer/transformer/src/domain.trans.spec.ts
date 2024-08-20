import { Trans, validateTrans } from "./domain.transform";

describe ( "validateTrans", () => {
  it ( "should return [] if valid", () => {
    const validTrans: Trans = {
      version: 1,
      type: 'jsonata',
      from: 'A',
      to: 'B',
      jsonata: '$'
    }
    expect ( validateTrans ( 'context', validTrans ) ).toEqual ( [] )
  } )
  it ( "should return many errors if not right", () => {
    const invalidTrans: any = {}
    expect ( validateTrans ( 'context', invalidTrans ) ).toEqual ( [
      "context: Property 'from' is not a string.",
      "context: Property 'to' is not a string.",
      "context: Property 'type' is not a string.",
      "context: Property 'type' is not equal to jsonata.",
      "context: Property 'version' is not equal to 1."
    ])
  } )
} )
