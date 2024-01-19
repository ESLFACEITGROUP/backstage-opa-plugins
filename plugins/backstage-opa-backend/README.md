![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-backend?logo=npm)

# backstage-opa-backend

This serves as the OPA Backend Plugin, eventually to route all your OPA needs through!

This plugin is still in development so please use with caution.

# Pre-requisites

The only pre-requisites to use this plugin is that you have set up an OPA server. You can find more information on how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/). And you have a Backstage instance running. More info on how to do that [here](https://backstage.io/docs/getting-started).

## Installation

```bash
yarn add @parsifal-m/plugin-opa-backend
```

Then add `opa.ts` to your packages/backend/src/plugins.ts directory with the following contents:

```ts
import { createRouter } from '@parsifal-m/plugin-opa-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

And then add the following to your `packages/backend/src/index.ts` file:

```ts
//...
import opa from './plugins/opa';

//...
const opaEnv = useHotMemoize(module, () => createEnv('opa'));

//...
apiRouter.use('/opa', await opa(opaEnv));
```

In your `app-config.yaml` file, add the following:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      package: 'entitymeta_policy'
    rbac: # Permission wrapper plugin
      package: 'rbac_policy'
```

This plugin currently works together with the [opa-entity-checker](../backstage-opa-entity-checker/README.md) and the [opa-permissions-wrapper](../../packages/backstage-opa-permissions-wrapper/README.md) plugin(s).

# Note!

The `package` name in the `app-config.yaml` file should match the `package` name in the `rego` file. You can find some working example of policies to use with this plugin [here](https://github.com/Parsifal-M/backstage-opa-policies) or in [here](../../example-opa-policies/README.md)

## Contributing

I am happy to accept contributions to this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal)

## License

This project is released under the Apache 2.0 License.