import { UrlLoadNamedFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd } from "@laoban/utils";
import { CleanFn, SchemaTestResult, TransformerTestResult } from "./test.domain";

export type TestSchemaFn = ( schema: any, data: any ) => SchemaTestResult
export type TestDiffFn = ( expectedOutput: any, actualOutput ) => Promise<TransformerTestResult>
export type TransformerFn = ( inp: any ) => Promise<any>
export type CompileTransformerFn = ( desc: string ) => ErrorsAnd<TransformerFn>

export type TestEngine = {
  clean: CleanFn
  loadNamed: UrlLoadNamedFn
  compileTransfomer: CompileTransformerFn
  testSchema: TestSchemaFn
  testTransformer: TestDiffFn
}