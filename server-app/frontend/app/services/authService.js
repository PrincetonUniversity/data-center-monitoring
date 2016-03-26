(function(){

var serv = angular.module('dcsense.services');

var authService = serv.service('authService', function authenticate($q, $http, $location, $rootScope, $cookies) {

  var authenticatedUser = null;
  var registerStatus = null;

  return {

    isAuthorized: function (requiredAccessLevel) {
      var deferred = $q.defer();

      var ticket;
      if ($cookies.get('ticket')) {
        ticket = JSON.parse($cookies.get('ticket'));
      }
      else
        ticket = {username: '', ticket: '', expires: new Date()};

      var allowAccess = function () {
        deferred.resolve();
      };

      var disallowAccess = function (redirect) {
        var desiredPath = encodeURIComponent($location.path());
        if (redirect) { // Redirect to login page
          if (desiredPath) {
            $location.url('/?r=' + desiredPath);
          }
          else {
            $location.url('/');
          }
          $rootScope.$on('$locationChangeSuccess', function (next, current) {
              deferred.resolve();
          });
        }
        else { // Display access forbidden page
          $location.url('/forbidden');
          $rootScope.$on('$locationChangeSuccess', function (next, current) {
              deferred.resolve();
          });
        }
      };


      $http.post('/api/auth/sessionstatus', {ticket: ticket, accessLevel: requiredAccessLevel})
        .success(function (data, status, headers, config) {
          if ($location.path() == '/') {
            $location.url('/dashboard');
            $rootScope.$on('$locationChangeSuccess', function (next, current) {
                deferred.resolve();
            });
          }
          else
            allowAccess();
        })
        .error(function (data, status, headers, config) {
          if ($location.path() == '/')
            allowAccess();
          else
            disallowAccess(!data.loggedIn); // redirect the user to the login page only if they are logged out
        });

      return deferred.promise;
    }

  }
});

})();
