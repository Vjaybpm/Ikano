import { NamedUrl, nameSpaceDetailsForGit, NameSpaceDetailsForGit, UrlQuery, writeUrl } from "@itsmworkbench/urlstore";


export function samplePathToUrlQueryRequest ( path: string ): UrlQuery {
  return {
    org: 'org',
    namespace: 'sample',
    pageQuery: { page: 1, pageSize: 1000 },
    order: 'name',
    path: path + '/request'
  }
}
export function samplePathToUrlQueryResponse ( path: string ): UrlQuery {
  return {
    org: 'org',
    namespace: 'sample',
    pageQuery: { page: 1, pageSize: 1000 },
    order: 'name',
    path: path + '/response'
  }
}

export function schemaNamedUrlAndNameToInputUrl ( namedUrl: NamedUrl, name: string ): NamedUrl {
  const result = {
    ...namedUrl,
    namespace: 'sample',
    name: namedUrl.name + '/' + name,
  }
  const url = writeUrl ( result )
  return { ...result, url }
}
export type RequestOrResponse = 'request' | 'response'

export const sampleNs: NameSpaceDetailsForGit =
               nameSpaceDetailsForGit ( 'sample', {
                 pathInGitRepo: 'schema', //not an error. we store the samples next to the schema
                 parser: async ( id: string, s: string ) => JSON.parse ( s ),
                 writer: s => JSON.stringify ( s, null, 2 ),
                 extension: 'sample.json',
               } )
