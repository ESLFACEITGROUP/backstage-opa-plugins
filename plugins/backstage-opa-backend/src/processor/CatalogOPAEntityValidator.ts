import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import {Entity} from "@backstage/catalog-model";
import {EntityCheckerApi} from "../service/entityCheckerApi";
import { merge } from 'lodash';

const OPA_ENTITY_CHECKER_GOOD_ENTITY_ANNOTATION = "entity-checker.opa/good-entity"

export class CatalogOPAEntityValidator implements CatalogProcessor {
    constructor(
        private readonly api: EntityCheckerApi,
    ) {}

    getProcessorName(): string {
        return 'CatalogOPAEntityValidator';
    }

    async preProcessEntity(
        entity: Entity,
    ): Promise<Entity> {

        let opaResult = await this.api.checkEntity({
            entityMetadata: JSON.stringify(entity)
        })

        return merge(
          {
              metadata: {
                  annotations: {
                      [OPA_ENTITY_CHECKER_GOOD_ENTITY_ANNOTATION]: opaResult.good_entity.toString()
                  }
              }
          },
          entity
        )

    }
}
