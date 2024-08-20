import { NamedUrl } from "@itsmworkbench/urlstore";

export interface Transform {
  inputSchema: NamedUrl
  outputSchema: NamedUrl
  transform: ( input: any ) => any
  inputNames: string[]
  inputValue: ( inputName: string ) => Promise<any>
  outputNames: string[]
  outputValue: ( outputName: string ) => Promise<any>
}

//I think I messed up in the transformation story
//I focused on task and service and not on schemas
//There is a relationship between the schemas and the task and service but it varies with time and other axes of complexity

//Schemas are defined by NamedUrls. We can find the precise id of course.
//At any moment of time... assuming that the tests pass... then we can turn names => ids and lock everything down

//Schemas have long names.
//And it's the cross product of the schemas that we are interested in.

//I think that 'where it is stored' shouldn't matter. It's too complex to work out that way. People can
//put it 'somewhere sensible'

//So we need a file that defines the template
//In it we have from and to in schemas the form of the named urls.
// perhaps we also have descriptions so that people can understand what's going on when they look at the file

// In the same directory there will be one and only one .jsonata file
//plus input.#.json and output.#.json files. The # the number of the test.

//Steps:
// Load all the files
// Put in NameAnd<NameAnd<Tx>> structure. So given from schema name and to schema name we can get the transformer
//Given a service => schema, given a task => schema. Now we can get the transformer.
//Actually that's quite trivial I think


