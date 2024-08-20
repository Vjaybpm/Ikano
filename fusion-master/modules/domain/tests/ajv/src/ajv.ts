import Ajv from "ajv"
import { TestSchemaFn } from "@fusionconfig/tests";

const ajv = new Ajv ( { allErrors: true } )
export const ajvTest: TestSchemaFn = ( schema: any, data: any ) => {
  const validate = ajv.compile ( schema )
  const valid = validate ( data )
  return valid ? [] : validate.errors.map ( e =>
    ({ path: e.instancePath, message: e.message }) )
}