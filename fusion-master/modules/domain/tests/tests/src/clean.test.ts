import { CleanFn, CleanRunTestsDefn, RunTestsDefn } from "./test.domain";
import { parseNamedUrlOrErrors, UrlListFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd, mapErrors, mapErrorsK } from "@laoban/utils";
import { schemaToTestQuery } from "./schema.to.test.mapping";


export const cleanTest = ( list: UrlListFn ): CleanFn => async ( defn: RunTestsDefn ): Promise<ErrorsAnd<CleanRunTestsDefn>> => {
  return mapErrorsK ( parseNamedUrlOrErrors ( defn.schema.input ), inpSchema =>
    mapErrorsK ( parseNamedUrlOrErrors ( defn.schema.output ), async outSchema =>
      mapErrorsK ( parseNamedUrlOrErrors ( defn.transformer ), async transformer =>
        mapErrors ( await list ( schemaToTestQuery ( inpSchema ) ), async inpTests =>
          mapErrors ( await list ( schemaToTestQuery ( outSchema ) ), async outTests =>
            ({
              schema: { input: inpSchema, output: outSchema },
              transformer,
              tests: { input: inpTests.names, output: outTests.names }
            })
          ) ) ) ) )
}