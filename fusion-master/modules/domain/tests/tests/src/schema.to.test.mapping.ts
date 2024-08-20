import { NamedUrl, UrlQuery } from "@itsmworkbench/urlstore";

export const schemaToTestQuery = ( schema: NamedUrl) => {
  const query: UrlQuery = {
    org: schema.organisation,
    namespace: 'sample',
    pageQuery: { page: 1, pageSize: 100 },
    order: 'name',
    path: schema.name
  }
  return query;
};

export const schemaNameToTestName =  ( schemaName: NamedUrl, test: string | undefined ): NamedUrl | undefined => {
  if ( test === undefined ) return undefined;
  return { scheme: 'itsm', organisation: schemaName.organisation, namespace: 'sample', name: schemaName.name + '/' + test }
};