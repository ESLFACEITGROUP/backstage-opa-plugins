import express from 'express';
import Router from 'express-promise-router';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter'
import { Config } from '@backstage/config';
import { readPolicyFile } from '../lib/read';
import {EntityCheckerApiImpl} from "./entityCheckerApi";

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader } = options;

  const router = Router();
  router.use(express.json());

  const entityCheckerApi = new EntityCheckerApiImpl({
    logger: logger,
    opaBaseUrl: config.getOptionalString('opaClient.baseUrl'),
    entityCheckerEntrypoint: config.getOptionalString('opaClient.policies.entityChecker.entrypoint')
  })

  router.get('/health', (_, resp) => {
    resp.json({ status: 'ok' });
  });

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input;

    entityCheckerApi.checkEntity(entityMetadata).then(data => {
      return res.json(data)
    }).catch(err => {
      logger.error(
          'An error occurred trying to send entity metadata to OPA:',
          err,
      );
      return next(err);
    })
  });

  router.get('/get-policy', async (req, res, next) => {
    const opaPolicy = req.query.opaPolicy as string;

    if (!opaPolicy) {
      logger.error(
        'No OPA policy provided!, please check the open-policy-agent/policy annotation and provide a URL to the policy file',
      );
      throw new Error(
        'No OPA policy provided!, please check the open-policy-agent/policy annotation and provide a URL to the policy file',
      );
    }

    try {
      // Fetch the content of the policy file
      logger.debug(`Fetching policy file from ${opaPolicy}`);
      const policyContent = await readPolicyFile(urlReader, opaPolicy);

      return res.json({ policyContent });
    } catch (error) {
      logger.error('An error occurred trying to fetch the policy file:', error);
      return next(error);
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}
