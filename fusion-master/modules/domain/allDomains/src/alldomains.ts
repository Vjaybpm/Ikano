import { NameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit } from "@itsmworkbench/urlstore"
import { NameAnd } from "@laoban/utils"
import { schemaNs } from "@fusionconfig/schema";
import { transformNs } from "@fusionconfig/transformer";
import { YamlCapability } from "@itsmworkbench/yaml";
import { sampleNs } from "@fusionconfig/sample";

export function allDomainDetails ( yamlCapability: YamlCapability ): NameAnd<NameSpaceDetailsForGit> {
  return {
    schema: schemaNs,
    transformer: transformNs ( yamlCapability ),
    sample: sampleNs

  }
}
export function defaultOrgConfig ( baseDir: string, yamlCapability: YamlCapability ): OrganisationUrlStoreConfigForGit {
  return { baseDir, nameSpaceDetails: allDomainDetails ( yamlCapability ) }
}

