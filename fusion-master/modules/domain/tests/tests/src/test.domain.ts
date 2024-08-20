import { NamedUrl } from "@itsmworkbench/urlstore";
import { ErrorsAnd } from "@laoban/utils";

export type RunReqRespTests = ( defn: RunReqRespTestsDefn ) => Promise<ErrorsAnd<ReqRespTestsResult>>

export type RunReqRespTestsDefn = {
  request: RunTestsDefn
  response: RunTestsDefn
}
export type ReqRespTestsResult = {
  request: TestsResult
  response: TestsResult
}

export type RunTests = ( defn: RunTestsDefn ) => Promise<ErrorsAnd<TestsResult>>

export type CleanFn = ( defn: RunTestsDefn ) => Promise<ErrorsAnd<CleanRunTestsDefn>>

export type RunTestsDefn = {
  schema: TestInOut<string>
  transformer: string
}

export type CleanRunTestsDefn = {
  schema: TestInOut<NamedUrl>
  transformer: NamedUrl
  tests: TestInOut<string[]>
}

export type TestsResult = {
  transformer: TransformerAndDesc
  inputSchema: NameAndSchema
  outputSchema: NameAndSchema
  tests: OneTestResult[]
}


export type NameAndSchema = { name: NamedUrl, schema: any }
export type TransformerAndDesc = { name: NamedUrl, transformerDesc: string }

export type NameAndValueAndSchemaResult = { name: NamedUrl, value: any, result: SchemaTestResult }
export type ValueAndTransformerResult = { value: any, result: TransformerTestResult }

export type RanTestResultName = keyof RanTestResult
export type RanTestSchemaName = 'input' | 'expectedOutput'
export type RanTestResult = {
  input?: NameAndValueAndSchemaResult
  expectedOutput?: NameAndValueAndSchemaResult
  actualOutput?: ValueAndTransformerResult
}
export function isRanTestResult ( x: any ): x is RanTestResult {
  return x && x.input && x.expectedOutput && x.actualOutput
}
export type CannotRunTestResult = {
  name: NamedUrl | undefined
  errors: string[]
}
export function isCannotRunTestResult ( x: any ): x is CannotRunTestResult {
  return x && x.errors
}
export type OneTestResult = RanTestResult | CannotRunTestResult

export type SchemaTestError = { path: string, message: string }
export type SchemaTestResult = SchemaTestError[]

export type TransformerTestResult = {
  inserts: SchemaTestResult
  deletes: SchemaTestResult
  updates: SchemaTestResult
}
export type TestInOut<T> = {
  input: T
  output: T
}
export type TestInExpectedActualOut<T> = {
  input?: T
  expectedOutput?: T
  actualOutput?: T
}


export type SchemaTransformerTestResults = {
  schema: TestInExpectedActualOut<SchemaTestResult>
  transformer?: TransformerTestResult
}

