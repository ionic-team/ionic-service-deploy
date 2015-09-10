// Add Angular integrations if Angular is available
if ((typeof angular === 'object') && angular.module) {
  angular.module('ionic.service.deploy', [])

  .factory('$ionicDeploy', [function() {
    return Ionic.Deploy;
  }]);
}
