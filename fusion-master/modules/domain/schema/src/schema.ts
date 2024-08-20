import { NameSpaceDetails, NameSpaceDetailsForGit, nameSpaceDetailsForGit, UrlQuery } from "@itsmworkbench/urlstore";

export function schemaPathRequestToNamedUrl ( schema: string ): string {
  return `itsm/org/schema/${schema}/request`
}

export function schemaPathRequestToUrlQuery ( schema: string ): UrlQuery {
  return {
    namespace: 'schema', org: 'org',
    pageQuery: { page: 1, pageSize: 100 },
    order: 'name', path: schema
  }

}
export function schemaPathResponseToNamedUrl ( schema: string ): string {
  return `itsm/org/schema/${schema}/response`
}

export const schemaNs: NameSpaceDetailsForGit =
               nameSpaceDetailsForGit ( 'schema', {
                 parser: async ( id: string, s: string ) => JSON.parse ( s ),
                 writer: ( s: string ) => s + "_written",
                 mimeType: 'application/json',
                 extension: 'json',
               } )