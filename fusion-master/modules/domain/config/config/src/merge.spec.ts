import { merge, mergeArrayInto, Merged, MergeInput, mergeObjectInto } from "./merge";
import { jsYaml } from "@itsmworkbench/jsyaml";

describe ( 'mergeObjectInto', () => {
  it ( 'merges two objects with distinct keys', () => {
    const acc: Merged = {
      value: {
        a: { value: 1, files: [ 'file1' ] },
        b: { value: 2, files: [ 'file2' ] }
      },
      files: [ 'filex' ]
    }
    const input: MergeInput = { file: 'file3', yaml: { c: 3 } }
    const result = mergeObjectInto ( acc, input )
    expect ( result ).toEqual ( {
      "files": [ "filex", "file3" ],
      "value": {
        "a": { "files": [ "file1" ], value: 1 },
        "b": { "files": [ "file2" ], value: 2 },
        "c": {
          "files": [ "file3" ],
          "value": 3
        }
      }
    } )
  } )
  it ( 'merges two objects with overlapping keys', () => {
    const acc: Merged = {
      value: {
        a: { value: 1, files: [ 'file1' ] },
        b: { value: 2, files: [ 'file2' ] }
      },
      files: [ 'filex' ]
    }
    const input: MergeInput = { file: 'file3', yaml: { b: 3 } }
    const result = mergeObjectInto ( acc, input )
    expect ( result ).toEqual ( {
      "files": [ "filex", "file3" ],
      "value": {
        "a": { "files": [ "file1" ], value: 1 },
        "b": { "files": [ "file2", "file3" ], value: 3 }
      }
    } )
  } )
} )

describe ( "mergeArrayInto", () => {
  it ( "merges an array with an array", () => {
    const acc: Merged = {
      value: [ { value: 1, files: [ 'one' ] }, { value: 2, files: [ 'two' ] } ],
      files: [ "filex" ]
    }
    const input: MergeInput = { file: "file2", yaml: [ 3, 4 ] }
    const result = mergeArrayInto ( acc, input )
    expect ( result ).toEqual ( {
      "files": [ "filex", "file2" ],
      "value": [
        { "files": [ "one" ], "value": 1 },
        { "files": [ "two" ], "value": 2 },
        { "files": [ "file2" ], "value": 3 },
        { "files": [ "file2" ], "value": 4 }
      ]
    } )
  } )

  it ( "merges an array with a primitive", () => {
    const acc: Merged = {
      value: [ { value: 1, files: [ 'one' ] }, { value: 2, files: [ 'two' ] } ],
      files: [ "filex" ]
    }
    const input: MergeInput = { file: "file2", yaml: 3 }
    const result = merge ( acc, input )
    expect ( result ).toEqual (
      { "files": [ "filex", "file2" ], "value": 3 } )
  } )
  //write a test to merge the following yaml
  // parameters:
  //   product:
  //     legal:
  //       - instantLoan
  //       - mortgage
  //       - creditCard
  //       - carLoan
  //   geo:
  //     legal:
  //       - uk
  //       - sw
  //       - ca
  //   channel:
  //     legal:
  //       - customerPortal
  //       - merchantPortal
  //       - selfServicePortal

  // with the following yaml
  // parameters:
  //   product:
  //     legal:
  //       - creditCard
  //       - carLoan
  //   geo:
  //     legal:
  //       - uk
  //       - ca
  //   channel:
  //     legal:
  //       - customerPortal
  //       - merchantPortal

  it ( "merges two objects with overlapping keys", () => {
    let product: Merged = {
      value: {
        legal: {
          value: [
            { "value": "instantLoan", files: [ 'il' ] },
            { "value": "mortgage", files: [ 'mt' ] },
            { "value": "creditCard", files: [ 'cc' ] } ],
          files: [ "file1" ]
        }
      },
      files: [ 'product' ]
    };
    let geo: Merged = {
      value: {
        legal: {
          value: [
            { "value": "uk", files: [ 'uk' ] },
            { "value": "sw", files: [ 'sw' ] },
            { "value": "ca", files: [ 'ca' ] } ],
          files: [ "file2-legal" ]
        },
      },
      files: [ "geo" ]
    };
    let channel: Merged = {
      value: {
        legal: {
          value: [
            { "value": "customerPortal", files: [ 'cp' ] },
            { "value": "merchantPortal", files: [ 'mp' ] },
            { "value": "selfServicePortal", files: [ 'ssp' ] } ],
          files: [ "file3-legal" ]
        }
      },
      files: [ "file3" ]
    };
    const acc: Merged = {
      value: {
        product: product,
        geo: geo,
        channel: channel
      },
      files: [ "filex" ]
    }
    const input: MergeInput = {
      file: "file4",
      yaml: {
        product: { legal: [ "creditCard", "carLoan" ] },
        geo: { legal: [ "uk", "us" ] },
        channel: { legal: [ "customerPortal", "merchantPortal" ] }
      }
    }
    const result = mergeObjectInto ( acc, input )
    expect ( result ).toEqual ( {
      "files": [ "filex", "file4" ],
      "value": {
        "channel": {
          "files": [ "file3", "file4" ],
          "value": {
            "legal": {
              "files": [ "file3-legal", "file4" ],
              "value": [ {
                "files": [ "cp", "file4" ],
                "value": "customerPortal"
              }, {
                "files": [ "mp", "file4" ],
                "value": "merchantPortal"
              }, {
                "files": [ "ssp" ],
                "value": "selfServicePortal"
              }
              ]
            }
          }
        },
        "geo": {
          "files": [
            "geo",
            "file4"
          ],
          "value": {
            "legal": {
              "files": [ "file2-legal", "file4" ],
              "value": [
                { "files": [ "ca" ], "value": "ca" },
                { "files": [ "sw" ], "value": "sw" },
                { "files": [ "uk", "file4" ], "value": "uk" },
                { "files": [ "file4" ], "value": "us" }
              ]
            }
          }
        },
        "product": {
          "files": [ "product", "file4" ],
          "value": {
            "legal": {
              "files": [ "file1", "file4" ],
              "value": [
                { "files": [ "file4" ], "value": "carLoan" },
                { "files": [ "cc", "file4" ], "value": "creditCard" },
                { "files": [ "il" ], "value": "instantLoan" },
                { "files": [ "mt" ], "value": "mortgage" }
              ]
            }
          }
        }
      }
    } )
  } )

  describe ( "arrays of objects", () => {
    it ( "should an arrays of objects into undefined", () => {
      const data = jsYaml ().parser (
        `transformations:
  - fromSchema: "http://schemas.mycompany.com/carLoanForAml.schema.json"
    toSchema: "https://schemas.mycompany.com/experian/creditScore/request/v2/creditScoreRequest.avsc"
    transformation: "transformations/request_carloan_experian_aml/request_carloan_experian_aml.jsonata"

  - fromSchema: "http://schemas.mycompany.com/carLoanForAml.schema.json"
    toSchema: "https://schemas.mycompany.com/internal/pricing/request/v3/carloanspricingRequest.avsc"
    transformation: "transformations/request_internal_carloan_PricingService/request_internal_carloan_PricingService.jsonata"` )
      console.log(jsYaml().parser(data))
      expect ( merge ( undefined, { file: 'file1', yaml: data } ) ).toEqual ( {
        "files": [
          "file1"
        ],
        "value": {
          "transformations": {
            "files": [
              "file1"
            ],
            "value": [
              {
                "files": [
                  "file1"
                ],
                "value": {
                  "fromSchema": {
                    "files": [
                      "file1"
                    ],
                    "value": "http://schemas.mycompany.com/carLoanForAml.schema.json"
                  },
                  "toSchema": {
                    "files": [
                      "file1"
                    ],
                    "value": "https://schemas.mycompany.com/experian/creditScore/request/v2/creditScoreRequest.avsc"
                  },
                  "transformation": {
                    "files": [
                      "file1"
                    ],
                    "value": "transformations/request_carloan_experian_aml/request_carloan_experian_aml.jsonata"
                  }
                }
              },
              {
                "files": [
                  "file1"
                ],
                "value": {
                  "fromSchema": {
                    "files": [
                      "file1"
                    ],
                    "value": "http://schemas.mycompany.com/carLoanForAml.schema.json"
                  },
                  "toSchema": {
                    "files": [
                      "file1"
                    ],
                    "value": "https://schemas.mycompany.com/internal/pricing/request/v3/carloanspricingRequest.avsc"
                  },
                  "transformation": {
                    "files": [
                      "file1"
                    ],
                    "value": "transformations/request_internal_carloan_PricingService/request_internal_carloan_PricingService.jsonata"
                  }
                }
              }
            ]
          }
        }
      } )
    } )
  } )
} )


