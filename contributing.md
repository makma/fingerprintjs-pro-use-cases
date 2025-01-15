# Contributing to Fingerprint Pro use cases

The `main` branch is locked for the push action. For proposing changes, use the standard [pull request approach](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). It's recommended to discuss fixes or new functionality in the Issues, first.

## Working with code

We prefer using [yarn](https://yarnpkg.com/) for installing dependencies and running scripts.

* Run `yarn install` to install dependencies.
* Run `yarn dev` to start the local development server.
* Run `yarn build` to build a production build of the project.
* Run `yarn start` to start the production build of the project.
* Run `yarn lint` to check the code style using [ESLint](https://eslint.org/).

See the [package.json](./package.json) -> `scripts` section for more useful commands.

## Testing

* Run `yarn test` to run unit tests using [Vitest](https://vitest.dev/).
* To run end-to-end tests using [Playwright](https://playwright.dev/):
  *  First run `yarn dev` or `yarn start` to start the development or production server. 
  *  Then run `yarn test:e2e:chrome` to run the tests in Chrome.

### Deployment

- Merging a PR into `main` automatically triggers a new deployment accessible on [demo.fingerprint.com](https://demo.fingerprint.com).
- The app is deployed as a Digital Ocean App.
- The app is deployed behind a CloudFront distribution in the Fingerprint DEV AWS environment (search for `demo.fingerprint.com` in the distribution description).
  - If you ever encounter caching issues, for example, a cached index.html pointing to no longer existing resources, you can fix it by [creating a cache invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation_Requests.html#invalidating-objects-console) (`/*` is fine) in the CloudFront distribution.

### Rollbacks and incident response

If an incident occurs, any member of the Fingerprint team on Digital Ocean can rollback the app to the previous version. In case of any problems, please contact @JuroUhlar and the Integrations team.

1. Go to the [Digital Ocean control panel](https://cloud.digitalocean.com/apps).
2. Find the `fingerprint-use-cases` app.
3. Click on the `Activity` tab.
4. Find a previous working version and click `Rollback`.

