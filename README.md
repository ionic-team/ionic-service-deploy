# Ionic Deploy Service Module

Apply non-binary changes to your app without the need to submit to app stores.
Check out our [docs](http://docs.ionic.io/v1.0/docs/deploy-overview) for more detailed information.

## Installation

Using the latest [Ionic CLI](https://github.com/driftyco/ionic-cli):

1.  Run `ionic add ionic-service-core`
2.  Run `ionic add ionic-service-deploy`
3.  Run `ionic plugin add ionic-plugin-deploy`

## Example Usage

```javascript

Ionic.io(); // Initialize the Ionic Platform

// Initialize the Deploy Service
var deploy = Ionic.Deploy();

deploy.check().then(null, null, function(hasUpdate) {
  deploy.update();
});
```

## Building

1. Install Dependencies `npm install`
2. Run `gulp build`

## Development

You can run `gulp watch` to continously build changes.

