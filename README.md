## a `code-skeleton` config for code4rena usage

```shell
> npm i -D --save-exact @code4rena/skeleton
> npm pkg set skeleton.module=@code4rena/skeleton
> npx code-skeleton apply
```

## Configuration & Usage

### CI
In your projects `package.json` you can set custom CI variables to extend the default workflow. The following configuration will add a Postgres service to the test job, as well as inject the `DOTENV_KEY` environment variables for dotenv vault usage.

```
  "skeleton": {
    "variables": {
      "ci": {
        "postgres": true,
        "env_vault": true
      }
    }
  },
```

#### Postgres Container
When enabled, you will need to set the following repository variables in your github repos action variables (`{repo}/settings/variables/actions`):
* POSTGRES_DB
* POSTGRES_PASSWORD
* POSTGRES_PORT
* POSTGRES_USER

#### Dotenv Vault
When enabled, in addition to a commited .env.vault file, you will need to set the `DOTENV_KEY` environment secret for the desired .env file from your .env.keys file. Set this as a repository secret at `{repo}/settings/secrets/actions` on github.