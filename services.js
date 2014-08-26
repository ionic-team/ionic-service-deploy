.factory('UpdateService', function($q) {
  return {
    check: function() {
      var deferred = $q.defer();

      IonicUpdate.check(function(result) {
        deferred.resolve(result === 'true');
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },

    download: function() {
      var deferred = $q.defer();

      IonicUpdate.download(function(result) {
        if (result !== 'done') {
          deferred.notify(result);
        } else {
          deferred.resolve(result);
        }
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },

    extract: function() {
      var deferred = $q.defer();

      IonicUpdate.extract(function(result) {
        if (result !== 'done') {
          deferred.notify(result);
        } else {
          deferred.resolve(result);
        }
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },

    load: function() {
      IonicUpdate.redirect();
    },

    initialize: function(app_id) {
      IonicUpdate.initialize(app_id);
    }
  }
})
