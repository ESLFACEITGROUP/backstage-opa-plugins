import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import {Entity} from "@backstage/catalog-model";
import { LocationSpec } from '@backstage/plugin-catalog-common'
import {EntityCheckerApi} from "../service/entityCheckerApi";
import {LoggerService} from "@backstage/backend-plugin-api";


export class CatalogOPAEntityValidator implements CatalogProcessor {
    constructor(
        private readonly api: EntityCheckerApi,
        private readonly logger: LoggerService
    ) {}

    getProcessorName(): string {
        return 'CatalogOPAEntityValidator';
    }

    async preProcessEntity(
        entity: Entity,
        location: LocationSpec,
        emit: CatalogProcessorEmit,
    ): Promise<Entity> {

        await this.api.checkEntity({
            entityMetadata: JSON.stringify(entity)
        }).then(data => {
            this.logger.debug(JSON.stringify(data))

            if (data.result) {
                data.result.forEach((e) => {
                    emit(processingResult.inputError(location, e.message.toString()))
                })
            }
        })

        return entity;
    }
}