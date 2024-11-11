import {Entity} from "@backstage/catalog-model";
import {CatalogOPAEntityValidator} from "./CatalogOPAEntityValidator";
import {mockServices} from "@backstage/backend-test-utils";
import {LocationSpec} from "@backstage/plugin-catalog-common";
import {OpaResult} from "../service/entityCheckerApi";

describe('CatalogOPAEntityValidator', () => {
  it('adds annotation, when entity fails validation', async () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
    };

    const location: LocationSpec = {
      type: 'url',
      target:
        'https://example.com',
    };

    const mockLogger = mockServices.logger.mock();
    const mockEntityCheckerApi = {
      checkEntity: jest.fn((): Promise<OpaResult> => Promise.resolve(
        {
          good_entity: false,
          result: [
            {
              id: "metadata.tags",
              check_title: "metadata.tags",
              level: 'error',
              message: "You do not have any tags set!"
            }
          ]
        }
      ))
    };
    const mockCatalogProcessorEmit = jest.fn()

    const processor = new CatalogOPAEntityValidator(mockEntityCheckerApi, mockLogger)

    expect(await processor.preProcessEntity(entity, location, mockCatalogProcessorEmit)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'entity-checker.opa/good-entity': 'false',
        },
      },
    });

  })
})
