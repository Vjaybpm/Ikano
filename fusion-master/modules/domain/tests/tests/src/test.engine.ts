import { ErrorsAnd, hasErrors, mapErrors, mapErrorsK, mapK } from "@laoban/utils";
import { TestEngine, TransformerFn } from "./test.engine.domain";
import { OneTestResult, RanTestResult, ReqRespTestsResult, RunReqRespTests, RunReqRespTestsDefn, RunTestsDefn, SchemaTestResult, TestInExpectedActualOut, TestInOut, SchemaTransformerTestResults, TestsResult, TransformerTestResult } from "./test.domain";
import { NamedUrl, UrlLoadNamedFn } from "@itsmworkbench/urlstore";
import { schemaNameToTestName } from "./schema.to.test.mapping";
import { NamedLoadResult } from "@itsmworkbench/urlstore/dist/src/url.load.and.store";

export type TransformerDescAndTx = { transformerDesc: string, tx: TransformerFn }

export async function makeTransformer ( engine: TestEngine, transformer: NamedUrl ): Promise<ErrorsAnd<TransformerDescAndTx>> {
  return mapErrorsK ( await engine.loadNamed<string> ( transformer ),
    async transformerDesc =>
      mapErrors ( await engine.compileTransfomer ( (transformerDesc.result as any).jsonata ),
        tx => ({ transformerDesc: transformerDesc.result, tx }) ) )
}

export type SchemasAndTransformer = TransformerDescAndTx & {
  schemaNames: TestInOut<NamedUrl>
  schemas: TestInOut<any>
}
export async function loadSchemasAndTransformer ( engine: TestEngine, schemaNames: TestInOut<NamedUrl>, transformer: NamedUrl ): Promise<ErrorsAnd<SchemasAndTransformer>> {
  return mapErrorsK ( await engine.loadNamed ( schemaNames.input ), async input =>
    mapErrorsK ( await engine.loadNamed ( schemaNames.output ), async output =>
      mapErrors ( await makeTransformer ( engine, transformer ), transformerDescAndTx =>
        ({ schemaNames: schemaNames, schemas: { input: input.result, output: output.result }, ...transformerDescAndTx }) ) ) )
}


export const loadTestValue = async <T> ( ln: UrlLoadNamedFn, n: NamedUrl | undefined ): Promise<ErrorsAnd<NamedLoadResult<T>>> =>
  n === undefined ? undefined : ln ( n );

export async function loadTestValues ( engine: TestEngine, tx: TransformerFn, inpTestName: NamedUrl | undefined, outTestName: NamedUrl | undefined ): Promise<ErrorsAnd<TestInExpectedActualOut<any>>> {
  return mapErrorsK ( await loadTestValue ( engine.loadNamed, inpTestName ),
    async inp => mapErrorsK ( await loadTestValue ( engine.loadNamed, outTestName ),
      async out => {
        const actualOutput = inp === undefined ? undefined : await tx ( inp.result )
        let namedLoadResult: TestInExpectedActualOut<any> = { input: inp?.result, expectedOutput: out?.result, actualOutput };
        return namedLoadResult;
      } ) )

}
export async function valuesToTestResults ( engine: TestEngine, schemas: TestInOut<any>, values: TestInExpectedActualOut<any> ): Promise<SchemaTransformerTestResults> {
  const schemaResults: TestInExpectedActualOut<SchemaTestResult> = {
    input: values.input === undefined ? undefined : engine.testSchema ( schemas.input, values.input ),
    actualOutput: values.actualOutput === undefined ? undefined : engine.testSchema ( schemas.output, values.actualOutput ),
    expectedOutput: values.expectedOutput === undefined ? undefined : engine.testSchema ( schemas.output, values.expectedOutput )
  }
  const transformerResults: TransformerTestResult = (values.expectedOutput !== undefined && values.actualOutput !== undefined) ?
    await engine.testTransformer ( values.expectedOutput, values.actualOutput ) :
    undefined
  return { schema: schemaResults, transformer: transformerResults }
}

async function runOneTest ( engine: TestEngine, schemasAndTx: SchemasAndTransformer, test: MergedTest ): Promise<OneTestResult> {
  const inpTestName: NamedUrl | undefined = schemaNameToTestName ( schemasAndTx.schemaNames.input, test.input )
  const outTestName: NamedUrl | undefined = schemaNameToTestName ( schemasAndTx.schemaNames.output, test.output )

  let result = await mapErrorsK ( await loadTestValues ( engine, schemasAndTx.tx, inpTestName, outTestName ),
    async values => mapErrors ( await valuesToTestResults ( engine, schemasAndTx.schemas, values ),
      results => {
        let ran: RanTestResult = {
          input: { name: inpTestName, value: values.input, result: results.schema.input },
          expectedOutput: { name: outTestName, value: values.expectedOutput, result: results.schema.expectedOutput },
          actualOutput: { value: values.actualOutput, result: results.transformer }
        };
        return ran
      }
    ) )
  if ( hasErrors ( result ) ) return {name: inpTestName|| outTestName, errors: result }
  return result
}
export type MergedTest = {
  input?: string
  output?: string
}
export const mergeTests = ( test: TestInOut<string[]> ): MergedTest[] => {
  const all = [ ...new Set ( [ ...test.input, ...test.output ] ) ].sort ()
  return all.map ( t => ({ input: test.input.includes ( t ) ? t : undefined, output: test.output.includes ( t ) ? t : undefined }) )
}

export const runTestsUsingEngine = ( engine: TestEngine ) =>
  async ( defn: RunTestsDefn ): Promise<ErrorsAnd<TestsResult>> =>
    mapErrorsK ( await engine.clean ( defn ), async ( { schema, transformer, tests } ) => {
      return mapErrorsK ( await loadSchemasAndTransformer ( engine, schema, transformer ),
        async ( schemasAndTransformer ) => {
          const mergedTests = mergeTests ( tests )
          const testResults: OneTestResult[] = await mapK ( mergedTests, async test => runOneTest ( engine, schemasAndTransformer, test ) )
          let testResult: TestsResult = {
            transformer: { name: transformer, transformerDesc: schemasAndTransformer.transformerDesc },
            inputSchema: { name: schema.input, schema: schemasAndTransformer.schemas.input },
            outputSchema: { name: schema.output, schema: schemasAndTransformer.schemas.output },
            tests: testResults
          };
          return testResult
        } )
    } )

export const runReqRespTestsUsingEngine = ( engine: TestEngine ): RunReqRespTests =>
  async ( defn: RunReqRespTestsDefn ): Promise<ErrorsAnd<ReqRespTestsResult>> =>
    mapErrorsK ( await runTestsUsingEngine ( engine ) ( defn.request ), async request =>
      mapErrors ( await runTestsUsingEngine ( engine ) ( defn.response ), response =>
        ({ request, response }) ) )

