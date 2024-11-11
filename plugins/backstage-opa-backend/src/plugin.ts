import {
  coreServices,
  createBackendPlugin,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service';
import {CatalogOPAEntityValidator} from "./processor";
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import {EntityCheckerApiImpl} from "./service/entityCheckerApi";

export const opaPlugin = createBackendPlugin({
  pluginId: 'opa',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        urlReader: coreServices.urlReader,
      },
      async init({
        config,
        logger,
        httpRouter,
        auth,
        httpAuth,
        discovery,
        urlReader,
      }) {
        httpRouter.use(
          await createRouter({
            config,
            logger,
            auth,
            httpAuth,
            discovery,
            urlReader,
          }),
        );

        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

export const catalogModuleOPAValidationEntitiesProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'foobar',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ catalog, logger, config }) {

        const entityCheckerApi = new EntityCheckerApiImpl({
          logger: logger,
          opaBaseUrl: config.getOptionalString('opaClient.baseUrl'),
          entityCheckerEntrypoint: config.getOptionalString('opaClient.policies.entityChecker.entrypoint')
        })

        catalog.addProcessor(new CatalogOPAEntityValidator(entityCheckerApi, logger));
      },
    });
  },
});
