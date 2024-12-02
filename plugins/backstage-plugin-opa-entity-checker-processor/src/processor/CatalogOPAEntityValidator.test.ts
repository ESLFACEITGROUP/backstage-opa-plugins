import { Entity } from '@backstage/catalog-model';
import { CatalogOPAEntityValidator } from './CatalogOPAEntityValidator';
import { mockServices } from '@backstage/backend-test-utils';
import { OpaEntityCheckResult } from '@parsifal-m/plugin-opa-backend';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-component',
    annotations: {
      'backstage.io/location': 'https://example.com',
    },
  },
};

const logger = mockServices.logger.mock();

describe('CatalogOPAEntityValidator', () => {
  it('never fails when the Entity Checker Api errors', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn(
        (): Promise<OpaEntityCheckResult> => Promise.reject('error'),
      ),
    };
    const processor = new CatalogOPAEntityValidator(
      logger,
      mockEntityCheckerApi,
    );

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
        },
      },
    });
  });

  it('adds annotation, when entity fails validation', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn(
        (): Promise<OpaEntityCheckResult> =>
          Promise.resolve({
            result: [
              {
                id: 'metadata.tags',
                check_title: 'metadata.tags',
                level: 'error',
                message: 'You do not have any tags set!',
              },
            ],
          }),
      ),
    };

    const processor = new CatalogOPAEntityValidator(
      logger,
      mockEntityCheckerApi,
    );

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
          'open-policy-agent/entity-checker-violations-status': 'error',
        },
      },
    });
  });

  it('adds warning annotations when it is the highest level', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn(
        (): Promise<OpaEntityCheckResult> =>
          Promise.resolve({
            result: [
              {
                id: 'metadata.description',
                check_title: 'metadata.description',
                level: 'warning',
                message: 'Warning message 1',
              },
              {
                id: 'metadata.links',
                check_title: 'metadata.links',
                level: 'info',
                message: 'Info message 1',
              },
            ],
          }),
      ),
    };

    const processor = new CatalogOPAEntityValidator(
      logger,
      mockEntityCheckerApi,
    );

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
          'open-policy-agent/entity-checker-violations-status': 'warning',
        },
      },
    });
  });
});