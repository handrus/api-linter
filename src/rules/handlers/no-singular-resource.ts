import { OpenAPI } from "openapi-types";
import pluralize from 'pluralize';
import { RuleFault, Severity, RuleFaultContent } from "../rule-fault";

const faults = {
  noSingularResource: 'Singular word found on resource:'
};

const produceNoSingularResource = (path: string, singularResources: string[]): RuleFault => {
  return {
    value: `Path: ${path}`,
    errors: singularResources.map(resource => {
      return {
        severity: Severity.warning,
        message: `${faults.noSingularResource} ${resource}`
      } as RuleFaultContent;
    }),
  };
};

export const noSingularResource = (api: OpenAPI.Document, ruleFaults: RuleFault[]) => {
  const apiParsed: any = api;

  /**
   * There is no need for null safe checking on paths, since it is an obrigatory
   * field in the OpenAPI Object Specification 3.0
   * https://swagger.io/specification/#oasDocument
   */
  Object.entries(apiParsed.paths).forEach(([path, value]) => {
    /**
     * Gets every value inside the path and removes first empty value, e.g., '/a/b/c' turns intos ['a', 'b', 'c']
     */
    const splitPaths = path.split('/').slice(1);

    const singularResources: string[] = [];

    splitPaths.forEach(splitPath => {
      /* istanbul ignore else  */
      /**
       * If the plural of the word is not the word itself, then it is singular
       */
      if (pluralize(splitPath) !== splitPath) {
        singularResources.push(splitPath);
      }
    });

    /* istanbul ignore else  */
    if (singularResources.length) {
      ruleFaults.push(produceNoSingularResource(path, singularResources));
    }
  });
};
