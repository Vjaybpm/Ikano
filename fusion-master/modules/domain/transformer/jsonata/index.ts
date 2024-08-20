import jsonata from "jsonata";

export function jsonataTransformer ( j: string ): ( inp: any ) => Promise<any> {
  const expression = jsonata ( j );
  return async ( inp: any ) => await expression.evaluate ( inp );
}
