angular.module('ionic.service.deploy', ['ionic.service.core'])

// Check after 5 seconds on initial load
.constant('INITIAL_DELAY', 1 * 5 * 1000)

// Watch every minute
.constant('WATCH_INTERVAL', 1 * 60 * 1000)

.factory('$ionicGetAppId', [
    '$ionicCoreSettings',
    '$ionicApp',
  function ($ionicCoreSettings, $ionicApp) {
    return function getAppId() {
      if ($ionicCoreSettings.get('app_id')) {
        return $ionicCoreSettings.get('app_id')
      } else if ($ionicApp.getApp().app_id) {
        return $ionicApp.getApp().app_id
      } else {
        throw new Error("No ionic app_id found! Please set it via $ionicAppProvider.identify()");
      }
    }
  }])

/**
 * @ngdoc service
 * @name $ionicDeploy
 * @module ionic.services.deploy
 * @description
 *
 * A simple way to push updates to your app.
 *
 * Initialize the service with your app id before calling other functions.
 * Then, use the check, download, extract and load functions to update and/or load
 * the updated version of your app.
 *
 * @usage
 * ```javascript
 *
 * $ionicDeploy.watch().then(function(){}, function(){}, function(hasUpdate) {
 *   // called whenever there is a new version.
 *   // Show a prompt to the user asking them to update or not
 *   // If they choose to update, call $ionicDeploy.update();
 * });
 *
 * $ionicDeploy.unwatch() to stop watching for updates.
 *
 *
 * Full-manual mode to check/download/extract and update:
 *
 * // Check for updates
 * $ionicDeploy.check().then(function(response) {
 *    // response will be true/false
 *    if (response) {
 *        // Download the updates
 *        $ionicDeploy.download().then(function() {
 *            // Extract the updates
 *            $ionicDeploy.extract().then(function() {
 *                // Load the updated version
 *                $ionicTrack.load();
 *            }, function(error) {
 *                // Error extracting
 *            }, function(progress) {
 *                // Do something with the zip extraction progress
 *                $scope.extraction_progress = progress;
 *            });
 *        }, function(error) {
 *            // Error downloading the updates
 *        }, function(progress) {
 *            // Do something with the download progress
 *            $scope.download_progress = progress;
 *        });
 *    }
 * }, function(error) {
 *    // Error checking for updates
 * })
 * ```
 */
.factory('$ionicDeploy', [
    '$q',
    '$timeout',
    '$rootScope',
    '$ionicApp',
    '$ionicCoreSettings',
    'WATCH_INTERVAL',
    'INITIAL_DELAY',
    '$ionicGetAppId',
  function($q, $timeout, $rootScope, $ionicApp, $ionicCoreSettings, WATCH_INTERVAL, INITIAL_DELAY, $ionicGetAppId) {

    return {

      channel_tag: 'production',

      /**
       * Watch constantly checks for updates, and triggers an
       * event when one is ready.
       */
      watch: function(options) {
        var deferred = $q.defer();

        var opts = angular.extend({
          initialDelay: INITIAL_DELAY,
          interval: WATCH_INTERVAL
        }, options);

        function checkForUpdates() {
          this.check().then(function(hasUpdate) {
            if(hasUpdate) {
              $rootScope.$emit('$ionicDeploy:updateAvailable');
            }
            // Notify
            deferred.notify(hasUpdate);
          }, function(err) {
            console.warn('$ionicDeploy: Unable to check for Ionic Deploy updates', err);
          });

          // Check our timeout to make sure it wasn't cleared while we were waiting
          // for a server response
          if(this.checkTimeout) {
            this.checkTimeout = setTimeout(checkForUpdates.bind(this), opts.interval);
          }
        }

        // Check after an initial short deplay
        this.checkTimeout = setTimeout(checkForUpdates.bind(this), opts.initialDelay);

        return deferred.promise;
      },

      /**
       * Stop watching for updates.
       */
      unwatch: function() {
        clearTimeout(this.checkTimeout);
        this.checkTimeout = null;
      },

      /**
       * Check the deploy server for new versions (if any)
       */
      check: function() {
        var deferred = $q.defer();

        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.check($ionicGetAppId(), this.channel_tag, function(result) {
            console.log("DEBUG DEPLOY: " + result);
            if(result && result === "true") {
              deferred.resolve(true);
            } else {
              deferred.resolve(false);
            }
          }, function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.reject("Plugin not loaded");
        }

        return deferred.promise;
      },

      /**
       * Download the new verison.
       * See update() below for a version that does this for you
       */
      download: function() {
        var deferred = $q.defer();

        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.download($ionicGetAppId(), function(result) {
            if (result !== 'true' && result !== 'false') {
              deferred.notify(result);
            } else {
              deferred.resolve(result === 'true');
            }
          }, function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.reject("Plugin not loaded");
        }

        return deferred.promise;
      },

      /**
       * Extract the new version.
       * See update() below for a version that does this for you
       */
      extract: function() {
        var deferred = $q.defer();

        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.extract($ionicGetAppId(), function(result) {
            if (result !== 'done') {
              deferred.notify(result);
            } else {
              deferred.resolve(result);
            }
          }, function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.reject("Plugin not loaded");
        }

        return deferred.promise;
      },

      /**
       * Load the saved version of our app.
       */
      load: function() {
        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.redirect($ionicGetAppId());
        }
      },

      /**
       * Initialize the app
       */
      initialize: function(app_id) {
        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.initialize(app_id);
        }
      },

      /**
       * Set the deploy channel
       */
      setChannel: function(channel_tag) {
        this.channel_tag = channel_tag;
      },

      /**
       * Fetch info about the current deploy
       */
      info: function() {
        var deferred = $q.defer();

        if (typeof IonicDeploy != "undefined") {
          IonicDeploy.info($ionicGetAppId(), function(result) {
            deferred.resolve(result);
          }, function(err) {
            deferred.reject(err);
          });
        } else {
          deferred.reject("IonicDeploy plugin not loaded");
        }

        return deferred.promise;
      },

      /**
       * This is an all-in-one function that's meant to do all of the update steps
       * in one shot.
       * NB: I think that the way to handle progress is to divide the provided progress result
       *     of each part by two (download and extract) and report that value.
       */
      update: function() {
        var deferred = $q.defer();

        if (typeof IonicDeploy != "undefined") {
          var appId = $ionicGetAppId()
          // Check for updates
          IonicDeploy.check(appId, this.channel_tag, function(result) {
            if (result === 'true') {
              // There are updates, download them
              var downloadProgress = 0;
              IonicDeploy.download(appId, function(result) {
                if (result !== 'true' && result !== 'false') {
                  // Download is only half of the reported progress
                  downloadProgress = (result / 2);
                  deferred.notify(downloadProgress);
                } else {
                  // Download complete, now extract
                  console.log("Download complete");
                  IonicDeploy.extract(appId, function(result) {
                    if (result !== 'done') {
                      // Extract is only half of the reported progress
                      var progress = downloadProgress + (result / 2);
                      deferred.notify(progress);
                    } else {
                      console.log("Extract complete");
                      // Extraction complete, now redirect
                      IonicDeploy.redirect(appId);
                    }
                  }, function(error) {
                    // Error extracting updates
                    deferred.reject(error);
                  });
                }
              }, function(error) {
                // Error downloading updates
                deferred.reject(error);
              });
            } else {
              // There are no updates, redirect
              IonicDeploy.redirect(appId);
            }
          }, function(error) {
            // Error checking for updates
            deferred.reject(error);
          });
        } else {
          deferred.reject("Plugin not loaded");
        }

        return deferred.promise;
      }
    }
}])

.run(['$ionicApp', '$ionicCoreSettings', '$ionicGetAppId', function($ionicApp, $ionicCoreSettings, $ionicGetAppId) {

  document.addEventListener("deviceready", onDeviceReady, false);

  function onDeviceReady() {
    console.log("Ionic Deploy: Init");
    if (typeof IonicDeploy != "undefined") {
      if (ionic.Platform.isAndroid()) {
        IonicDeploy.init($ionicGetAppId())
      } else {
        IonicDeploy.redirect($ionicGetAppId())
      }
    }
  };
}]);
